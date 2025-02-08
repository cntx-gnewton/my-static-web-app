-- First, create the routine step enum type
CREATE TYPE routine_step_type AS ENUM ('Cleanser', 'Treatment', 'Moisturizer', 'Sun Protection');

-- Create core product table first
CREATE TABLE IF NOT EXISTS product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    brand VARCHAR,
    type VARCHAR,
    description TEXT,
    directions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create taxonomies
CREATE TABLE IF NOT EXISTS product_benefit (
    benefit_id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    category VARCHAR,  -- Maps to our existing categories (e.g., 'Barrier Function', 'Pigmentation')
    description TEXT
);

CREATE TABLE IF NOT EXISTS product_aspect (
    aspect_id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    category VARCHAR,  -- e.g., 'Texture', 'Application Method', 'Skin Type'
    description TEXT
);

CREATE TABLE IF NOT EXISTS product_concern (
    concern_id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    related_characteristic VARCHAR,
    description TEXT
);

-- Create product routine positioning
CREATE TABLE IF NOT EXISTS product_routine_position (
    position_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(product_id),
    routine_step routine_step_type NOT NULL,
    step_order INTEGER,
    UNIQUE (product_id, routine_step)
);

-- Create linking tables
CREATE TABLE IF NOT EXISTS product_ingredient_link (
    product_id INTEGER REFERENCES product(product_id),
    ingredient_id INTEGER REFERENCES ingredient(ingredient_id),
    is_active BOOLEAN DEFAULT false,
    concentration_percentage DECIMAL,
    PRIMARY KEY (product_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS product_benefit_link (
    product_id INTEGER REFERENCES product(product_id),
    benefit_id INTEGER REFERENCES product_benefit(benefit_id),
    strength VARCHAR CHECK (strength IN ('Primary', 'Secondary')),
    PRIMARY KEY (product_id, benefit_id)
);

CREATE TABLE IF NOT EXISTS product_aspect_link (
    product_id INTEGER REFERENCES product(product_id),
    aspect_id INTEGER REFERENCES product_aspect(aspect_id),
    PRIMARY KEY (product_id, aspect_id)
);

CREATE TABLE IF NOT EXISTS product_concern_link (
    product_id INTEGER REFERENCES product(product_id),
    concern_id INTEGER REFERENCES product_concern(concern_id),
    PRIMARY KEY (product_id, concern_id)
);

-- Create genetic suitability scoring table
CREATE TABLE IF NOT EXISTS product_genetic_suitability (
    product_id INTEGER REFERENCES product(product_id),
    snp_id INTEGER REFERENCES snp(snp_id),
    suitability_score INTEGER CHECK (suitability_score BETWEEN -2 AND 2),
    reason TEXT,
    PRIMARY KEY (product_id, snp_id)
);

-- Create helper functions for processing list fields
CREATE OR REPLACE FUNCTION split_and_clean_list(input_text TEXT)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT trim(both ' "''' FROM unnest)
        FROM unnest(string_to_array(
            CASE 
                WHEN input_text LIKE '[%]' THEN 
                    trim(both '[]' FROM input_text)
                ELSE 
                    input_text
            END, 
            ','
        ))
        WHERE trim(both ' "''' FROM unnest) != ''
    );
END;
$$ LANGUAGE plpgsql;

-- Function to safely insert a benefit and return its ID
CREATE OR REPLACE FUNCTION get_or_create_benefit(benefit_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    benefit_id INTEGER;
BEGIN
    SELECT pb.benefit_id INTO benefit_id
    FROM product_benefit pb
    WHERE pb.name = benefit_name;
    
    IF benefit_id IS NULL THEN
        INSERT INTO product_benefit (name)
        VALUES (benefit_name)
        RETURNING benefit_id INTO benefit_id;
    END IF;
    
    RETURN benefit_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_name ON product(name);
CREATE INDEX IF NOT EXISTS idx_product_brand ON product(brand);
CREATE INDEX IF NOT EXISTS idx_product_type ON product(type);

-- Create views for data access and validation
CREATE OR REPLACE VIEW product_details AS
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.type,
    p.description,
    array_agg(DISTINCT i.name) FILTER (WHERE i.name IS NOT NULL) as ingredients,
    array_agg(DISTINCT pb.name) FILTER (WHERE pb.name IS NOT NULL) as benefits,
    array_agg(DISTINCT pa.name) FILTER (WHERE pa.name IS NOT NULL) as aspects,
    array_agg(DISTINCT pc.name) FILTER (WHERE pc.name IS NOT NULL) as concerns,
    prp.routine_step
FROM product p
LEFT JOIN product_ingredient_link pil ON p.product_id = pil.product_id
LEFT JOIN ingredient i ON pil.ingredient_id = i.ingredient_id
LEFT JOIN product_benefit_link pbl ON p.product_id = pbl.product_id
LEFT JOIN product_benefit pb ON pbl.benefit_id = pb.benefit_id
LEFT JOIN product_aspect_link pal ON p.product_id = pal.product_id
LEFT JOIN product_aspect pa ON pal.aspect_id = pa.aspect_id
LEFT JOIN product_concern_link pcl ON p.product_id = pcl.product_id
LEFT JOIN product_concern pc ON pcl.concern_id = pc.concern_id
LEFT JOIN product_routine_position prp ON p.product_id = prp.product_id
GROUP BY p.product_id, p.name, p.brand, p.type, p.description, prp.routine_step;

-- Create view for data validation
CREATE OR REPLACE VIEW product_data_validation AS
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.type,
    (SELECT COUNT(*) FROM product_ingredient_link WHERE product_id = p.product_id) as ingredient_count,
    (SELECT COUNT(*) FROM product_benefit_link WHERE product_id = p.product_id) as benefit_count,
    (SELECT COUNT(*) FROM product_aspect_link WHERE product_id = p.product_id) as aspect_count,
    (SELECT COUNT(*) FROM product_concern_link WHERE product_id = p.product_id) as concern_count,
    CASE 
        WHEN p.directions IS NULL THEN 'Missing directions'
        WHEN p.description IS NULL THEN 'Missing description'
        ELSE 'Complete'
    END as data_status
FROM product p;
