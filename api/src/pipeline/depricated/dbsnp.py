import os
import requests
import pysam
from pipeline.data.helpers import read_yaml

class GenomicSampleProcessor:
    def __init__(self, data_contract):
        self.input_file = data_contract['input_file']
        self.output_file = data_contract['output_file']

    def download_dbsnp_vcf(self, genome_build='GRCh38'):
        url = f"https://ftp.ncbi.nih.gov/snp/organisms/human_9606_b{genome_build}_common_all/00-All.vcf.gz"
        local_filename = f"dbsnp_{genome_build}_common_all.vcf.gz"
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        return local_filename

    def _fetch_alt_allele(self, chrom, pos, dbsnp_vcf):
        try:
            record = next(dbsnp_vcf.fetch(chrom, pos - 1, pos))
            return record.alts[0]
        except StopIteration:
            return None

    def add_alternate_alleles(self, dbsnp_vcf):
        with open(self.input_file, "r") as infile, open(self.output_file, "w") as outfile:
            for line in infile:
                tokens = line.strip().split('\t')
                variant_id, chrom, pos, ref = tokens
                alt = self._fetch_alt_allele(chrom, int(pos), dbsnp_vcf)
                if alt:
                    outfile.write(
                        f"{variant_id}\t{chrom}\t{pos}\t{ref}\t{alt}\n")

data_contract = read_yaml('data_contract.yaml')
processor = GenomicSampleProcessor(data_contract)

# Choose 'GRCh37' or 'GRCh38' as the genome_build parameter
dbsnp_vcf_path = processor.download_dbsnp_vcf(genome_build='GRCh38')

# Make sure the VCF file is indexed, or create an index if it doesn't exist
if not pysam.TabixFile.is_tabix(dbsnp_vcf_path):
    pysam.tabix_index(dbsnp_vcf_path, preset="vcf")

dbsnp_vcf = pysam.TabixFile(dbsnp_vcf_path)
processor.add_alternate_alleles(dbsnp_vcf)
