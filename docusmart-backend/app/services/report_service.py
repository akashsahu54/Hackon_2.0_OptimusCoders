"""Report Generation Service — generate PDF expense reports."""

from typing import Dict, Any, List, Optional


def generate_expense_report_pdf(
    items: List[Dict[str, Any]],
    period: str,
    total_spend: float,
    output_path: str,
) -> str:
    """
    Generate a PDF expense report using ReportLab.
    Returns the path to the generated PDF.
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph(f"Expense Report — {period}", styles["Title"]))
        elements.append(Spacer(1, 20))

        # Summary
        elements.append(Paragraph(f"Total Documents: {len(items)}", styles["Normal"]))
        elements.append(Paragraph(f"Total Spend:     ${total_spend:,.2f}", styles["Normal"]))
        elements.append(Spacer(1, 20))

        # Table
        if items:
            table_data = [["#", "Vendor", "Type", "Date", "Amount"]]
            for i, item in enumerate(items, 1):
                table_data.append([
                    str(i),
                    str(item.get("vendor", "Unknown"))[:30],
                    str(item.get("type", "-")),
                    str(item.get("date", "-")),
                    f"${float(item.get('amount', 0)):,.2f}",
                ])

            table = Table(table_data, colWidths=[30, 150, 80, 100, 80])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a73e8")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4f8")]),
            ]))
            elements.append(table)

        doc.build(elements)
        return output_path

    except ImportError:
        # ReportLab not installed — return a placeholder
        with open(output_path, "w") as f:
            f.write(f"Expense Report — {period}\n")
            f.write(f"Total: ${total_spend:,.2f}\n")
            for item in items:
                f.write(f"  - {item.get('vendor', 'Unknown')}: ${item.get('amount', 0)}\n")
        return output_path
