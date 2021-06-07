from base import PreProc
import re


class PreProc_protTrans(PreProc):

    def __init__(self):
        super().__init__()

    @staticmethod
    def pred_preproc(seqs, unk_char: str = 'X'):
        return [re.sub(r"[UZOB]", unk_char, " ".join(seq)) for seq in seqs]
