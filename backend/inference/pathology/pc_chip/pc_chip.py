from inference.base import Model
from .model.pc_chip_arch_v1 import PC_CHiP_arch
from .proc_pc_chip import Proc_PC_CHIP
import tf_slim as slim
import tensorflow.compat.v1 as tf

import os
import sys
import subprocess
import pathlib

tf.compat.v1.disable_eager_execution()

NUM_CLASSES = 42


class PC_CHiP(Model):
    def __init__(self, version: str = 'og'):
        super().__init__()
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

        def model(images):
            with slim.arg_scope(args):
                return PC_CHiP_arch(images, NUM_CLASSES, is_training=False, version=version)

        self.model = model
        curDir = pathlib.Path(__file__).parent.absolute()
        checkpoint_paths = {'og': f'{curDir}/model/Retrained_Inception_v4',
                            'alt': f'{curDir}/model/Retrained_Inception_v4_alt'}
        if not os.path.exists(checkpoint_paths[version]):
            print('Downloading PC-CHiP Model Files...')
            os.chmod(f"{curDir}/setup.sh", 0o755)
            subprocess.call([f"{curDir}/setup.sh", curDir, version], stdout=sys.stdout, stderr=subprocess.STDOUT)
        checkpoint_path = f'{checkpoint_paths[version]}/model.ckpt-100000'
        self._image_data = tf.placeholder(tf.float32, shape=(1, 299, 299, 3))
        logits, _ = self.model(self._image_data)
        self._probabilities = tf.nn.softmax(logits)
        init_fn = slim.assign_from_checkpoint_fn(checkpoint_path, slim.get_model_variables('InceptionV4'))
        self.model = tf.Session()
        init_fn(self.model)

    def predict(self, image_dataset, tissue_cat=None, separate=False):
        preds_all = []
        pre_proc = Proc_PC_CHIP(tissue_cat)
        if type(image_dataset) != list:
            image_path_list = [f'{image_dataset}/{x}' for x in os.listdir(image_dataset)]
        else:
            image_path_list = image_dataset
        for image_path in image_path_list:
            proc_image = pre_proc.preProc(image_path)
            im_pred = self.model.run(self._probabilities, feed_dict={self._image_data: proc_image})
            proc_pred = pre_proc.postProc(im_pred)
            preds_all.append([image_path,proc_pred])

        return preds_all
