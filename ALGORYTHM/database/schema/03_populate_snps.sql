-- First, let's check the structure of our SNP table to ensure we match it
\d snp;

-- Clear existing data if needed
TRUNCATE TABLE snp CASCADE;

-- Strong Evidence SNPs
INSERT INTO snp (rsid, gene, risk_allele, effect, evidence_strength, category) VALUES
-- Pigmentation & Melanin Production
('rs1805007', 'MC1R', 'T', 'Associated with red hair, fair skin, and UV sensitivity', 'Strong', 'Pigmentation'),
('rs2228479', 'MC1R', 'A', 'Affects UV response and pigmentation', 'Strong', 'Pigmentation'),
('rs1126809', 'TYR', 'A', 'Affects melanin synthesis; linked to hyperpigmentation risk', 'Strong', 'Pigmentation'),
('rs16891982', 'SLC45A2', 'G', 'Influences melanin production and pigmentation', 'Strong', 'Pigmentation'),

-- Skin Hydration & Barrier Function
('rs61816761', 'FLG', 'A', 'Loss-of-function variant linked to eczema and dry skin', 'Strong', 'Barrier Function'),

-- Inflammation & Immune Response
('rs1800795', 'IL6', 'C', 'Influences inflammatory response; linked to acne/rosacea', 'Strong', 'Inflammation'),
('rs361525', 'TNF-α', 'A', 'Modulates inflammation; impacts conditions like psoriasis', 'Strong', 'Inflammation'),
('rs1800629', 'TNF-α', 'A', 'Pro-inflammatory variant exacerbates acne severity', 'Strong', 'Inflammation');

-- Moderate Evidence SNPs
INSERT INTO snp (rsid, gene, risk_allele, effect, evidence_strength, category) VALUES
-- Sun Sensitivity & DNA Repair
('rs13181', 'ERCC2', 'C', 'Impacts DNA repair capacity; linked to melanoma risk', 'Moderate', 'DNA Repair'),

-- Collagen Production & Skin Aging
('rs1799750', 'MMP1', 'G', 'Affects collagen breakdown; linked to wrinkles and photoaging', 'Moderate', 'Collagen'),
('rs1800012', 'COL1A1', 'T', 'Influences collagen type I synthesis; impacts skin elasticity', 'Moderate', 'Collagen'),

-- Antioxidant Defense
('rs4880', 'SOD2', 'G', 'Modulates oxidative stress response; impacts UV-induced damage', 'Moderate', 'Antioxidant'),
('rs1001179', 'CAT', 'A', 'Affects catalase activity; linked to reduced antioxidant protection', 'Moderate', 'Antioxidant');

-- Weak Evidence SNPs
INSERT INTO snp (rsid, gene, risk_allele, effect, evidence_strength, category) VALUES
-- Acne Susceptibility
('rs743572', 'CYP17A1', 'A', 'Regulates androgen synthesis; influences sebum production', 'Weak', 'Acne'),

-- Hormonal Influences
('rs2234693', 'ESR1', 'C', 'Estrogen receptor variant affecting skin thickness/hydration', 'Weak', 'Hormonal'),

-- Ingredient Sensitivity
('rs73341169', 'ALDH3A2', 'A', 'Affects fatty aldehyde metabolism; linked to retinoid irritation', 'Weak', 'Sensitivity'),
('rs2068888', 'CYP26A1', 'G', 'Influences retinoic acid metabolism; impacts retinoid efficacy', 'Weak', 'Sensitivity'),

-- Rosacea & Vascular
('rs17203410', 'HLA-DRA', 'A', 'Immune-related variant associated with rosacea risk', 'Weak', 'Rosacea'),
('rs1799983', 'NOS3', 'T', 'Affects nitric oxide production; influences flushing', 'Weak', 'Vascular'),

-- Circadian Rhythm
('rs1801260', 'CLOCK', 'C', 'Affects skin repair cycles; impacts nighttime product efficacy', 'Weak', 'Circadian');

-- Verify the data
SELECT category, evidence_strength, COUNT(*) 
FROM snp 
GROUP BY category, evidence_strength 
ORDER BY evidence_strength, category;
