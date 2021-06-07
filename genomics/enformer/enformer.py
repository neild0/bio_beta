from base import Model
import tensorflow as tf
import tensorflow_hub as hub
import joblib
import gzip
import kipoiseq
from kipoiseq import Interval
import pyfaidx
import numpy as np

import os
import sys
import subprocess
import pathlib

SEQUENCE_LENGTH = 393216
TRANSFORM_PATH = 'data/enformer.finetuned.SAD.robustscaler-PCA500-robustscaler.transform.pkl'
FASTA_FILE = 'data/genome.fa'


class Enformer(Model):

    def __init__(self, species: str = 'human'):
        super().__init__()
        print('Loading Enformer Model')
        tfhub_url = 'https://tfhub.dev/deepmind/enformer/1'
        self._model = hub.load(tfhub_url).model
        self.species = species

        curDir = pathlib.Path(__file__).parent.absolute()
        if not os.path.exists(f'{curDir}/data'):
            print('Downloading Enformer Supplementary Files...')
            os.chmod(f"{curDir}/setup.sh", 0o755)
            subprocess.call([f"{curDir}/setup.sh", curDir], stdout=sys.stdout, stderr=subprocess.STDOUT)

    def predict(self, sequence):
        predictions = self._model.predict_on_batch(sequence)
        return {k: v.numpy() for k, v in predictions.items()}

    def predict_expression(self, data: str, chrom: str, start: int, end: int) -> dict:
        fasta_extractor = FastaStringExtractor(data)
        target_interval = kipoiseq.Interval(chrom, start, end)

        sequence_one_hot = self.one_hot_encode(fasta_extractor.extract(target_interval.resize(SEQUENCE_LENGTH)))[
            np.newaxis]
        predictions = self.predict(sequence_one_hot)
        return predictions[self.species][0]

    def variant_scoring(self, data: str, chrom: str, pos: int, ref_base: str, var_base: str, var_id: str) -> dict:
        variant = kipoiseq.Variant(chrom, pos, ref_base, var_base, var_id)
        fasta_extractor = FastaStringExtractor(data)

        interval = kipoiseq.Interval(variant.chrom, variant.start, variant.start).resize(SEQUENCE_LENGTH)
        seq_extractor = kipoiseq.extractors.VariantSeqExtractor(reference_sequence=fasta_extractor)
        center = interval.center() - interval.start

        reference = seq_extractor.extract(interval, [], anchor=center)
        alternate = seq_extractor.extract(interval, [variant], anchor=center)

        reference_prediction = self.predict(self.one_hot_encode(reference)[np.newaxis])[self.species][0]
        alternate_prediction = self.predict(self.one_hot_encode(alternate)[np.newaxis])[self.species][0]

        return {'reference': reference_prediction, 'variant': alternate_prediction}

    def score_var_raw(self, inputs):
        ref_prediction = self.predict(inputs['reference'])[self.species]
        alt_prediction = self._model.predict_on_batch(inputs['variant'])[self.species]

        return alt_prediction.mean(axis=1) - ref_prediction.mean(axis=1)

    @staticmethod
    def one_hot_encode(sequence):
        return kipoiseq.transforms.functional.one_hot_dna(sequence).astype(np.float32)

    @tf.function
    def contribution_input_grad(self, input_sequence,
                                target_mask, output_head='human'):
        input_sequence = input_sequence[tf.newaxis]

        target_mask_mass = tf.reduce_sum(target_mask)
        with tf.GradientTape() as tape:
            tape.watch(input_sequence)
            prediction = tf.reduce_sum(
                target_mask[tf.newaxis] *
                self._model.predict_on_batch(input_sequence)[output_head]) / target_mask_mass

        input_grad = tape.gradient(prediction, input_sequence) * input_sequence
        input_grad = tf.squeeze(input_grad, axis=0)
        return tf.reduce_sum(input_grad, axis=-1)


class EnformerScoreVariantsNormalized(Enformer):

    def __init__(self, transform_pkl_path: str = TRANSFORM_PATH, species='human'):
        assert self.species == 'human', 'Transforms only compatible with organism=human'
        super().__init__(species)
        with tf.io.gfile.GFile(transform_pkl_path, 'rb') as f:
            transform_pipeline = joblib.load(f)
        self._transform_norm = transform_pipeline.steps[0][1]
        self._transform_pca = transform_pipeline

    def score_var_norm(self, sequence, num_top_features: int = None):
        scores = self.score_var_raw(sequence)
        if num_top_features is not None:
            return self._transform_pca.transform(scores)[:, :num_top_features]
        else:
            return self._transform_norm.transform(scores)


class FastaStringExtractor:

    def __init__(self, fasta_file):
        self.fasta = pyfaidx.Fasta(fasta_file)
        self._chromosome_sizes = {k: len(v) for k, v in self.fasta.items()}

    def extract(self, interval: Interval, **kwargs) -> str:
        # Truncate interval if it extends beyond the chromosome lengths.
        chromosome_length = self._chromosome_sizes[interval.chrom]
        trimmed_interval = Interval(interval.chrom,
                                    max(interval.start, 0),
                                    min(interval.end, chromosome_length),
                                    )
        # pyfaidx wants a 1-based interval
        sequence = str(self.fasta.get_seq(trimmed_interval.chrom,
                                          trimmed_interval.start + 1,
                                          trimmed_interval.stop).seq).upper()
        # Fill truncated values with N's.
        pad_upstream = 'N' * max(-interval.start, 0)
        pad_downstream = 'N' * max(interval.end - chromosome_length, 0)
        return pad_upstream + sequence + pad_downstream

    def close(self):
        return self.fasta.close()


def variant_generator(vcf_file, gzipped=False):
    """Yields a kipoiseq.dataclasses.Variant for each row in VCF file."""

    def _open(file):
        return gzip.open(vcf_file, 'rt') if gzipped else open(vcf_file)

    with _open(vcf_file) as f:
        for line in f:
            if line.startswith('#'):
                continue
            chrom, pos, id, ref, alt_list = line.split('\t')[:5]
            # Split ALT alleles and return individual variants as output.
            for alt in alt_list.split(','):
                yield kipoiseq.dataclasses.Variant(chrom=chrom, pos=pos,
                                                   ref=ref, alt=alt, id=id)


def variant_centered_sequences(data, vcf_file, sequence_length, gzipped=False,
                               chr_prefix=''):
    seq_extractor = kipoiseq.extractors.VariantSeqExtractor(
        reference_sequence=FastaStringExtractor(data))

    for variant in variant_generator(vcf_file, gzipped=gzipped):
        interval = Interval(chr_prefix + variant.chrom,
                            variant.pos, variant.pos)
        interval = interval.resize(sequence_length)
        center = interval.center() - interval.start

        reference = seq_extractor.extract(interval, [], anchor=center)
        alternate = seq_extractor.extract(interval, [variant], anchor=center)

        yield {'inputs': {'ref': Enformer.one_hot_encode(reference),
                          'alt': Enformer.one_hot_encode(alternate)},
               'metadata': {'chrom': chr_prefix + variant.chrom,
                            'pos': variant.pos,
                            'id': variant.id,
                            'ref': variant.ref,
                            'alt': variant.alt}}
