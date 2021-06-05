import functools

from base import Model
from pc_chip_arch_v1 import PC_CHiP_arch
from tf_image_preproc import PC_CHIP_Image_PreProc
import tf_slim as slim
import tensorflow.compat.v1 as tf

NUM_CLASSES = 42

class PC_CHIP(Model):
    def __init__(self, version: str = 'og'):
        normalizer_fn = slim.batch_norm
        normalizer_params = {
                              'decay': 0.9997,
                              'epsilon': 0.001,
                              'updates_collections': tf.GraphKeys.UPDATE_OPS,
                            }
        with slim.arg_scope([slim.conv2d, slim.fully_connected],
                            weights_regularizer=slim.l2_regularizer(0.0)):
            with slim.arg_scope(
                    [slim.conv2d],
                    weights_initializer=slim.variance_scaling_initializer(),
                    activation_fn=tf.nn.relu,
                    normalizer_fn=normalizer_fn,
                    normalizer_params=normalizer_params) as sc:
                args = sc
        def network_fn(images):
            with slim.arg_scope(args):
                self.model = PC_CHiP_arch(images, NUM_CLASSES, is_training=False, version = version)

    def predict(self, image_path_list):
        pre_proc = PC_CHIP_Image_PreProc()
        for image in image_path_list:
            proc_image = pre_proc(image)
            logits, _ = self.model(proc_image)
