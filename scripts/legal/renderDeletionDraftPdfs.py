"""Render review-only legal drafts from the synchronized Markdown copies."""

from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[2]
DRAFTS = ROOT / "drafts" / "legal"
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD_FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

pdfmetrics.registerFont(TTFont("DraftArial", FONT))
pdfmetrics.registerFont(TTFont("DraftArialBold", BOLD_FONT))

body = ParagraphStyle(
    "body", fontName="DraftArial", fontSize=9.5, leading=14.5,
    textColor=colors.HexColor("#1c1c1c"), spaceAfter=8,
)
h1 = ParagraphStyle(
    "h1", parent=body, fontName="DraftArialBold", fontSize=18, leading=22,
    spaceBefore=4, spaceAfter=12,
)
h2 = ParagraphStyle(
    "h2", parent=body, fontName="DraftArialBold", fontSize=12, leading=16,
    spaceBefore=13, spaceAfter=6, keepWithNext=True,
)
h3 = ParagraphStyle(
    "h3", parent=body, fontName="DraftArialBold", fontSize=10, leading=14,
    spaceBefore=10, spaceAfter=5, keepWithNext=True,
)
banner = ParagraphStyle(
    "banner", parent=body, fontName="DraftArialBold", fontSize=9.5,
    textColor=colors.HexColor("#a42626"), alignment=TA_CENTER, spaceAfter=12,
)
meta = ParagraphStyle(
    "meta", parent=body, fontSize=8.5,
    textColor=colors.HexColor("#4a4a4a"), spaceAfter=14,
)


def render(md_path: Path, pdf_path: Path) -> None:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    story = []
    list_items = []

    def flush_list() -> None:
        if list_items:
            story.append(ListFlowable(
                [ListItem(Paragraph(escape(item), body), leftIndent=8) for item in list_items],
                bulletType="bullet", start="circle", leftIndent=18, bulletFontName="DraftArial",
            ))
            story.append(Spacer(1, 6))
            list_items.clear()

    for index, line in enumerate(lines):
        value = line.strip()
        if not value:
            flush_list()
            continue
        if value.startswith("- "):
            list_items.append(value[2:])
            continue
        flush_list()
        if index == 0:
            style = banner
        elif value.startswith("### "):
            value, style = value[4:], h3
        elif value.startswith("## "):
            value, style = value[3:], h2
        elif value.startswith("# "):
            value, style = value[2:], h1
        elif value.startswith("Baseline effective date:"):
            style = meta
        else:
            style = body
        story.append(Paragraph(escape(value), style))
    flush_list()

    def footer(canvas, document) -> None:
        canvas.setFont("DraftArial", 8)
        canvas.setFillColor(colors.HexColor("#9a2626"))
        canvas.drawString(52, 27, "DRAFT - NOT APPROVED OR IN FORCE")
        canvas.setFillColor(colors.HexColor("#666666"))
        canvas.drawRightString(letter[0] - 52, 27, str(document.page))

    document = SimpleDocTemplate(
        str(pdf_path), pagesize=letter, leftMargin=52, rightMargin=52,
        topMargin=50, bottomMargin=48,
    )
    document.build(story, onFirstPage=footer, onLaterPages=footer)


for name in ("privacy-policy", "terms-of-service"):
    directory = DRAFTS / name
    render(directory / f"{name}.md", directory / f"{name}-draft.pdf")
