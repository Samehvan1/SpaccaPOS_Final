import os
import re
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#718096"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "SpaccaPOS Operational Documentation")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
            
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, page_str)
        self.drawString(54, 36, "CONFIDENTIAL - SpaccaPOS Systems")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * inch - 54, 48)
        
        self.restoreState()

def clean_md_inline(text):
    # Convert MD inline elements to ReportLab XML tags
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = re.sub(r'`(.*?)`', r'<font face="Courier" color="#C7254E">\1</font>', text)
    # Clean HTML entities or XML reserved chars
    text = text.replace('& ', '&amp; ')
    return text

def build_pdf_from_md(md_filepath, pdf_filepath, doc_title):
    doc = SimpleDocTemplate(
        pdf_filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1B365D"),
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#1B365D"),
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0056B3"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h3_style = ParagraphStyle(
        'H3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#2B2D42"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2D3748"),
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )
    
    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1A202C")
    )
    
    alert_style = ParagraphStyle(
        'AlertText',
        parent=body_style,
        textColor=colors.HexColor("#2B6CB0"),
        spaceBefore=2,
        spaceAfter=2
    )

    story = []
    
    with open(md_filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_code = False
    code_lines = []
    in_table = False
    table_rows = []
    
    for line in lines:
        stripped = line.strip()
        
        # Code block
        if stripped.startswith('```'):
            if in_code:
                in_code = False
                code_text = "<br/>".join([c.replace(" ", "&nbsp;").replace("<", "&lt;").replace(">", "&gt;") for c in code_lines])
                p_code = Paragraph(code_text, code_style)
                t = Table([[p_code]], colWidths=[504])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7FAFC")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('LEFTPADDING', (0,0), (-1,-1), 8),
                    ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ]))
                story.append(t)
                story.append(Spacer(1, 6))
                code_lines = []
            else:
                in_code = True
                code_lines = []
            continue
            
        if in_code:
            code_lines.append(stripped)
            continue
            
        # Table parsing
        if stripped.startswith('|') and stripped.endswith('|'):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(stripped)
            continue
        elif in_table:
            in_table = False
            # Render accumulated table
            data = []
            for tr in table_rows:
                if re.match(r'^\|[\s\:\-\|]+\|$', tr):
                    continue
                cells = [clean_md_inline(c.strip()) for c in tr.split('|')[1:-1]]
                if cells:
                    data.append(cells)
                    
            if data:
                cols = max(len(r) for r in data)
                col_width = 504 / cols
                formatted_data = []
                for row_i, row in enumerate(data):
                    row_cells = []
                    for c_text in row:
                        cell_p_style = body_style
                        if row_i == 0:
                            cell_p_style = ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')
                        row_cells.append(Paragraph(c_text, cell_p_style))
                    # Fill missing cells
                    while len(row_cells) < cols:
                        row_cells.append(Paragraph("", body_style))
                    formatted_data.append(row_cells)
                    
                t = Table(formatted_data, colWidths=[col_width]*cols)
                t_style = [
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B365D")),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('TOPPADDING', (0,0), (-1,-1), 5),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                    ('LEFTPADDING', (0,0), (-1,-1), 6),
                    ('RIGHTPADDING', (0,0), (-1,-1), 6),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
                ]
                for r_idx in range(1, len(formatted_data)):
                    if r_idx % 2 == 0:
                        t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor("#F7FAFC")))
                t.setStyle(TableStyle(t_style))
                story.append(t)
                story.append(Spacer(1, 8))
            table_rows = []
            
        # Alert boxes
        if stripped.startswith('>'):
            alert_text = clean_md_inline(stripped[1:].strip())
            p_alert = Paragraph(alert_text, alert_style)
            t = Table([[p_alert]], colWidths=[504])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EBF8FF")),
                ('LINELEFT', (0,0), (0,0), 4, colors.HexColor("#3182CE")),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(t)
            story.append(Spacer(1, 6))
            continue
            
        # Headings
        if stripped.startswith('#'):
            m = re.match(r'^(#+)\s+(.*)$', stripped)
            if m:
                level = len(m.group(1))
                text = clean_md_inline(m.group(2))
                if level == 1:
                    story.append(Paragraph(text, h1_style))
                    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1B365D"), spaceAfter=8))
                elif level == 2:
                    story.append(Paragraph(text, h2_style))
                elif level >= 3:
                    story.append(Paragraph(text, h3_style))
                continue
                
        # Horizontal lines
        if stripped in ('---', '***', '___'):
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E0"), spaceBefore=6, spaceAfter=6))
            continue
            
        # Bullet list
        if re.match(r'^[\*\-\+]\s+', stripped):
            b_text = clean_md_inline(re.sub(r'^[\*\-\+]\s+', '', stripped))
            story.append(Paragraph(f"• {b_text}", bullet_style))
            continue
            
        # Numbered list
        if re.match(r'^\d+\.\s+', stripped):
            num_match = re.match(r'^(\d+\.)\s+(.*)$', stripped)
            if num_match:
                prefix = num_match.group(1)
                b_text = clean_md_inline(num_match.group(2))
                story.append(Paragraph(f"<b>{prefix}</b> {b_text}", bullet_style))
            continue
            
        # Normal text
        if stripped:
            p_text = clean_md_inline(stripped)
            story.append(Paragraph(p_text, body_style))
            
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated ReportLab PDF: {pdf_filepath}")

if __name__ == '__main__':
    base_dir = r"d:\MyWorks\SpaccaTests\SpaccaPos20260416_0\SpaccaPos"
    
    srs_md = os.path.join(base_dir, "SpaccaPOS_SRS.md")
    srs_pdf = os.path.join(base_dir, "SpaccaPOS_SRS.pdf")
    build_pdf_from_md(srs_md, srs_pdf, "SpaccaPOS SRS")
    
    manual_md = os.path.join(base_dir, "SpaccaPOS_User_and_Staff_Manual.md")
    manual_pdf = os.path.join(base_dir, "SpaccaPOS_User_and_Staff_Manual.pdf")
    build_pdf_from_md(manual_md, manual_pdf, "SpaccaPOS User Manual")
