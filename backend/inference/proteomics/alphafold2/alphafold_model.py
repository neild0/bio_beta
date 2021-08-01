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

protDir = "inference/proteomics/alphafold2/proteins"


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
                    model_name=model_name,
                    data_dir="inference/proteomics/alphafold2/",
                )
                if '1' in model_name or '2' in model_name:
                    model_config = config.model_config(model_name)
                    model_config.data.eval.num_ensemble = 1
                    self.model_runner_1 = model.RunModel(
                        model_config, model_params[model_name]
                    )
                if '3' in model_name or '4' in model_name or '5' in model_name:
                    model_config = config.model_config(model_name)
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
    def set_bfactor(pdb_data, bfac, idx_res, chains):
        b_pdb = ""
        for line in pdb_data.split("\n"):
            if line[0:6] == "ATOM  ":
                seq_id = int(line[22:26].strip()) - 1
                seq_id = np.where(idx_res == seq_id)[0][0]
                b_pdb += f"{line[:21]}{chains[seq_id]}{line[22:60]}{(bfac[seq_id]*100):3.0f}{line[66:]}\n"
        return b_pdb

    def predict_structure(
        self,
        feature_dict,
        Ls,
        model_params,
        use_model,
        do_relax=False,
        random_seed=0,
        save_pdb_to=None,
        num_best_kept=1,
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
        plddts, paes = {}, {}
        unrelaxed_pdb_lines = {}
        relaxed_pdb_lines = {}
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
                unrelaxed_pdb_lines[model_name] = protein.to_pdb(unrelaxed_protein)
                plddts[model_name] = prediction_result["plddt"]
                if "predicted_aligned_error" in prediction_result:
                    paes[model_name] = prediction_result["predicted_aligned_error"]
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
                    relaxed_pdb_lines[model_name] = relaxed_pdb_str
                    print(f"Relaxed Model {model_name}: {time.time() - start_time}")

        start_time = time.time()
        # TODO: implement pTM checks with pTM models

        # rerank models based on predicted lddt
        lddt_rank = sorted(plddts.keys(), key=lambda model: -1 * np.mean(plddts[model]))
        print(lddt_rank)
        out = {}
        print("reranking models based on avg. predicted lDDT")
        pdbs = {}
        for i, model in enumerate(lddt_rank):
            print(f"{model} PLDDTS: {np.mean(plddts[model])}")
            if i >= num_best_kept:
                break
            if not do_relax:
                pdbs[model] = self.set_bfactor(
                    unrelaxed_pdb_lines[model], plddts[model] / 100, idx_res, chains
                )
            else:
                pdbs[model] = self.set_bfactor(
                    relaxed_pdb_lines[model], plddts[model] / 100, idx_res, chains
                )

            if save_pdb_to:
                pdb_path = f"{save_pdb_to}.{model}.pdb"
                with open(pdb_path, "w") as f:
                    f.write(pdbs[model])

            out[model] = {"plddt": plddts[model], "pae": paes.get(model, None)}

        print(f"Ranked Model: {time.time() - start_time}")
        return out, pdbs

    def predict(
        self,
        sequence,
        msa_mode="UR+E",
        amber=False,
        templates=False,
        homooligomer=1,
        save_pdb_to=False,
        num_best_kept=1,
    ):
        start_time = time.time()
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
                f"{protDir.split('/')[-1]}/{jobname}",
                str(msa_mode == "UR+E"),
            ],
            shell=False,
            cwd="inference/proteomics/alphafold2",
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
        outs, pdbs = self.predict_structure(
            feature_dict,
            Ls=[len(sequence)] * homooligomer,
            model_params=self.model_params,
            use_model=self.use_model,
            do_relax=amber,
            save_pdb_to=save_pdb_to,
            num_best_kept=num_best_kept,
        )

        if msa_mode is None:
            del_file_list = ["single_sequence.a3m", "fasta"]
        else:
            del_file_list = ["a3m", "fasta", "m8"]

        for remFile in del_file_list:
            try:
                os.remove(f"{protDir}/{jobname}.{remFile}")
            except:
                print(f"Error in Deleting: {protDir}/{jobname}.{remFile}")
        return jobname, pdbs, outs
