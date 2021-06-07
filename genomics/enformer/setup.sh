#!/bin/bash

mkdir ${1}/data
pip3 -q install kipoiseq==0.5.2 tensorflow tensorflow-hub
gsutil -q -m cp gs://dm-enformer/models/enformer.finetuned.SAD.robustscaler-PCA500-robustscaler.transform.pkl ${1}/data
wget -q --show-progress -O - http://hgdownload.cse.ucsc.edu/goldenPath/hg38/bigZips/hg38.fa.gz | gunzip -c > ${1}/data/genome.fa
wget -q --show-progress https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz -O ${1}/data/clinvar.vcf.gz
python3 -c "import pyfaidx; pyfaidx.Faidx('${1}/data/genome.fa')"