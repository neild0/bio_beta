from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline, \
    AutoModelForTokenClassification, TokenClassificationPipeline

from base import Model
from .preproc_protTrans import PreProc_protTrans

import sys
import os
import subprocess
import pathlib


class ProtTrans(Model):
    def __init__(self, models_dict=None):
        super().__init__()
        if models_dict is None:
            models_dict = {'MS': 'Rostlab/prot_bert_bfd_membrane', 'SS3': 'Rostlab/prot_bert_bfd_ss3',
                           'LCL': 'Rostlab/prot_bert_bfd_localization'}

        if 'transformers' not in sys.modules:
            curDir = pathlib.Path(__file__).parent.absolute()
            print('Downloading Transfomer Files...')
            os.chmod(f"{curDir}/setup.sh", 0o755)
            subprocess.call([f"{curDir}/setup.sh"], stdout=sys.stdout, stderr=subprocess.STDOUT)

        self.MS_pipeline = TextClassificationPipeline(
            model=AutoModelForSequenceClassification.from_pretrained(models_dict['MS']),
            tokenizer=AutoTokenizer.from_pretrained(models_dict['MS']),
            device=0,
            return_all_scores=True
        )

        self.SS3_pipeline = TokenClassificationPipeline(
            model=AutoModelForTokenClassification.from_pretrained(models_dict['SS3']),
            tokenizer=AutoTokenizer.from_pretrained(models_dict['SS3'], skip_special_tokens=True),
            device=0
        )

        self.LCL_pipeline = TextClassificationPipeline(
            model=AutoModelForSequenceClassification.from_pretrained(models_dict['LCL']),
            tokenizer=AutoTokenizer.from_pretrained(models_dict['LCL']),
            device=0,
            return_all_scores=True
        )

        self.preProc = PreProc_protTrans()

    def MS_predict(self, seq: str) -> dict:
        proc_seq = self.preProc.pred_preproc(seq)
        return self.MS_pipeline(proc_seq)

    def SS3_predict(self, seq: str) -> dict:
        proc_seq = self.preProc.pred_preproc(seq)
        return self.SS3_pipeline(proc_seq)

    def LCL_predict(self, seq: str) -> dict:
        proc_seq = self.preProc.pred_preproc(seq)
        return self.SS3_pipeline(proc_seq)
