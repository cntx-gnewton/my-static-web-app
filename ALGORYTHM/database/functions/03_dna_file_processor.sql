-- Function to process raw DNA data and extract relevant SNPs
CREATE OR REPLACE FUNCTION process_dna_file(file_content text)
RETURNS TABLE (
    rsid text,
    genotype text,
    is_relevant boolean
) AS $$
DECLARE
    lines text[];
    line text;
    parts text[];
    start_processing boolean := false;
BEGIN
    -- Split the file content into lines
    lines := string_to_array(file_content, E'\n');
    
    -- Process each line
    FOREACH line IN ARRAY lines
    LOOP
        -- Skip empty lines and comments
        IF line = '' OR starts_with(line, '#') THEN
            CONTINUE;
        END IF;
        
        -- Skip header line but start processing after it
        IF line = 'rsid	chromosome	position	allele1	allele2' THEN
            start_processing := true;
            CONTINUE;
        END IF;
        
        -- Process data lines
        IF start_processing THEN
            -- Split the line into parts
            parts := string_to_array(line, E'\t');
            
            -- Check if this SNP exists in our database
            IF EXISTS (SELECT 1 FROM snp WHERE snp.rsid = parts[1]) THEN
                rsid := parts[1];
                genotype := parts[4] || parts[5];  -- Combine alleles
                is_relevant := true;
                RETURN NEXT;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate comprehensive report from DNA file
CREATE OR REPLACE FUNCTION analyze_dna_file(file_content text)
RETURNS TABLE (
    section text,
    content text
) AS $$
DECLARE
    relevant_snps text[];
BEGIN
    -- Extract relevant SNPs from file
    relevant_snps := ARRAY(
        SELECT rsid 
        FROM process_dna_file(file_content)
        WHERE is_relevant = true
    );
    
    -- If no relevant SNPs found
    IF array_length(relevant_snps, 1) IS NULL THEN
        section := 'Error';
        content := 'No relevant genetic markers found in the provided DNA file.';
        RETURN NEXT;
        RETURN;
    END IF;

    -- Generate report sections
    section := 'Summary';
    content := format('Found %s relevant genetic markers for skincare analysis.', 
                     array_length(relevant_snps, 1));
    RETURN NEXT;
    
    section := 'Detailed Report';
    content := generate_skincare_report(relevant_snps);
    RETURN NEXT;
    
    section := 'Analyzed SNPs';
    content := array_to_string(relevant_snps, ', ');
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
