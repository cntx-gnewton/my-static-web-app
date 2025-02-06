import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os

def process_dna_file(file_path):
    """Process a DNA file and generate skincare recommendations."""
    try:
        # Read the file
        with open(file_path, 'r') as file:
            content = file.read()
            
        # Connect to database
        conn = psycopg2.connect(
            dbname="algorythm",
            user="cam",
            host="localhost"
        )
        
        # Create a cursor with dictionary results
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Call the analysis function
        cur.execute("SELECT * FROM analyze_dna_file(%s)", (content,))
        results = cur.fetchall()
        
        # Print results in a formatted way
        print("\n=== DNA Analysis Results ===\n")
        for result in results:
            if result['section'] == 'Summary':
                print(f"Summary:")
                print(f"{result['content']}\n")
            elif result['section'] == 'Detailed Report':
                print(result['content'])
            elif result['section'] == 'Analyzed SNPs':
                print(f"Analyzed Genetic Markers:")
                print(f"{result['content']}\n")
            elif result['section'] == 'Error':
                print(f"Error: {result['content']}\n")
        
        # Close database connection
        cur.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Error: Could not find file {file_path}")
    except psycopg2.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_dna.py <path_to_dna_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    process_dna_file(file_path)
