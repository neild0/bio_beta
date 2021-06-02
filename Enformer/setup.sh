pip3 install kipoiseq==0.5.2 tensorflow tensorflow-hub
gsutil -q -m cp gs://dm-enformer/models/enformer.finetuned.SAD.robustscaler-PCA500-robustscaler.transform.pkl ./
wget -O - http://hgdownload.cse.ucsc.edu/goldenPath/hg38/bigZips/hg38.fa.gz | gunzip -c > genome.fa
wget https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz -O clinvar.vcf.gz
python3 -c "import pyfaidx; pyfaidx.Faidx('genome.fa')"