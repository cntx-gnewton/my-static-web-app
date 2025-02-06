-- Create a function to generate a user-friendly skincare report
CREATE OR REPLACE FUNCTION generate_skincare_report(user_rsids text[])
RETURNS TEXT AS $$
DECLARE
    report TEXT;
    genetic_risk_row RECORD;
    routine_step_row RECORD;
    ingredient_row RECORD;
    caution_row RECORD;
BEGIN
    report := E'\n=== PERSONALIZED SKINCARE REPORT ===\n\n';
    
    -- 1. Genetic Risk Assessment
    report := report || E'GENETIC RISK ASSESSMENT\n';
    report := report || E'------------------------\n';
    FOR genetic_risk_row IN (
        SELECT * FROM analyze_genetic_risks(user_rsids)
    ) LOOP
        report := report || format(
            E'Gene: %s (%s)\n' ||
            E'Risk Level: %s\n' ||
            E'Affects: %s\n\n',
            genetic_risk_row.gene,
            genetic_risk_row.category,
            genetic_risk_row.risk_level,
            array_to_string(genetic_risk_row.affected_characteristics, ', ')
        );
    END LOOP;

    -- 2. Key Recommendations
    report := report || E'DAILY SKINCARE ROUTINE\n';
    report := report || E'---------------------\n';
    FOR routine_step_row IN (
        SELECT * FROM generate_skincare_routine(user_rsids)
        ORDER BY 
            CASE routine_step
                WHEN 'Cleanser' THEN 1
                WHEN 'Treatment' THEN 2
                WHEN 'Moisturizer' THEN 3
                WHEN 'Sun Protection' THEN 4
            END
    ) LOOP
        report := report || format(
            E'%s:\n' ||
            E'  Primary Options: %s\n' ||
            E'  Alternative Options: %s\n' ||
            E'  Notes: %s\n\n',
            routine_step_row.routine_step,
            array_to_string(array_remove(routine_step_row.primary_recommendations, NULL), ', '),
            array_to_string(array_remove(routine_step_row.alternative_recommendations, NULL), ', '),
            routine_step_row.notes
        );
    END LOOP;

    -- 3. Ingredient Recommendations
    report := report || E'RECOMMENDED INGREDIENTS\n';
    report := report || E'----------------------\n';
    FOR ingredient_row IN (
        SELECT * FROM get_recommended_ingredients(user_rsids)
        WHERE evidence_level = 'Strong'
        ORDER BY recommendation_strength DESC
    ) LOOP
        report := report || format(
            E'%s:\n' ||
            E'  Benefits: %s\n' ||
            E'  Evidence Level: %s\n\n',
            ingredient_row.ingredient_name,
            array_to_string(ingredient_row.beneficial_for, ', '),
            ingredient_row.evidence_level
        );
    END LOOP;

    -- 4. Ingredients to Avoid
    report := report || E'INGREDIENTS TO AVOID/USE WITH CAUTION\n';
    report := report || E'----------------------------------\n';
    FOR caution_row IN (
        SELECT * FROM get_ingredients_to_avoid(user_rsids)
        ORDER BY 
            CASE caution_level
                WHEN 'Avoid' THEN 1
                WHEN 'Use with Caution' THEN 2
            END
    ) LOOP
        report := report || format(
            E'%s (%s):\n' ||
            E'  Reason: %s\n' ||
            E'  Alternatives: %s\n\n',
            caution_row.ingredient_name,
            caution_row.caution_level,
            caution_row.risk_mechanism,
            caution_row.alternatives
        );
    END LOOP;

    -- 5. Additional Notes
    report := report || E'ADDITIONAL NOTES\n';
    report := report || E'----------------\n';
    report := report || E'- Always patch test new products before full application\n';
    report := report || E'- Introduce new products one at a time\n';
    report := report || E'- Monitor skin response and adjust routine as needed\n';
    report := report || E'- Consider seasonal adjustments to your routine\n';
    
    RETURN report;
END;
$$ LANGUAGE plpgsql;
