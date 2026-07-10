from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import io
from typing import Dict

class ReportGenerator:
    def generate_pdf_report(self, analysis_data: Dict, match_data: Dict = None) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            'TitleStyle', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#1E293B'), spaceAfter=12
        )

        story.append(Paragraph("AI Resume Analysis Report", title_style))
        story.append(Spacer(1, 10))

        ats_score = analysis_data.get('ats_score', 0)
        story.append(Paragraph(f"<b>Overall ATS Score:</b> {ats_score}%", styles['Normal']))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>Key Strengths:</b>", styles['Heading2']))
        for s in analysis_data.get('strengths', []):
            story.append(Paragraph(f"• {s}", styles['Normal']))
        story.append(Spacer(1, 10))

        story.append(Paragraph("<b>Suggested Improvements:</b>", styles['Heading2']))
        for imp in analysis_data.get('improvements', []):
            story.append(Paragraph(f"• {imp}", styles['Normal']))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()