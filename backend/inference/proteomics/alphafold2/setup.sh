#!/bin/bash

apt-get -qq -y update 2>&1 1>/dev/null
apt-get -qq -y install jq curl zlib1g gawk 2>&1 1>/dev/null
pip -q install biopython 2>&1 1>/dev/null
pip -q install dm-haiku 2>&1 1>/dev/null
pip -q install ml-collections 2>&1 1>/dev/null
pip -q install py3Dmol 2>&1 1>/dev/null

git clone https://github.com/deepmind/inference.proteomics.alphafold2.alphafold.git --quiet
mv alphafold alphafold_
mv alphafold_/alphafold .

wget -qnc https://storage.googleapis.com/alphafold/alphafold_params_2021-07-14.tar
mkdir params
tar -xf alphafold_params_2021-07-14.tar -C params/
rm alphafold_params_2021-07-14.tar

conda install -y -q -c conda-forge -c bioconda kalign3=3.2.2 hhsuite=3.3.0 python=3.7 2>&1 1>/dev/null

conda install -y -q -c conda-forge openmm=7.5.1 python=3.7 pdbfixer 2>&1 1>/dev/null
(cd /usr/local/lib/python3.7/site-packages; patch -s -p0 < alphafold_/docker/openmm.patch)

wget -qnc https://git.scicore.unibas.ch/schwede/openstructure/-/raw/7102c63615b64735c4941278d92b554ec94415f8/modules/mol/alg/src/stereo_chemical_props.txt
mv stereo_chemical_props.txt alphafold/common/