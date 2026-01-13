#!/usr/bin/env python3
"""
Create a Risk Management PDF based on ADKAR Change Management Framework
ADKAR: Awareness, Desire, Knowledge, Ability, Reinforcement
"""

import sys
import os

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab", "--quiet"])
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm, inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

def create_pdf():
    """Create the ADKAR-based Risk Management Guide PDF"""
    
    output_file = "ADKAR_Risk_Management_Guide.pdf"
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=25*mm,
        leftMargin=25*mm,
        topMargin=25*mm,
        bottomMargin=25*mm
    )
    
    # Container for the 'Flowable' objects
    story = []
    
    # Define custom styles
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=26,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=16,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Subtitle style
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    # ADKAR Stage heading style
    adkar_heading_style = ParagraphStyle(
        'ADKARHeading',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=12,
        spaceBefore=24,
        fontName='Helvetica-Bold',
        borderWidth=1,
        borderColor=colors.HexColor('#2d5016'),
        borderPadding=8,
        backColor=colors.HexColor('#e8f5e9')
    )
    
    # Main heading style
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1a472a'),
        spaceAfter=10,
        spaceBefore=18,
        fontName='Helvetica-Bold'
    )
    
    # Subheading style
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=8,
        spaceBefore=14,
        fontName='Helvetica-Bold'
    )
    
    # Sub-subheading style
    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=colors.HexColor('#2d5016'),
        spaceAfter=6,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    # Body text style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=13
    )
    
    # Bullet point style
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=5,
        leftIndent=18,
        bulletIndent=8,
        alignment=TA_LEFT,
        leading=13
    )
    
    # Risk box style
    risk_box_style = ParagraphStyle(
        'RiskBox',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#8b0000'),
        spaceAfter=8,
        leftIndent=0,
        alignment=TA_LEFT,
        leading=13,
        fontName='Helvetica-Bold'
    )
    
    # Solution box style
    solution_box_style = ParagraphStyle(
        'SolutionBox',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#006400'),
        spaceAfter=8,
        leftIndent=0,
        alignment=TA_LEFT,
        leading=13,
        fontName='Helvetica-Bold'
    )
    
    # Add title
    story.append(Paragraph("Risk Management Guide", title_style))
    story.append(Paragraph("Based on ADKAR Change Management Framework", subtitle_style))
    story.append(Spacer(1, 12))
    
    # ADKAR Overview
    story.append(Paragraph("ADKAR Framework Overview", heading1_style))
    story.append(Paragraph("ADKAR is a change management model that focuses on five key outcomes:", body_style))
    story.append(Paragraph("• <b>A</b>wareness: Understanding why change is necessary", bullet_style))
    story.append(Paragraph("• <b>D</b>esire: Motivation to participate and support the change", bullet_style))
    story.append(Paragraph("• <b>K</b>nowledge: Understanding how to change", bullet_style))
    story.append(Paragraph("• <b>A</b>bility: Skills and behaviors to implement the change", bullet_style))
    story.append(Paragraph("• <b>R</b>einforcement: Sustaining the change", bullet_style))
    story.append(Spacer(1, 20))
    
    # ========== AWARENESS STAGE ==========
    story.append(Paragraph("A - AWARENESS", adkar_heading_style))
    story.append(Paragraph("Understanding why change is necessary", heading2_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Identified Risks:", heading3_style))
    
    story.append(Paragraph("Risk 1.1: People don't know why this is happening", risk_box_style))
    story.append(Paragraph("If workers and citizens don't understand the reason for change, they will resist it.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Explain today's problems in plain words:", heading3_style))
    story.append(Paragraph("• Wasted fuel and random routes", bullet_style))
    story.append(Paragraph("• Some areas missed, others double-served", bullet_style))
    story.append(Paragraph("• Unfair night shifts", bullet_style))
    story.append(Paragraph("• Hard to report missed pickups", bullet_style))
    story.append(Paragraph("• Money wasted", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Show the better future:", heading3_style))
    story.append(Paragraph("• Smarter routes: faster, less gas", bullet_style))
    story.append(Paragraph("• Fair schedules", bullet_style))
    story.append(Paragraph("• Easy reporting in the app", bullet_style))
    story.append(Paragraph("• Cleaner streets with sensor bins", bullet_style))
    story.append(Paragraph("• Easier jobs, not harder", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Make it personal:", heading3_style))
    story.append(Paragraph("To drivers: \"GPS plans routes for you.\"", bullet_style))
    story.append(Paragraph("To citizens: \"Tap the app to report issues.\"", bullet_style))
    story.append(Paragraph("Start early. Give time for questions.", body_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 1.2: Incomplete or confusing communication", risk_box_style))
    story.append(Paragraph("Random messages create confusion and anger, leading to resistance.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Use a structured communication plan:", heading3_style))
    story.append(Paragraph("• <b>Month 1 (Why):</b> leaders → workers → public → Q&A sessions", body_style))
    story.append(Paragraph("• <b>Month 2 (How):</b> training updates, pilot stories, fix rumors", body_style))
    story.append(Paragraph("• <b>Month 3 (Get ready):</b> daily countdown, final training, launch details, celebrate", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Tailor messages to each audience:", heading3_style))
    story.append(Paragraph("• Workers: how it changes the day-to-day", bullet_style))
    story.append(Paragraph("• Citizens: what changes, when, how to use the app", bullet_style))
    story.append(Paragraph("• Officials: budget, timeline, risks, controls", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Use multiple channels: email, texts/WhatsApp, posters, meetings, social media.", body_style))
    story.append(Paragraph("Make it two-way: ask, listen, act and show what you changed.", body_style))
    story.append(Spacer(1, 20))
    
    # ========== DESIRE STAGE ==========
    story.append(Paragraph("D - DESIRE", adkar_heading_style))
    story.append(Paragraph("Motivation to participate and support the change", heading2_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Identified Risks:", heading3_style))
    
    story.append(Paragraph("Risk 2.1: People feel left out and excluded", risk_box_style))
    story.append(Paragraph("If you decide everything alone, people feel ignored and will push back.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Build a group of \"change champions\" from different teams (include skeptics).", body_style))
    story.append(Paragraph("Listen and fix real issues (e.g., sensors in winter). Thank people publicly.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Create real feedback loops:", heading3_style))
    story.append(Paragraph("• Weekly coffee chats", bullet_style))
    story.append(Paragraph("• Suggestion box (anonymous OK)", bullet_style))
    story.append(Paragraph("• Reply within 48 hours", bullet_style))
    story.append(Paragraph("• Show what changed because of feedback", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Have hard talks: unions, older workers, anyone worried - meet them, listen, support.", body_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 2.2: Lack of personal benefit or incentive", risk_box_style))
    story.append(Paragraph("People won't support change if they don't see personal benefits.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Highlight individual benefits:", heading3_style))
    story.append(Paragraph("• For drivers: Less stress, better schedules, GPS assistance", bullet_style))
    story.append(Paragraph("• For citizens: Easier reporting, cleaner streets, better service", bullet_style))
    story.append(Paragraph("• For managers: Better data, cost savings, efficiency", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Create early wins and celebrate them publicly.", body_style))
    story.append(Paragraph("Recognize and reward early adopters.", body_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 2.3: Fear of job loss or role changes", risk_box_style))
    story.append(Paragraph("Workers may fear that technology will replace them or make their jobs harder.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Address fears directly:", heading3_style))
    story.append(Paragraph("• Emphasize: \"Technology assists, not replaces\"", bullet_style))
    story.append(Paragraph("• Show how jobs become easier, not harder", bullet_style))
    story.append(Paragraph("• Provide job security assurances where possible", bullet_style))
    story.append(Paragraph("• Offer retraining and upskilling opportunities", bullet_style))
    story.append(Spacer(1, 20))
    
    # ========== KNOWLEDGE STAGE ==========
    story.append(Paragraph("K - KNOWLEDGE", adkar_heading_style))
    story.append(Paragraph("Understanding how to change", heading2_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Identified Risks:", heading3_style))
    
    story.append(Paragraph("Risk 3.1: Training is weak or late", risk_box_style))
    story.append(Paragraph("Great tech fails if people don't know how to use it.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("For workers (GPS, time app):", heading3_style))
    story.append(Paragraph("• Training during work hours (not after hours)", bullet_style))
    story.append(Paragraph("• Hands-on practice with real devices", bullet_style))
    story.append(Paragraph("• Small groups for questions and support", bullet_style))
    story.append(Paragraph("• One-page cheat sheet in the truck", bullet_style))
    story.append(Paragraph("• Video tutorials accessible anytime", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("For citizens:", heading3_style))
    story.append(Paragraph("• Short videos (under 60 seconds)", bullet_style))
    story.append(Paragraph("• Demo booths in the community", bullet_style))
    story.append(Paragraph("• A dedicated helpline", bullet_style))
    story.append(Paragraph("• Keep phone/in-person options for those without smartphones", bullet_style))
    story.append(Paragraph("• Step-by-step guides in multiple languages", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Train before launch. Give two weeks to practice.", body_style))
    story.append(Paragraph("Staff up support for the first month. One bad support call loses trust.", body_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 3.2: Information overload or complexity", risk_box_style))
    story.append(Paragraph("Too much information at once can overwhelm people and reduce learning effectiveness.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Break down training into digestible chunks:", heading3_style))
    story.append(Paragraph("• Start with basics, then add advanced features", bullet_style))
    story.append(Paragraph("• Use micro-learning: 5-10 minute sessions", bullet_style))
    story.append(Paragraph("• Provide just-in-time learning resources", bullet_style))
    story.append(Paragraph("• Create role-specific training paths", bullet_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 3.3: Lack of documentation or resources", risk_box_style))
    story.append(Paragraph("People need reference materials they can access when needed.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Create comprehensive documentation:", heading3_style))
    story.append(Paragraph("• Quick reference guides", bullet_style))
    story.append(Paragraph("• FAQ documents", bullet_style))
    story.append(Paragraph("• Troubleshooting guides", bullet_style))
    story.append(Paragraph("• Online knowledge base", bullet_style))
    story.append(Paragraph("• Make all resources easily accessible", bullet_style))
    story.append(Spacer(1, 20))
    
    # ========== ABILITY STAGE ==========
    story.append(Paragraph("A - ABILITY", adkar_heading_style))
    story.append(Paragraph("Skills and behaviors to implement the change", heading2_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Identified Risks:", heading3_style))
    
    story.append(Paragraph("Risk 4.1: Insufficient practice time", risk_box_style))
    story.append(Paragraph("Knowledge without practice doesn't translate to ability.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Provide ample practice opportunities:", heading3_style))
    story.append(Paragraph("• Run pilot programs before full launch", bullet_style))
    story.append(Paragraph("• Create sandbox/test environments", bullet_style))
    story.append(Paragraph("• Pair experienced users with new users", bullet_style))
    story.append(Paragraph("• Allow 2-4 weeks of practice before go-live", bullet_style))
    story.append(Paragraph("• Provide on-the-job coaching", bullet_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 4.2: Technology barriers or system issues", risk_box_style))
    story.append(Paragraph("Technical problems prevent people from using the system effectively.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Ensure technical readiness:", heading3_style))
    story.append(Paragraph("• Thorough testing before launch", bullet_style))
    story.append(Paragraph("• Reliable internet/connectivity", bullet_style))
    story.append(Paragraph("• User-friendly interface design", bullet_style))
    story.append(Paragraph("• Quick technical support response", bullet_style))
    story.append(Paragraph("• Backup systems for critical functions", bullet_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 4.3: Resistance to new workflows", risk_box_style))
    story.append(Paragraph("People may revert to old habits if new processes are too difficult.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Make new processes easier than old ones:", heading3_style))
    story.append(Paragraph("• Simplify workflows where possible", bullet_style))
    story.append(Paragraph("• Remove old systems gradually", bullet_style))
    story.append(Paragraph("• Provide clear process maps", bullet_style))
    story.append(Paragraph("• Monitor and adjust based on feedback", bullet_style))
    story.append(Paragraph("• Celebrate successful adoptions", bullet_style))
    story.append(Spacer(1, 20))
    
    # ========== REINFORCEMENT STAGE ==========
    story.append(Paragraph("R - REINFORCEMENT", adkar_heading_style))
    story.append(Paragraph("Sustaining the change", heading2_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Identified Risks:", heading3_style))
    
    story.append(Paragraph("Risk 5.1: Everyone stops caring after launch", risk_box_style))
    story.append(Paragraph("Launch is day 1, not the finish line. Without reinforcement, people revert to old ways.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address (6-month reinforcement plan):", solution_box_style))
    story.append(Paragraph("<b>Month 1:</b> Extra support, daily check-ins, fast fixes, celebrate small wins", body_style))
    story.append(Paragraph("<b>Months 2 – 3:</b> Weekly reviews, refresher training, share metrics, visible leaders", body_style))
    story.append(Paragraph("<b>Months 4 – 6:</b> Make it the \"new normal,\" update roles, slowly reduce support, document lessons", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Track and share numbers monthly:", heading3_style))
    story.append(Paragraph("• App usage statistics", bullet_style))
    story.append(Paragraph("• Route efficiency improvements", bullet_style))
    story.append(Paragraph("• Scheduling satisfaction scores", bullet_style))
    story.append(Paragraph("• Ongoing problems and resolutions", bullet_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Build it into the culture: expectations, hiring, reviews, team stories.", body_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 5.2: Lack of accountability or consequences", risk_box_style))
    story.append(Paragraph("Without accountability, people may not maintain new behaviors.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Establish clear expectations:", heading3_style))
    story.append(Paragraph("• Define success metrics", bullet_style))
    story.append(Paragraph("• Regular performance reviews", bullet_style))
    story.append(Paragraph("• Link to performance evaluations", bullet_style))
    story.append(Paragraph("• Recognize and reward compliance", bullet_style))
    story.append(Paragraph("• Address non-compliance constructively", bullet_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Risk 5.3: System changes or updates without communication", risk_box_style))
    story.append(Paragraph("Unexpected changes can undermine confidence and adoption.", body_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("How to Address:", solution_box_style))
    story.append(Paragraph("Maintain ongoing communication:", heading3_style))
    story.append(Paragraph("• Announce updates in advance", bullet_style))
    story.append(Paragraph("• Explain reasons for changes", bullet_style))
    story.append(Paragraph("• Provide training for updates", bullet_style))
    story.append(Paragraph("• Gather feedback on changes", bullet_style))
    story.append(Paragraph("• Maintain change champions network", bullet_style))
    story.append(Spacer(1, 20))
    
    # ========== QUICK ACTION PLAN ==========
    story.append(PageBreak())
    story.append(Paragraph("ADKAR-Based Action Plan", heading1_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>Weeks 1 – 4: Awareness & Desire</b>", heading2_style))
    story.append(Paragraph("• Get real buy-in from city leaders", bullet_style))
    story.append(Paragraph("• Map everyone involved (staff, unions, citizens, managers)", bullet_style))
    story.append(Paragraph("• Write the clear \"why\" message", bullet_style))
    story.append(Paragraph("• Form change champions group", bullet_style))
    story.append(Paragraph("• Start the conversation now", bullet_style))
    story.append(Paragraph("• Address fears and concerns directly", bullet_style))
    story.append(Paragraph("• Create feedback mechanisms", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>Weeks 5 – 8: Knowledge Building</b>", heading2_style))
    story.append(Paragraph("• Make the communication calendar", bullet_style))
    story.append(Paragraph("• Build training with real user input", bullet_style))
    story.append(Paragraph("• Create training materials and documentation", bullet_style))
    story.append(Paragraph("• Run a pilot program", bullet_style))
    story.append(Paragraph("• Fix what the pilot finds", bullet_style))
    story.append(Paragraph("• Share progress openly", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>Weeks 9 – 12: Ability Development</b>", heading2_style))
    story.append(Paragraph("• Train everyone thoroughly", bullet_style))
    story.append(Paragraph("• Provide practice opportunities", bullet_style))
    story.append(Paragraph("• Daily updates before launch", bullet_style))
    story.append(Paragraph("• Support team ready", bullet_style))
    story.append(Paragraph("• Final tech checks and testing", bullet_style))
    story.append(Paragraph("• Launch with full support", bullet_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>After launch (Months 1 – 6): Reinforcement</b>", heading2_style))
    story.append(Paragraph("• Stay visible and engaged", bullet_style))
    story.append(Paragraph("• Fix issues fast", bullet_style))
    story.append(Paragraph("• Celebrate wins regularly", bullet_style))
    story.append(Paragraph("• Share results and metrics", bullet_style))
    story.append(Paragraph("• Continue training and support", bullet_style))
    story.append(Paragraph("• Keep at it until it's routine", bullet_style))
    story.append(Spacer(1, 20))
    
    # ========== KEY PRINCIPLES ==========
    story.append(Paragraph("Key ADKAR Principles", heading1_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("1. <b>Sequential Progression:</b> Each stage must be completed before moving to the next", body_style))
    story.append(Paragraph("2. <b>Individual Focus:</b> Each person progresses at their own pace", body_style))
    story.append(Paragraph("3. <b>Identify Barriers:</b> Understand what's blocking progress at each stage", body_style))
    story.append(Paragraph("4. <b>Targeted Interventions:</b> Address specific barriers with appropriate solutions", body_style))
    story.append(Paragraph("5. <b>Measure Progress:</b> Track ADKAR scores to identify where people are stuck", body_style))
    story.append(Paragraph("6. <b>Sustained Reinforcement:</b> Change must be reinforced to become permanent", body_style))
    story.append(Spacer(1, 20))
    
    # ========== THE BOTTOM LINE ==========
    story.append(Paragraph("The Bottom Line", heading1_style))
    story.append(Paragraph("Change fails when we ignore people.", body_style))
    story.append(Paragraph("Tech works when people want to use it.", body_style))
    story.append(Paragraph("Metropolis forced change and lost. You'll bring people with you using ADKAR.", body_style))
    story.append(Spacer(1, 16))
    
    story.append(Paragraph("Learn from failures:", heading2_style))
    story.append(Paragraph("• They didn't create Awareness → You will, clearly and often", bullet_style))
    story.append(Paragraph("• They didn't build Desire → You'll include key voices early and address concerns", bullet_style))
    story.append(Paragraph("• They didn't provide Knowledge → You'll train well and early", bullet_style))
    story.append(Paragraph("• They didn't develop Ability → You'll provide practice and support", bullet_style))
    story.append(Paragraph("• They didn't Reinforce → You'll commit for 6+ months with ongoing support", bullet_style))
    
    # Build PDF
    doc.build(story)
    
    print(f"✅ Successfully created {output_file}")
    return True

if __name__ == "__main__":
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("Creating ADKAR-based Risk Management Guide PDF")
    print("=" * 50)
    create_pdf()


