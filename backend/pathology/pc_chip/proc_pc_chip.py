import PIL.Image as Image
from __future__ import division
import os
import cv2
import numpy as np
from openslide import OpenSlide
from backend.base import PreProc


class Proc_PC_CHIP(PreProc):

    def __init__(self, tissue_cat=None, output_shape=(299, 299)):
        super().__init__()
        self.output_shape = output_shape
        self.pred_dict, self.cat_pred_dict = PRED_DICT, CAT_PRED_DICT
        if tissue_cat is not None and tissue_cat not in self.cat_pred_dict:
            raise ValueError('Given Tissue Type is not Valid')
        self.tissue_cat = tissue_cat

    def procSlide(self, slide_path, dataset_path):
        slide = OpenSlide(slide_path)
        slide_name = os.path.splitext(slide_path).split('/')[-1]
        if not os.path.exists(dataset_path):
            os.makedirs(dataset_path)
        if str(slide.properties.values.__self__.get('tiff.ImageDescription')).split("|")[1] == "AppMag = 40":
            sz = 1024
            seq = 924
        else:
            sz = 512
            seq = 462
        [w, h] = slide.dimensions
        for x in range(1, w, seq):
            for y in range(1, h, seq):
                print(str(x) + ", " + str(y))
                img1 = slide.read_region(location=(x, y), level=0, size=(sz, sz))
                img11 = img1.convert("RGB")
                img111 = img11.resize((512, 512), Image.ANTIALIAS)
                grad = self.getGradientMagnitude(np.array(img111))
                unique, counts = np.unique(grad, return_counts=True)
                if counts[np.argwhere(unique <= 20)].sum() < 512 * 512 * 0.6:
                    img111.save(f'{dataset_path}/{slide_name}_x{x}_y{y}.jpg', 'JPEG',
                                optimize=True, quality=94)

    def preProc(self, image_path, save=False):
        im = Image.open(image_path).resize(self.output_shape)
        image_data = (((np.array(im) / 255.0) - 0.5) * 2.0)[np.newaxis]
        if save:
            im.save('proc_image.jpg')
        return image_data

    def postProc(self, raw_output):
        if self.tissue_cat is not None:
            if self.tissue_cat in self.cat_pred_dict:
                normal_ix, tumor_ix = self.cat_pred_dict[self.tissue_cat][0], self.cat_pred_dict[self.tissue_cat][1]
                all_preds = {self.pred_dict[normal_ix]: raw_output[0][normal_ix],
                             self.pred_dict[tumor_ix]: raw_output[0][tumor_ix]}
                max_pred = dict((max(all_preds.items(), key=lambda pair: pair[1]),))
                return max_pred, all_preds

            else:
                raise ValueError('Given Tissue Type is not Valid')

        else:
            max_ix = np.argmax(raw_output)
            max_pred = {self.pred_dict[max_ix]: raw_output[0][max_ix]}
            all_preds = {self.pred_dict[label_ix]: pred_val for label_ix, pred_val in enumerate(raw_output[0])}
            return max_pred, all_preds

    @staticmethod
    def getGradientMagnitude(im):
        "Get magnitude of gradient for given image"
        im = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
        ddepth = cv2.CV_32F
        dx = cv2.Sobel(im, ddepth, 1, 0)
        dy = cv2.Sobel(im, ddepth, 0, 1)
        dxabs = cv2.convertScaleAbs(dx)
        dyabs = cv2.convertScaleAbs(dy)
        mag = cv2.addWeighted(dxabs, 0.5, dyabs, 0.5, 0)
        return mag


PRED_DICT = {0: "TCGA_ACC_tumor",
             1: "TCGA_BLCA_tumor",
             2: "TCGA_BRCA_normal", 3: "TCGA_BRCA_tumor",
             4: "TCGA_CESC_tumor",
             5: "TCGA_COAD_normal", 6: "TCGA_COAD_tumor",
             7: "TCGA_ESCA_normal", 8: "TCGA_ESCA_tumor",
             9: "TCGA_GBM_tumor",
             10: "TCGA_HNSC_normal", 11: "TCGA_HNSC_tumor",
             12: "TCGA_KICH_normal", 13: "TCGA_KICH_tumor",
             14: "TCGA_KIRC_normal", 15: "TCGA_KIRC_tumor",
             16: "TCGA_KIRP_normal", 17: "TCGA_KIRP_tumor",
             18: "TCGA_LGG_tumor",
             19: "TCGA_LIHC_normal", 20: "TCGA_LIHC_tumor",
             21: "TCGA_LUAD_normal", 22: "TCGA_LUAD_tumor",
             23: "TCGA_LUSC_normal", 24: "TCGA_LUSC_tumor",
             25: "TCGA_MESO_tumor",
             26: "TCGA_OV_normal", 27: "TCGA_OV_tumor",
             28: "TCGA_PCPG_tumor",
             29: "TCGA_PRAD_normal", 30: "TCGA_PRAD_tumor",
             31: "TCGA_READ_tumor",
             32: "TCGA_SARC_tumor",
             33: "TCGA_STAD_normal", 34: "TCGA_STAD_tumor",
             35: "TCGA_TGCT_tumor",
             36: "TCGA_THCA_normal", 37: "TCGA_THCA_tumor",
             38: "TCGA_THYM_tumor",
             39: "TCGA_UCEC_tumor",
             40: "TCGA_UVM_tumor",
             41: "TCGA_SKCM_tumor"}

CAT_PRED_DICT = {'BRCA': (2, 3),
                 'COAD': (5, 6),
                 'ESCA': (7, 8),
                 'HNSC': (10, 11),
                 'KICH': (12, 13),
                 'KIRC': (14, 15),
                 'KIRP': (16, 17),
                 'LIHC': (19, 20),
                 'LUAD': (21, 22),
                 'LUSC': (23, 24),
                 'OV': (26, 27),
                 'PRAD': (29, 30),
                 'STAD': (33, 34),
                 'THCA': (36, 37)}
