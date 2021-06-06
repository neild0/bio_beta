import functools

from base import Model
from .pc_chip_arch_v1 import PC_CHiP_arch
from .tf_image_preproc import PC_CHIP_Image_PreProc
import tf_slim as slim
import tensorflow.compat.v1 as tf

tf.compat.v1.disable_eager_execution()

NUM_CLASSES = 42


class PC_CHiP(Model):
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

        def model(images):
            with slim.arg_scope(args):
                return PC_CHiP_arch(images, NUM_CLASSES, is_training=False, version=version)

        self.model = model

        checkpoint_paths = {'og': '/home/neil/unicorn/backend/pathology/pc_chip/Retrained_Inception_v4', 'alt': './Retrained_Inception_v4_alt'}
        # self.checkpoint_path = tf.train.import_meta_graph(f'{checkpoint_paths[version]}/model.ckpt-100000')
        self.checkpoint_path = f'{checkpoint_paths[version]}/model.ckpt-100000'

        print(checkpoint_paths[version])
        print(self.checkpoint_path)
    def predict(self, image_path_list):
        image_data = tf.placeholder(tf.float32, shape=(1, 299, 299, 3))
        logits, _ = self.model(image_data)
        probabilities = tf.nn.softmax(logits)
        init_fn = slim.assign_from_checkpoint_fn(self.checkpoint_path, slim.get_model_variables('InceptionV4'))
        sess = tf.Session()
        init_fn(sess)

        fto_bot = open('./output.txt', 'w')
        for image_path in image_path_list:
            pre_proc = PC_CHIP_Image_PreProc()
            proc_image = pre_proc.process(image_path)
            preds = sess.run(probabilities, feed_dict={image_data: proc_image})
            bottleneck_values = sess.run('InceptionV4/Logits/AvgPool_1a/AvgPool:0', {image_data: proc_image})
            for p in range(len(preds[0])):
                fto_bot.write('\t' + str(preds[0][p]))
            for p in range(len(bottleneck_values[0][0][0])):
                fto_bot.write('\t' + str(bottleneck_values[0][0][0][p]))
            fto_bot.write('\n')
        fto_bot.close()
        sess.close()
