#
# from inference.base import Model
# from .preproc_protTrans import Proc_protTrans
#
import hashlib
import os
import re
import subprocess
import time
from string import ascii_uppercase

import mock
import numpy as np
import pickle
from typing import Dict
import matplotlib.pyplot as plt

import warnings

# from absl import logging
# import tensorflow as tf

warnings.filterwarnings("ignore")
# logging.set_verbosity("error")
# os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
# tf.get_logger().setLevel("ERROR")

import sys

from inference.proteomics.alphafold2.alphafold.common import protein
from inference.proteomics.alphafold2.alphafold.data import pipeline
from inference.proteomics.alphafold2.alphafold.data import templates
from inference.proteomics.alphafold2.alphafold.model import data
from inference.proteomics.alphafold2.alphafold.model import config
from inference.proteomics.alphafold2.alphafold.model import model
from inference.proteomics.alphafold2.alphafold.data.tools import hhsearch

sys.path.insert(0, "/usr/local/lib/python3.7/site-packages/")
from inference.proteomics.alphafold2.alphafold.relax import relax

protDir = "proteins"


class AlphaFold:
    def __init__(self, models=["model_1"]):
        super().__init__()

        model_runners = {}
        for model_name in models:
            model_config = config.model_config(model_name)
            model_config.data.eval.num_ensemble = 1
            model_params = data.get_model_haiku_params(
                model_name=model_name, data_dir="inference/proteomics/alphafold2/"
            )
            model_runner = model.RunModel(model_config, model_params)
            model_runners[model_name] = model_runner

        self.model_runners = model_runners

    @staticmethod
    def mk_mock_template(query_sequence):
        # mock template features
        output_templates_sequence = []
        output_confidence_scores = []
        templates_all_atom_positions = []
        templates_all_atom_masks = []

        for _ in query_sequence:
            templates_all_atom_positions.append(
                np.zeros((templates.residue_constants.atom_type_num, 3))
            )
            templates_all_atom_masks.append(
                np.zeros(templates.residue_constants.atom_type_num)
            )
            output_templates_sequence.append("-")
            output_confidence_scores.append(-1)
        output_templates_sequence = "".join(output_templates_sequence)
        templates_aatype = templates.residue_constants.sequence_to_onehot(
            output_templates_sequence, templates.residue_constants.HHBLITS_AA_TO_ID
        )

        template_features = {
            "template_all_atom_positions": np.array(templates_all_atom_positions)[None],
            "template_all_atom_masks": np.array(templates_all_atom_masks)[None],
            "template_sequence": [f"none".encode()],
            "template_aatype": np.array(templates_aatype)[None],
            "template_confidence_scores": np.array(output_confidence_scores)[None],
            "template_domain_names": [f"none".encode()],
            "template_release_date": [f"none".encode()],
        }

        return template_features

    @staticmethod
    def predict_structure(
        loc: str,
        data_pipeline: pipeline.DataPipeline,
        model_runners: Dict[str, model.RunModel],
        random_seed: int,
    ):

        """Predicts structure using AlphaFold for the given sequence."""

        # Get features.
        feature_dict = data_pipeline.process()

        # Run the models.
        plddts = {}
        for model_name, model_runner in model_runners.items():
            processed_feature_dict = model_runner.process_features(
                feature_dict, random_seed=random_seed
            )
            prediction_result = model_runner.predict(processed_feature_dict)
            unrelaxed_protein = protein.from_prediction(
                processed_feature_dict, prediction_result
            )
            plddts[model_name] = prediction_result["plddt"]

            with open(loc, "w") as f:
                f.write(protein.to_pdb(unrelaxed_protein))
        return plddts

    def predict(self, query_sequence, loc):
        print("Running")
        data_pipeline_mock = mock.Mock()
        data_pipeline_mock.process.return_value = {
            **pipeline.make_sequence_features(
                sequence=query_sequence, description="none", num_res=len(query_sequence)
            ),
            **pipeline.make_msa_features(
                msas=[[query_sequence]], deletion_matrices=[[[0] * len(query_sequence)]]
            ),
            **self.mk_mock_template(query_sequence),
        }
        print("Predicting structure")
        plddts = self.predict_structure(
            loc=loc,
            data_pipeline=data_pipeline_mock,
            model_runners=self.model_runners,
            random_seed=0,
        )
        print("Predicted")


class AlphaFold2:
    def __init__(self, models=["model_1"]):
        super().__init__()
        start_time = time.time()
        use_model = {}
        if "model_params" not in dir():
            model_params = {}
        for model_name in models:
            use_model[model_name] = True
            if model_name not in model_params:
                model_params[model_name] = data.get_model_haiku_params(
                    model_name=model_name + "_ptm",
                    data_dir="inference/proteomics/alphafold2/",
                )
                if model_name == "model_1":
                    model_config = config.model_config(model_name + "_ptm")
                    model_config.data.eval.num_ensemble = 1
                    self.model_runner_1 = model.RunModel(
                        model_config, model_params[model_name]
                    )
                if model_name == "model_3":
                    model_config = config.model_config(model_name + "_ptm")
                    model_config.data.eval.num_ensemble = 1
                    self.model_runner_3 = model.RunModel(
                        model_config, model_params[model_name]
                    )

        self.model_params, self.use_model = model_params, use_model
        print(f"Loaded Models: {time.time() - start_time}")

    @staticmethod
    def mk_mock_template(query_sequence):
        # since alphafold's model requires a template input
        # we create a blank example w/ zero input, confidence -1
        ln = len(query_sequence)
        output_templates_sequence = "-" * ln
        output_confidence_scores = np.full(ln, -1)
        templates_all_atom_positions = np.zeros(
            (ln, templates.residue_constants.atom_type_num, 3)
        )
        templates_all_atom_masks = np.zeros(
            (ln, templates.residue_constants.atom_type_num)
        )
        templates_aatype = templates.residue_constants.sequence_to_onehot(
            output_templates_sequence, templates.residue_constants.HHBLITS_AA_TO_ID
        )
        template_features = {
            "template_all_atom_positions": templates_all_atom_positions[None],
            "template_all_atom_masks": templates_all_atom_masks[None],
            "template_sequence": [f"none".encode()],
            "template_aatype": np.array(templates_aatype)[None],
            "template_confidence_scores": output_confidence_scores[None],
            "template_domain_names": [f"none".encode()],
            "template_release_date": [f"none".encode()],
        }
        return template_features

    @staticmethod
    def mk_template(jobname, query_sequence):
        template_featurizer = templates.TemplateHitFeaturizer(
            mmcif_dir="templates/",
            max_template_date="2100-01-01",
            max_hits=20,
            kalign_binary_path="kalign",
            release_dates_path=None,
            obsolete_pdbs_path=None,
        )

        hhsearch_pdb70_runner = hhsearch.HHSearch(
            binary_path="hhsearch", databases=[jobname]
        )

        a3m_lines = "\n".join(open(f"{jobname}.a3m", "r").readlines())
        hhsearch_result = hhsearch_pdb70_runner.query(a3m_lines)
        hhsearch_hits = pipeline.parsers.parse_hhr(hhsearch_result)
        templates_result = template_featurizer.get_templates(
            query_sequence=query_sequence,
            query_pdb_code=None,
            query_release_date=None,
            hits=hhsearch_hits,
        )
        return templates_result.features

    @staticmethod
    def set_bfactor(pdb_filename, bfac, idx_res, chains):
        I = open(pdb_filename, "r").readlines()
        O = open(pdb_filename, "w")
        for line in I:
            if line[0:6] == "ATOM  ":
                seq_id = int(line[22:26].strip()) - 1
                seq_id = np.where(idx_res == seq_id)[0][0]
                O.write(
                    f"{line[:21]}{chains[seq_id]}{line[22:60]}{bfac[seq_id]:6.2f}{line[66:]}"
                )
        O.close()

    def predict_structure(
        self,
        prefix,
        feature_dict,
        Ls,
        model_params,
        use_model,
        do_relax=False,
        random_seed=0,
    ):
        """Predicts structure using AlphaFold for the given sequence."""
        start_time = time.time()
        # Minkyung's code
        # add big enough number to residue index to indicate chain breaks
        idx_res = feature_dict["residue_index"]
        L_prev = 0
        # Ls: number of residues in each chain
        for L_i in Ls[:-1]:
            idx_res[L_prev + L_i :] += 200
            L_prev += L_i
        chains = list("".join([ascii_uppercase[n] * L for n, L in enumerate(Ls)]))
        feature_dict["residue_index"] = idx_res

        # Run the models.
        plddts, paes = [], []
        unrelaxed_pdb_lines = []
        relaxed_pdb_lines = []
        print(f"Init Model: {time.time() - start_time}")

        for model_name, params in model_params.items():
            if model_name in use_model:
                print(f"running {model_name}")
                # swap params to avoid recompiling
                # note: models 1,2 have diff number of params compared to models 3,4,5
                start_time = time.time()

                if any(str(m) in model_name for m in [1, 2]):
                    model_runner = self.model_runner_1
                if any(str(m) in model_name for m in [3, 4, 5]):
                    model_runner = self.model_runner_3
                model_runner.params = params

                processed_feature_dict = model_runner.process_features(
                    feature_dict, random_seed=random_seed
                )
                prediction_result = model_runner.predict(processed_feature_dict)
                unrelaxed_protein = protein.from_prediction(
                    processed_feature_dict, prediction_result
                )
                unrelaxed_pdb_lines.append(protein.to_pdb(unrelaxed_protein))
                plddts.append(prediction_result["plddt"])
                paes.append(prediction_result["predicted_aligned_error"])
                print(f"Ran Model {model_name}: {time.time() - start_time}")

                if do_relax:
                    # Relax the prediction.
                    amber_relaxer = relax.AmberRelaxation(
                        max_iterations=0,
                        tolerance=2.39,
                        stiffness=10.0,
                        exclude_residues=[],
                        max_outer_iterations=20,
                    )
                    relaxed_pdb_str, _, _ = amber_relaxer.process(
                        prot=unrelaxed_protein
                    )
                    relaxed_pdb_lines.append(relaxed_pdb_str)
                    print(f"Relaxed Model {model_name}: {time.time() - start_time}")

        start_time = time.time()
        # rerank models based on predicted lddt
        print(
            np.mean(plddts, -1),
            np.mean(plddts, -1).argsort(),
            np.mean(plddts, -1).argsort()[::-1],
        )
        lddt_rank = np.mean(plddts, -1).argsort()[::-1]
        out = {}
        print("reranking models based on avg. predicted lDDT")
        for n, r in enumerate(lddt_rank):
            print(f"model_{n + 1} {r + 1} {np.mean(plddts[r])}")

            unrelaxed_pdb_path = f"{prefix}.pdb"
            with open(unrelaxed_pdb_path, "w") as f:
                f.write(unrelaxed_pdb_lines[r])
            self.set_bfactor(unrelaxed_pdb_path, plddts[r] / 100, idx_res, chains)

            if do_relax:
                relaxed_pdb_path = f"{prefix}.pdb"
                with open(relaxed_pdb_path, "w") as f:
                    f.write(relaxed_pdb_lines[r])
                self.set_bfactor(relaxed_pdb_path, plddts[r] / 100, idx_res, chains)

            out[f"model_{n + 1}"] = {"plddt": plddts[r], "pae": paes[r]}
        print(f"Ranked Model: {time.time() - start_time}")
        return out

    def predict(
        self, sequence, msa_mode="UR+E", amber=False, templates=False, homooligomer=1
    ):
        start_time = time.time()
        os.chdir("inference/proteomics/alphafold2")
        if homooligomer > 1:
            amber = False
            templates = False

        def getJob(name):
            return (
                re.sub(r"\W+", "", name)
                + "_"
                + hashlib.sha1(sequence.encode()).hexdigest()[:5]
            )

        jobname = hashlib.sha1(sequence.encode()).hexdigest()

        with open(f"{protDir}/{jobname}.fasta", "w") as text_file:
            text_file.write(">null\n%s" % sequence)

        if msa_mode is not None:
            a3m_file = f"{protDir}/{jobname}.a3m"
        else:
            a3m_file = f"{protDir}/{jobname}.single_sequence.a3m"
            with open(a3m_file, "w") as text_file:
                text_file.write(">1\n%s" % sequence)
        subprocess.check_call(
            [
                "./getMSA.sh",
                str(amber),
                str(msa_mode is not None),
                str(templates),
                f"{protDir}/{jobname}",
                str(msa_mode == "UR+E"),
            ],
            shell=False,
        )
        print(f"Ran MSA: {time.time() - start_time}")

        if templates and os.path.isfile(f"{protDir}/{jobname}_hhm.ffindex"):
            template_features = self.mk_template(jobname)
        else:
            template_features = self.mk_mock_template(sequence * homooligomer)

        a3m_lines = "".join(open(a3m_file, "r").readlines())
        msa, deletion_matrix = pipeline.parsers.parse_a3m(a3m_lines)

        if homooligomer == 1:
            msas = [msa]
            deletion_matrices = [deletion_matrix]
        else:
            # make multiple copies of msa for each copy
            # AAA------
            # ---AAA---
            # ------AAA
            #
            # note: if you concat the sequences (as below), it does NOT work
            # AAAAAAAAA
            msas = []
            deletion_matrices = []
            Ln = len(sequence)
            for o in range(homooligomer):
                L = Ln * o
                R = Ln * (homooligomer - (o + 1))
                msas.append(["-" * L + seq + "-" * R for seq in msa])
                deletion_matrices.append(
                    [[0] * L + mtx + [0] * R for mtx in deletion_matrix]
                )
        print(f"Parse Templates/MSA: {time.time() - start_time}")

        feature_dict = {
            **pipeline.make_sequence_features(
                sequence=sequence * homooligomer,
                description="none",
                num_res=len(sequence) * homooligomer,
            ),
            **pipeline.make_msa_features(
                msas=msas, deletion_matrices=deletion_matrices
            ),
            **template_features,
        }
        outs = self.predict_structure(
            f"../../../uploads/proteins/{jobname}",
            feature_dict,
            Ls=[len(sequence)] * homooligomer,
            model_params=self.model_params,
            use_model=self.use_model,
            do_relax=amber,
        )
        for remFile in ["a3m", "fasta", "m8"]:
            os.remove(f"{protDir}/{jobname}.{remFile}")
        os.chdir("../../..")
        return jobname
