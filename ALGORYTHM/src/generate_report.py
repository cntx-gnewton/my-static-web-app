#!/usr/bin/env python3
import os
import sys
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                PageBreak, ListFlowable, ListItem, Table, TableStyle)
import logging
import argparse

def setup_logging():
    """Sets up logging configuration."""
    os.makedirs('logs', exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(f'logs/report_generator_{datetime.now().strftime("%Y%m%d")}.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def analyze_dna_file(file_path, db_params):
    """
    Reads the DNA file and calls the stored procedure analyze_dna_file.
    (This is used to retrieve additional report sections such as a Detailed Report.)
    Expects rows with:
      - section (e.g., 'Summary', 'Detailed Report', etc.)
      - content  (the text content to display)
    """
    try:
        with open(file_path, 'r') as file:
            file_content = file.read()
    except Exception as e:
        raise Exception(f"Error reading DNA file: {e}")

    try:
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM analyze_dna_file(%s)", (file_content,))
        results = cur.fetchall()
        cur.close()
        conn.close()
        return results
    except Exception as e:
        raise Exception(f"Database error (analyze_dna_file): {e}")

class ReportGenerator:
    """
    Generates a PDF report that shows which genetic risk mutations the user has
    (i.e. where the risk allele is present) and links each mutation to recommended
    ingredients (both beneficial and those to avoid) based on the existing schema.
    """
    def __init__(self, db_params):
        self.db_params = db_params
        self.styles = self._create_styles()

    def _create_styles(self):
        """Creates and returns custom ReportLab styles using unique style names."""
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(
            name='ReportTitle',
            fontSize=28,
            alignment=1,  # centered
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=20,
            leading=30
        ))
        styles.add(ParagraphStyle(
            name='SectionHeader',
            fontSize=18,
            textColor=colors.HexColor('#2C3E50'),
            spaceBefore=20,
            spaceAfter=10,
            leading=22
        ))
        styles.add(ParagraphStyle(
            name='ReportBodyText',
            fontSize=12,
            textColor=colors.black,
            spaceAfter=10,
            leading=16
        ))
        return styles

    def format_section_text(self, text):
        """Splits raw text into lines and adds each line as a Paragraph."""
        elements = []
        for line in text.strip().split('\n'):
            clean_line = line.strip()
            if clean_line:
                elements.append(Paragraph(clean_line, self.styles['ReportBodyText']))
                elements.append(Spacer(1, 6))
        return elements

    def parse_detailed_report(self, text):
        """
        Parses the Detailed Report text into subsections based on known markers.
        Markers include: GENETIC RISK ASSESSMENT, DAILY SKINCARE ROUTINE,
        RECOMMENDED INGREDIENTS, INGREDIENTS TO AVOID/USE WITH CAUTION, ADDITIONAL NOTES.
        When the DAILY SKINCARE ROUTINE marker is found, a dedicated parser is used.
        """
        markers = [
            "GENETIC RISK ASSESSMENT",
            "DAILY SKINCARE ROUTINE",
            "RECOMMENDED INGREDIENTS",
            "INGREDIENTS TO AVOID/USE WITH CAUTION",
            "ADDITIONAL NOTES"
        ]
        flowables = []
        pattern = r'(?=(' + '|'.join(re.escape(m) for m in markers) + r'))'
        parts = re.split(pattern, text)
        i = 0
        while i < len(parts):
            part = parts[i].strip()
            if part in markers:
                header = part
                content = ""
                if i+1 < len(parts):
                    content = parts[i+1].strip()
                flowables.append(Paragraph(header, self.styles['SectionHeader']))
                if header.upper() == "DAILY SKINCARE ROUTINE":
                    flowables.extend(self.parse_daily_routine(content))
                else:
                    flowables.extend(self.format_section_text(content))
                i += 2
            else:
                if part:
                    flowables.extend(self.format_section_text(part))
                i += 1
        return flowables

    def parse_daily_routine(self, text):
        """
        Parses the DAILY SKINCARE ROUTINE section.
        Expects lines like:
          Step: Primary Options: ... Alternative Options: ... Notes: ...
        Returns a table of routine steps.
        """
        routine_steps = []
        pattern = re.compile(
            r'^(.*?):\s*Primary Options:\s*(.*?)\s*Alternative Options:\s*(.*?)\s*Notes:\s*(.*)$',
            re.IGNORECASE
        )
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            match = pattern.match(line)
            if match:
                step = match.group(1).strip()
                primary = match.group(2).strip()
                alternative = match.group(3).strip()
                notes = match.group(4).strip()
                routine_steps.append([step, primary, alternative, notes])
        deduped = []
        seen = set()
        for row in routine_steps:
            t = tuple(row)
            if t not in seen:
                seen.add(t)
                deduped.append(row)
        if deduped:
            data = [["Step", "Primary Options", "Alternative Options", "Notes"]]
            data.extend(deduped)
            t = Table(data, colWidths=[1.2*inch, 2.5*inch, 2.5*inch, 2.5*inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#d3d3d3')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ]))
            return [t, Spacer(1,12)]
        else:
            return self.format_section_text(text)

    def get_user_mutations(self, dna_file_path):
        """
        Processes the DNA file using the process_dna_file function (defined in your schema)
        to return rows with (rsid, genotype, is_relevant). Then, for each relevant SNP,
        it compares the user's genotype to the SNP's risk allele (from the SNP table)
        and returns a list of mutations where the risk allele is present.
        """
        try:
            with open(dna_file_path, 'r') as file:
                file_content = file.read()
        except Exception as e:
            raise Exception(f"Error reading DNA file for mutation analysis: {e}")

        # Call the process_dna_file function (assumed to be defined in your schema)
        try:
            conn = psycopg2.connect(**self.db_params)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM process_dna_file(%s)", (file_content,))
            processed = cur.fetchall()
            cur.close()
            conn.close()
        except Exception as e:
            raise Exception(f"Database error (process_dna_file): {e}")

        mutations = []
        # For each processed SNP, if is_relevant then compare genotype to risk allele.
        try:
            conn = psycopg2.connect(**self.db_params)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            for row in processed:
                if row.get("is_relevant"):
                    rsid = row.get("rsid")
                    genotype = row.get("genotype")
                    cur.execute(
                        "SELECT rsid, gene, risk_allele, effect, evidence_strength, category "
                        "FROM SNP WHERE rsid = %s",
                        (rsid,)
                    )
                    snp_detail = cur.fetchone()
                    if snp_detail:
                        risk_allele = snp_detail.get("risk_allele")
                        # Here you might improve the allele comparison logic as needed.
                        if risk_allele.upper() in genotype.upper():
                            mutation = {
                                "rsid": snp_detail.get("rsid"),
                                "gene": snp_detail.get("gene"),
                                "genotype": genotype,
                                "risk_allele": risk_allele,
                                "effect": snp_detail.get("effect"),
                                "evidence_strength": snp_detail.get("evidence_strength"),
                                "category": snp_detail.get("category")
                            }
                            mutations.append(mutation)
            cur.close()
            conn.close()
        except Exception as e:
            raise Exception(f"Error retrieving mutation details: {e}")
        return mutations

    def build_mutation_table(self, mutations):
        """
        Builds a table from the list of mutations.
        Each row shows the rsID, gene, user genotype, risk allele, effect, evidence, and category.
        """
        if not mutations:
            return [Paragraph("No risk mutations were detected in your DNA file.", self.styles['ReportBodyText'])]
        data = [["rsID", "Gene", "Genotype", "Risk Allele", "Effect", "Evidence", "Category"]]
        for m in mutations:
            row = [
                m.get("rsid", ""),
                m.get("gene", ""),
                m.get("genotype", ""),
                m.get("risk_allele", ""),
                m.get("effect", ""),
                m.get("evidence_strength", ""),
                m.get("category", "")
            ]
            data.append(row)
        t = Table(data, colWidths=[0.7*inch, 0.9*inch, 1*inch, 0.8*inch, 3*inch, 0.8*inch, 1*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#d3d3d3')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('FONTSIZE', (0,1), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('TOPPADDING', (0,0), (-1,0), 8),
        ]))
        return [t, Spacer(1,12)]

    def get_recommendations_for_snp(self, rsid):
        """
        For a given SNP (by rsid), queries the beneficial and caution views to obtain
        the recommended ingredients. Assumes that your schema has views:
          - snp_beneficial_ingredients
          - snp_ingredient_cautions
        Returns a dictionary with keys "beneficial" and "cautions".
        """
        recommendations = {"beneficial": [], "cautions": []}
        try:
            conn = psycopg2.connect(**self.db_params)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            # Query beneficial ingredients view.
            cur.execute("SELECT * FROM snp_beneficial_ingredients WHERE rsid = %s", (rsid,))
            recommendations["beneficial"] = cur.fetchall()
            # Query cautions view.
            cur.execute("SELECT * FROM snp_ingredient_cautions WHERE rsid = %s", (rsid,))
            recommendations["cautions"] = cur.fetchall()
            cur.close()
            conn.close()
        except Exception as e:
            recommendations["error"] = str(e)
        return recommendations

    def build_recommendations_section(self, mutations):
        """
        Builds a section that, for each mutation, shows the gene details and its
        linked ingredient recommendations (both beneficial and cautions).
        """
        elements = [Paragraph("Ingredient Recommendations Based on Your Genetics", self.styles['SectionHeader'])]
        for m in mutations:
            rsid = m.get("rsid")
            gene = m.get("gene")
            header = f"<b>{gene} ({rsid})</b> - Risk Allele: {m.get('risk_allele')} | Effect: {m.get('effect')}"
            elements.append(Paragraph(header, self.styles['ReportBodyText']))
            recs = self.get_recommendations_for_snp(rsid)
            # Beneficial ingredients
            if recs.get("beneficial"):
                ben_text = "Beneficial Ingredients: " + ", ".join([r["ingredient_name"] for r in recs["beneficial"]])
                elements.append(Paragraph(ben_text, self.styles['ReportBodyText']))
            else:
                elements.append(Paragraph("No beneficial ingredient recommendations available.", self.styles['ReportBodyText']))
            # Ingredients to avoid
            if recs.get("cautions"):
                caution_text = "Ingredients to Avoid: " + ", ".join([r["ingredient_name"] for r in recs["cautions"]])
                elements.append(Paragraph(caution_text, self.styles['ReportBodyText']))
            else:
                elements.append(Paragraph("No cautionary ingredient recommendations available.", self.styles['ReportBodyText']))
            elements.append(Spacer(1, 12))
        return elements

    def generate_report(self, dna_file_path, output_dir="reports"):
        """
        Generates the complete PDF report.
          1. Calls analyze_dna_file to retrieve additional sections.
          2. Processes the DNA file to extract the user's risk mutations.
          3. Builds a summary page, a mutations table, and a recommendations section.
          4. Optionally includes a Detailed Report section from the stored procedure.
        """
        # Retrieve additional sections (like Detailed Report) from the stored procedure.
        analysis_results = analyze_dna_file(dna_file_path, self.db_params)
        # Get risk mutations from the DNA file.
        mutations = self.get_user_mutations(dna_file_path)
        summary_text = (f"Found {len(mutations)} genetic marker(s) with risk alleles affecting skin care."
                        if mutations else
                        "No risk alleles detected in your DNA file for the tested markers.")

        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(output_dir, f"skincare_report_{timestamp}.pdf")

        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        story = []

        # Cover / Summary page.
        story.append(Paragraph("Your Personalized Skincare Genetics Report", self.styles['ReportTitle']))
        story.append(Paragraph("Summary", self.styles['SectionHeader']))
        story.extend(self.format_section_text(summary_text))
        story.append(PageBreak())

        # Section: Genetic Mutations.
        story.append(Paragraph("Your Genetic Mutations", self.styles['SectionHeader']))
        story.extend(self.build_mutation_table(mutations))
        story.append(PageBreak())

        # Section: Ingredient Recommendations (for each mutation).
        story.extend(self.build_recommendations_section(mutations))
        story.append(PageBreak())

        # Optionally include the Detailed Report section.
        detailed_report_text = ""
        for row in analysis_results:
            if row.get("section", "").upper() == "DETAILED REPORT":
                detailed_report_text = row.get("content", "")
                break
        if detailed_report_text:
            story.append(Paragraph("Detailed Recommendations", self.styles['SectionHeader']))
            story.extend(self.parse_detailed_report(detailed_report_text))
            story.append(PageBreak())

        doc.build(story)
        return output_path

def main():
    logger = setup_logging()
    parser = argparse.ArgumentParser(
        description="Generate a personalized skincare genetics PDF report."
    )
    parser.add_argument("dna_file", help="Path to the DNA file")
    parser.add_argument("--output-dir", default="reports", help="Output directory for the PDF report")
    parser.add_argument("--db-name", default="algorythm", help="Database name")
    parser.add_argument("--db-user", default="cam", help="Database user")
    parser.add_argument("--db-host", default="localhost", help="Database host")
    args = parser.parse_args()

    if not os.path.isfile(args.dna_file):
        logger.error(f"DNA file does not exist: {args.dna_file}")
        print(f"Error: DNA file does not exist: {args.dna_file}")
        sys.exit(1)

    db_params = {
        "dbname": args.db_name,
        "user": args.db_user,
        "host": args.db_host
    }

    try:
        logger.info("Initializing report generator")
        report_gen = ReportGenerator(db_params)
        logger.info("Generating report...")
        pdf_path = report_gen.generate_report(args.dna_file, args.output_dir)
        logger.info(f"Report generated successfully: {pdf_path}")
        print(f"Report generated successfully: {pdf_path}")
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        print(f"Error generating report: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

