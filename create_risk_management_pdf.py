#!/usr/bin/env python3
"""
Create a PDF from the Risk Management Guide
"""

import sys
import os

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab", "--quiet"])
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

def create_pdf():
    """Create the Risk Management Guide PDF"""
    
    output_file = "Risk_Management_Guide.pdf"
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=30*mm,
        leftMargin=30*mm,
        topMargin=30*mm,
        bottomMargin=30*mm
    )
    
    # Container for the 'Flowable' objects
    story = []
    
    # Define custom styles
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Main heading style
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    # Subheading style
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=8,
        spaceBefore=16,
        fontName='Helvetica-Bold'
    )
    
    # Sub-subheading style
    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Body text style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.black,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14
    )
    
    # Bullet point style
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.black,
        spaceAfter=6,
        leftIndent=20,
        bulletIndent=10,
        alignment=TA_LEFT,
        leading=14
    )
    
    # Add title
    story.append(Paragraph("Risk Management Guide", title_style))
    story.append(Spacer(1, 20))
    
    # Risk 1
    story.append(Paragraph("Risk 1: People don't know why this is happening", heading1_style))
    
    story.append(Paragraph("<b>What's wrong:</b>", heading3_style))
    story.append(Paragraph("If workers and citizens don't know the reason, they'll resist.", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>What to do:</b>", heading3_style))
    
    story.append(Paragraph("Explain today's problems in plain words:", heading3_style))
    story.append(Paragraph("• Wasted fuel and random routes", bullet_style))
    story.append(Paragraph("• Some areas missed, others double-served", bullet_style))
    story.append(Paragraph("• Unfair night shifts", bullet_style))
    story.append(Paragraph("• Hard to report missed pickups", bullet_style))
    story.append(Paragraph("• Money wasted", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Show the better future:", heading3_style))
    story.append(Paragraph("• Smarter routes: faster, less gas", bullet_style))
    story.append(Paragraph("• Fair schedules", bullet_style))
    story.append(Paragraph("• Easy reporting in the app", bullet_style))
    story.append(Paragraph("• Cleaner streets with sensor bins", bullet_style))
    story.append(Paragraph("• Easier jobs, not harder", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Make it personal:", heading3_style))
    story.append(Paragraph("To drivers: \"GPS plans routes for you.\"", bullet_style))
    story.append(Paragraph("To citizens: \"Tap the app to report issues.\"", bullet_style))
    story.append(Paragraph("Start early. Give time for questions.", body_style))
    story.append(Spacer(1, 20))
    
    # Risk 2
    story.append(Paragraph("Risk 2: People feel left out", heading1_style))
    
    story.append(Paragraph("<b>What's wrong:</b>", heading3_style))
    story.append(Paragraph("If you decide everything alone, people feel ignored and push back.", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>What to do:</b>", heading3_style))
    story.append(Paragraph("Build a group of \"change champions\" from different teams (include skeptics).", body_style))
    story.append(Paragraph("Listen and fix real issues (e.g., sensors in winter). Thank people publicly.", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Create real feedback loops:", heading3_style))
    story.append(Paragraph("• Weekly coffee chats", bullet_style))
    story.append(Paragraph("• Suggestion box (anonymous OK)", bullet_style))
    story.append(Paragraph("• Reply within 48 hours", bullet_style))
    story.append(Paragraph("• Show what changed because of feedback", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Have hard talks: unions, older workers, anyone worried meet them, listen, support.", body_style))
    story.append(Spacer(1, 20))
    
    # Risk 3
    story.append(Paragraph("Risk 3: Training is weak or late", heading1_style))
    
    story.append(Paragraph("<b>What's wrong:</b>", heading3_style))
    story.append(Paragraph("Great tech fails if people can't use it.", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>What to do:</b>", heading3_style))
    
    story.append(Paragraph("For workers (GPS, time app):", heading3_style))
    story.append(Paragraph("• Training during work hours", bullet_style))
    story.append(Paragraph("• Hands-on with real devices", bullet_style))
    story.append(Paragraph("• Small groups for questions", bullet_style))
    story.append(Paragraph("• One-page cheat sheet in the truck", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("For citizens:", heading3_style))
    story.append(Paragraph("• Short videos (under 60s)", bullet_style))
    story.append(Paragraph("• Demo booths in the community", bullet_style))
    story.append(Paragraph("• A helpline", bullet_style))
    story.append(Paragraph("• Keep phone/in-person options for those without smartphones", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Train before launch. Give two weeks to practice.", body_style))
    story.append(Paragraph("Staff up support for the first month. One bad support call loses trust.", body_style))
    story.append(Spacer(1, 20))
    
    # Risk 4
    story.append(Paragraph("Risk 4: Messy communication", heading1_style))
    
    story.append(Paragraph("<b>What's wrong:</b>", heading3_style))
    story.append(Paragraph("Random messages = confusion = anger.", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>What to do:</b>", heading3_style))
    
    story.append(Paragraph("Use a simple plan:", heading3_style))
    story.append(Paragraph("<b>Month 1 (Why):</b> leaders → workers → public → Q&A", body_style))
    story.append(Paragraph("<b>Month 2 (How):</b> training updates, pilot stories, fix rumors", body_style))
    story.append(Paragraph("<b>Month 3 (Get ready):</b> daily countdown, final training, launch details, celebrate", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Tailor the message:", heading3_style))
    story.append(Paragraph("• Workers: how it changes the day-to-day", bullet_style))
    story.append(Paragraph("• Citizens: what changes, when, how to use the app", bullet_style))
    story.append(Paragraph("• Officials: budget, timeline, risks, controls", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Use many channels: email, texts/WhatsApp, posters, meetings, social media.", body_style))
    story.append(Paragraph("Make it two-way: ask, listen, act and show what you changed.", body_style))
    story.append(Spacer(1, 20))
    
    # Risk 5
    story.append(Paragraph("Risk 5: Everyone stops caring after launch", heading1_style))
    
    story.append(Paragraph("<b>What's wrong:</b>", heading3_style))
    story.append(Paragraph("Launch is day 1, not the finish line.", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>What to do (6-month plan):</b>", heading3_style))
    story.append(Paragraph("<b>Month 1:</b> extra support, daily check-ins, fast fixes, celebrate small wins", body_style))
    story.append(Paragraph("<b>Months 2 – 3:</b> weekly reviews, refresher training, share metrics, visible leaders", body_style))
    story.append(Paragraph("<b>Months 4 – 6:</b> make it the \"new normal,\" update roles, slowly reduce support, document lessons", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Track and share numbers monthly:", heading3_style))
    story.append(Paragraph("• App usage", bullet_style))
    story.append(Paragraph("• Route efficiency", bullet_style))
    story.append(Paragraph("• Scheduling satisfaction", bullet_style))
    story.append(Paragraph("• Ongoing problems", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Build it into the culture: expectations, hiring, reviews, team stories.", body_style))
    story.append(Spacer(1, 20))
    
    # Quick action plan
    story.append(Paragraph("Quick action plan", heading1_style))
    
    story.append(Paragraph("<b>Weeks 1 – 4:</b>", heading2_style))
    story.append(Paragraph("• Get real buy-in from city leaders", bullet_style))
    story.append(Paragraph("• Map everyone involved (staff, unions, citizens, managers)", bullet_style))
    story.append(Paragraph("• Write the clear \"why\"", bullet_style))
    story.append(Paragraph("• Form change champions", bullet_style))
    story.append(Paragraph("• Start the conversation now", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>Weeks 5 – 8:</b>", heading2_style))
    story.append(Paragraph("• Make the comms calendar", bullet_style))
    story.append(Paragraph("• Build training with real user input", bullet_style))
    story.append(Paragraph("• Run a pilot", bullet_style))
    story.append(Paragraph("• Fix what the pilot finds", bullet_style))
    story.append(Paragraph("• Share progress openly", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>Weeks 9 – 12:</b>", heading2_style))
    story.append(Paragraph("• Train everyone", bullet_style))
    story.append(Paragraph("• Daily updates before launch", bullet_style))
    story.append(Paragraph("• Support ready", bullet_style))
    story.append(Paragraph("• Final tech checks", bullet_style))
    story.append(Paragraph("• Launch", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>After launch (Months 1 – 6):</b>", heading2_style))
    story.append(Paragraph("• Stay visible", bullet_style))
    story.append(Paragraph("• Fix fast", bullet_style))
    story.append(Paragraph("• Celebrate wins", bullet_style))
    story.append(Paragraph("• Share results", bullet_style))
    story.append(Paragraph("• Keep at it until it's routine", bullet_style))
    story.append(Spacer(1, 20))
    
    # The bottom line
    story.append(Paragraph("The bottom line", heading1_style))
    story.append(Paragraph("Change fails when we ignore people.", body_style))
    story.append(Paragraph("Tech works when people want to use it.", body_style))
    story.append(Paragraph("Metropolis forced change and lost. You'll bring people with you.", body_style))
    story.append(Spacer(1, 20))
    
    story.append(Paragraph("Learn from them:", heading2_style))
    story.append(Paragraph("• They didn't explain why → You will, clearly and often", bullet_style))
    story.append(Paragraph("• They excluded people → You'll include key voices early", bullet_style))
    story.append(Paragraph("• They trained poorly → You'll train well and early", bullet_style))
    story.append(Paragraph("• They communicated badly → You'll follow a simple plan", bullet_style))
    story.append(Paragraph("• They quit after launch → You'll commit for 6 months", bullet_style))
    
    # Build PDF
    doc.build(story)
    
    print(f"✅ Successfully created {output_file}")
    return True

if __name__ == "__main__":
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("Creating Risk Management Guide PDF")
    print("=" * 50)
    create_pdf()


