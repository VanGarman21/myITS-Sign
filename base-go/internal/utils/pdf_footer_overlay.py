import sys
import os
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.lib.colors import black, white
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import qrcode
from io import BytesIO
import tempfile

def hex_color(name):
    if name.lower() in ["hitam", "black"]:
        return black
    return white

def overlay_footer_qr(input_path, output_path, footer_text, footer_color, qr_url, pages, footer_bahasa):
    reader = PdfReader(input_path)
    writer = PdfWriter()
    num_pages = len(reader.pages)
    if pages == "all":
        target_pages = set(range(num_pages))
    else:
        target_pages = set(int(p)-1 for p in pages.split(",") if p.strip().isdigit())

    # Register Times New Roman
    # try:
    #     pdfmetrics.registerFont(TTFont('TimesNewRoman', 'Times New Roman.ttf'))
    # except:
    #     pass  # fallback to default

    for i, page in enumerate(reader.pages):
        if i in target_pages:
            packet = BytesIO()
            c = canvas.Canvas(packet, pagesize=letter)
            width, height = letter
            # Footer layout mirip Laravel
            margin_x = 10 * mm  # lebih ke kiri
            margin_y = 15 * mm
            qr_size = 15 * mm  # perkecil QR agar tidak makan tempat
            # Header
            if footer_bahasa == 'en':
                header = 'Notes:'
                isi = [
                    'ITE Law No. 11 of 2008 Article 5 Paragraph 1',
                    '"Electronic information and/or electronic documents and/or printouts constitute valid legal evidence"',
                    'This document has been electronically signed using digital certificate issued by BSrE, BSSN',
                    'You can verify the authenticity of this document by scanning the QR code'
                ]
            else:
                header = 'Catatan:'
                isi = [
                    'UU ITE No 11 Tahun 2008 Pasal 5 ayat 1',
                    '"Informasi Elektronik dan/atau Dokumen Elektronik dan/atau hasil cetaknya merupakan alat bukti hukum yang sah"',
                    'Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan BSrE, BSSN',
                    'Dokumen ini dapat dibuktikan keasliannya dengan memindai QR Code'
                ]
            # Header bold
            c.setFont('Times-Roman', 12)
            c.setFillColor(hex_color(footer_color))
            c.drawString(margin_x, margin_y + 18, header)
            # Garis atas
            c.setStrokeColor(hex_color(footer_color))
            c.setLineWidth(0.5)
            c.line(margin_x, margin_y + 15, width - margin_x, margin_y + 15)
            # List isi
            c.setFont('Times-Roman', 9)
            y_start = margin_y
            y = y_start
            for idx, line in enumerate(isi):
                c.drawString(margin_x + 10, y, u"\u2022 " + line)
                y -= 11
            # QR code di kanan, rata tengah vertikal list, tapi lebih turun
            qr = qrcode.make(qr_url)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png', dir='storage/pdf') as tmp_qr:
                qr_path = tmp_qr.name
                qr.save(qr_path)
            list_height = len(isi) * 11
            qr_y = y_start - (list_height // 2) + 1  # lebih turun dari tengah
            c.drawImage(qr_path, width - margin_x - qr_size, qr_y, qr_size, qr_size, mask='auto')
            os.remove(qr_path)
            c.save()
            packet.seek(0)
            overlay_pdf = PdfReader(packet)
            page.merge_page(overlay_pdf.pages[0])
            writer.add_page(page)
        else:
            writer.add_page(page)
    with open(output_path, 'wb') as f:
        writer.write(f)

if __name__ == "__main__":
    if len(sys.argv) < 7:
        print("Usage: python pdf_footer_overlay.py input.pdf output.pdf 'footer_text' footer_color qr_url pages")
        sys.exit(1)
    overlay_footer_qr(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7])
