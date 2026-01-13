#!/usr/bin/env python3
"""
Update CITY_GARBAGE_BUDGET 1.pdf:
1. Add €285,000 Reward Recognition line in Section 8
2. Remove Section 9 (Environmental Impact)
3. Keep original style and font size
"""

import sys
import os

try:
    from pypdf import PdfReader, PdfWriter
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from io import BytesIO
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf", "reportlab", "--quiet"])
    from pypdf import PdfReader, PdfWriter
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from io import BytesIO

def update_pdf():
    input_file = "CITY_GARBAGE_BUDGET 1.pdf"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return False
    
    try:
        # Read the original PDF
        reader = PdfReader(input_file)
        writer = PdfWriter()
        
        print(f"Original PDF has {len(reader.pages)} pages")
        
        # Process each page
        for i, page in enumerate(reader.pages):
            # Skip pages 9-10 (indices 8-9) - Environmental Impact section
            if i == 8 or i == 9:
                print(f"Removing page {i+1} (Environmental Impact section)")
                continue
            
            # Modify page 8 (index 7) - Grand Total Calculation
            if i == 7:
                print(f"Modifying page {i+1} (Section 8 - Grand Total Calculation)")
                
                # Create overlay with reward recognition line
                packet = BytesIO()
                can = canvas.Canvas(packet, pagesize=A4)
                
                # STEP 1: Cover ALL areas where we'll add/modify text with white
                can.setFillColor(colors.white)
                can.setStrokeColor(colors.white)
                
                # Cover area in list where reward recognition will go (inside green box)
                can.rect(25 * mm, 190 * mm, 160 * mm, 8 * mm, fill=1, stroke=0)
                
                # Cover the entire bottom section (totals and conclusion) to remove duplicates
                can.rect(20 * mm, 120 * mm, 170 * mm, 50 * mm, fill=1, stroke=0)
                
                # STEP 2: Add Reward Recognition line INSIDE the green box list
                # Position it after "Waste processing: €700,000" - same style as other items
                can.setFillColor(colors.black)
                can.setFont("Helvetica", 11)  # Exact same as other list items
                y_reward = 193 * mm  # Position after waste processing, inside green box
                can.drawString(30 * mm, y_reward, "- Reward Recognition: €285,000")
                
                # STEP 3: Add totals section (clean, properly spaced, no duplicates)
                # Total Initial Setup Cost
                can.setFillColor(colors.HexColor('#1a472a'))  # Blue from original
                can.setFont("Helvetica-Bold", 12)
                y_setup = 155 * mm
                can.drawString(30 * mm, y_setup, "Total Initial Setup Cost = €5,811,000")
                
                # Yearly Running Cost
                can.setFillColor(colors.HexColor('#2d5016'))  # Green from original
                can.setFont("Helvetica-Bold", 12)
                y_yearly = 145 * mm
                can.drawString(30 * mm, y_yearly, "Yearly Running Cost = €660,000")
                
                # GRAND TOTAL BUDGET
                can.setFillColor(colors.HexColor('#1a472a'))  # Blue
                can.setFont("Helvetica-Bold", 12)
                y_total = 135 * mm
                can.drawString(30 * mm, y_total, "GRAND TOTAL BUDGET = €6,756,000")
                
                # STEP 4: Conclusion text (ONLY ONCE, no duplicate)
                can.setFillColor(colors.black)
                can.setFont("Helvetica", 10)  # Match original
                y_conclusion = 120 * mm
                can.drawString(30 * mm, y_conclusion, "So we need €6.756 million total budget (including €285,000 for Reward Recognition),")
                can.drawString(30 * mm, y_conclusion - 6 * mm, "and then about €660,000 every year to keep it running.")
                
                can.save()
                
                # Merge overlay with original page
                packet.seek(0)
                overlay_pdf = PdfReader(packet)
                page.merge_page(overlay_pdf.pages[0])
            
            # Add page to writer
            writer.add_page(page)
        
        # Save the modified PDF (overwrite original)
        with open(input_file, 'wb') as output:
            writer.write(output)
        
        print(f"\n✅ Successfully updated {input_file}")
        print("\nChanges made:")
        print("  + Added: Reward Recognition: €285,000 in Section 8")
        print("  + Removed: Section 9 (Environmental Impact) - 2 pages")
        print("  + Updated: Conclusion text with new total")
        print("  + Preserved: Original style and font size")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("Updating CITY_GARBAGE_BUDGET 1.pdf")
    print("=" * 50)
    update_pdf()

