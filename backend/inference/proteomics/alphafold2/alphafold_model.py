#
# from inference.base import Model
# from .preproc_protTrans import Proc_protTrans
#
import os
import mock
import numpy as np
import pickle
from typing import Dict
import matplotlib.pyplot as plt

from inference.proteomics.alphafold2.alphafold.common import protein
from inference.proteomics.alphafold2.alphafold.data import pipeline
from inference.proteomics.alphafold2.alphafold.data import templates
from inference.proteomics.alphafold2.alphafold.model import data
from inference.proteomics.alphafold2.alphafold.model import config
from inference.proteomics.alphafold2.alphafold.model import model

import os


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
