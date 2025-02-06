-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS analyze_genetic_risks(text[]);
DROP FUNCTION IF EXISTS get_recommended_ingredients(text[]);
DROP FUNCTION IF EXISTS get_ingredients_to_avoid(text[]);
DROP FUNCTION IF EXISTS generate_skincare_routine(text[]);

-- 1. Fixed analyze_genetic_risks function
CREATE OR REPLACE FUNCTION analyze_genetic_risks(user_rsids text[])
RETURNS TABLE (
    gene text,
    category text,
    evidence_strength text,
    affected_characteristics text[],
    risk_level text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.gene::text,
        s.category::text,
        s.evidence_strength::text,
        ARRAY_AGG(DISTINCT sc.name::text),
        (CASE 
            WHEN s.evidence_strength = 'Strong' THEN 'High'
            WHEN s.evidence_strength = 'Moderate' THEN 'Medium'
            ELSE 'Low'
        END)::text as risk_level
    FROM snp s
    JOIN snp_characteristic_link scl ON s.snp_id = scl.snp_id
    JOIN skincharacteristic sc ON scl.characteristic_id = sc.characteristic_id
    WHERE s.rsid = ANY(user_rsids)
    GROUP BY s.gene, s.category, s.evidence_strength;
END;
$$ LANGUAGE plpgsql;

-- 2. Fixed get_recommended_ingredients function
CREATE OR REPLACE FUNCTION get_recommended_ingredients(user_rsids text[])
RETURNS TABLE (
    ingredient_name text,
    recommendation_strength text,
    evidence_level text,
    beneficial_for text[],
    cautions text[]
) AS $$
BEGIN
    RETURN QUERY
    WITH user_snps AS (
        SELECT snp_id, evidence_strength
        FROM snp
        WHERE rsid = ANY(user_rsids)
    )
    SELECT 
        i.name::text,
        MAX(sil.recommendation_strength)::text as rec_strength,
        i.evidence_level::text,
        ARRAY_AGG(DISTINCT sc.name::text) as benefits,
        ARRAY_AGG(DISTINCT ic.risk_mechanism::text) as cautions
    FROM user_snps us
    JOIN snp_ingredient_link sil ON us.snp_id = sil.snp_id
    JOIN ingredient i ON sil.ingredient_id = i.ingredient_id
    LEFT JOIN snp_characteristic_link scl ON us.snp_id = scl.snp_id
    LEFT JOIN skincharacteristic sc ON scl.characteristic_id = sc.characteristic_id
    LEFT JOIN snp_ingredientcaution_link sicl ON us.snp_id = sicl.snp_id
    LEFT JOIN ingredientcaution ic ON sicl.caution_id = ic.caution_id
    GROUP BY i.name, i.evidence_level;
END;
$$ LANGUAGE plpgsql;

-- 3. Fixed get_ingredients_to_avoid function
CREATE OR REPLACE FUNCTION get_ingredients_to_avoid(user_rsids text[])
RETURNS TABLE (
    ingredient_name text,
    caution_level text,
    risk_mechanism text,
    alternatives text
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        ic.ingredient_name::text,
        ic.category::text as caution_level,
        ic.risk_mechanism::text,
        ic.alternative_ingredients::text
    FROM snp s
    JOIN snp_ingredientcaution_link sicl ON s.snp_id = sicl.snp_id
    JOIN ingredientcaution ic ON sicl.caution_id = ic.caution_id
    WHERE s.rsid = ANY(user_rsids);
END;
$$ LANGUAGE plpgsql;

-- 4. Fixed generate_skincare_routine function
CREATE OR REPLACE FUNCTION generate_skincare_routine(user_rsids text[])
RETURNS TABLE (
    routine_step text,
    primary_recommendations text[],
    alternative_recommendations text[],
    ingredients_to_avoid text[],
    notes text
) AS $$
BEGIN
    RETURN QUERY
    WITH user_concerns AS (
        SELECT DISTINCT
            sc.name::text as characteristic,
            s.evidence_strength::text,
            cond.name::text as condition
        FROM snp s
        JOIN snp_characteristic_link scl ON s.snp_id = scl.snp_id
        JOIN skincharacteristic sc ON scl.characteristic_id = sc.characteristic_id
        JOIN characteristic_condition_link ccl ON sc.characteristic_id = ccl.characteristic_id
        JOIN skincondition cond ON ccl.condition_id = cond.condition_id
        WHERE s.rsid = ANY(user_rsids)
    )
    SELECT
        step.routine_step::text,
        ARRAY_AGG(DISTINCT 
            CASE WHEN cil.recommendation_strength = 'First-line' 
            THEN i.name::text END
        ) as primary_recs,
        ARRAY_AGG(DISTINCT 
            CASE WHEN cil.recommendation_strength = 'Second-line' 
            THEN i.name::text END
        ) as alternative_recs,
        ARRAY_AGG(DISTINCT ic.ingredient_name::text) as avoid,
        MAX(step.notes::text) as step_notes
    FROM (VALUES 
        ('Cleanser'::text, 1, 'Gentle cleansing based on skin characteristics'::text),
        ('Treatment'::text, 2, 'Target specific skin concerns'::text),
        ('Moisturizer'::text, 3, 'Barrier support and hydration'::text),
        ('Sun Protection'::text, 4, 'UV protection based on sensitivity'::text)
    ) as step(routine_step, step_order, notes)
    CROSS JOIN user_concerns uc
    LEFT JOIN condition_ingredient_link cil ON TRUE
    LEFT JOIN ingredient i ON cil.ingredient_id = i.ingredient_id
    LEFT JOIN snp_ingredientcaution_link sicl ON TRUE
    LEFT JOIN ingredientcaution ic ON sicl.caution_id = ic.caution_id
    GROUP BY step.routine_step, step.step_order
    ORDER BY step.step_order;
END;
$$ LANGUAGE plpgsql;
