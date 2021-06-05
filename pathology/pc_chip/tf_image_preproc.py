from base import PreProc
import tensorflow as tf
import PIL.Image as Image
import numpy as np

class PC_CHIP_Image_PreProc(PreProc):

    def __init__(self, output_shape):
        self.output_shape = output_shape

    def process(self, image_path):
        im = Image.open(image_path).resize(self.output_shape)
        image_data = (((np.array(im) / 255.0) - 0.5) * 2.0)[np.newaxis]

        return image_data

