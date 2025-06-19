import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Jika punya file TTF Times New Roman, bisa di-embed di sini
// const timesFontBytes = await fetch('/TimesNewRoman.ttf').then(res => res.arrayBuffer());

export async function addFooterToPdf(
  pdfBytes: ArrayBuffer,
  footerBahasa: "id" | "en" = "id",
  isFooterBlack: boolean = true,
  pages: string[] | "all" = "all"
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  // const timesFont = await pdfDoc.embedFont(timesFontBytes); // jika ada
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBold = font; // pdf-lib tidak support bold langsung, kecuali font TTF bold di-embed
  const allPages = pdfDoc.getPages();

  // Data footer
  const isId = footerBahasa === "id";
  const color = isFooterBlack ? rgb(0, 0, 0) : rgb(1, 1, 1);

  let targetPages = allPages;
  if (Array.isArray(pages) && pages.length > 0) {
    targetPages = pages
      .map((p) => allPages[parseInt(p, 10) - 1])
      .filter(Boolean);
  }

  targetPages.forEach((page) => {
    const { width } = page.getSize();
    let y = 60; // posisi awal footer (bisa disesuaikan)

    // Judul
    page.drawText(isId ? "Catatan:" : "Notes:", {
      x: 43,
      y,
      size: 12,
      font: fontBold,
      color,
    });
    y -= 16;

    // Garis atas
    page.drawLine({
      start: { x: 40, y: y + 10 },
      end: { x: width - 40, y: y + 10 },
      thickness: 1,
      color,
    });

    // List
    const items = isId
      ? [
          [
            "UU ITE No 11 Tahun 2008 Pasal 5 ayat 1",
            '"Informasi Elektronik dan/atau Dokumen Elektronik dan/atau hasil cetaknya merupakan alat bukti hukum yang sah"',
            "italic",
          ],
          [
            "Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan BSrE, BSSN",
            "",
            "normal",
          ],
          [
            "Dokumen ini dapat dibuktikan keasliannya dengan memindai QR Code",
            "",
            "normal",
          ],
        ]
      : [
          [
            "ITE Law No. 11 of 2008 Article 5 Paragraph 1",
            '"Electronic information and/or electronic documents and/or printouts constitute valid legal evidence"',
            "italic",
          ],
          [
            "This document has been electronically signed using a digital certificate issued by BSrE, BSSN",
            "",
            "normal",
          ],
          [
            "You can verify the authenticity of this document by scanning the QR code",
            "",
            "normal",
          ],
        ];

    items.forEach(([main, sub, style], idx) => {
      // Bullet/indent
      page.drawText(`• ${main}`, {
        x: 55,
        y,
        size: 11,
        font: font,
        color,
      });
      y -= 13;
      if (sub) {
        page.drawText(sub, {
          x: 70,
          y,
          size: 11,
          font: style === "italic" ? fontItalic : font,
          color,
        });
        y -= 13;
      }
      if (idx < items.length - 1) y -= 2;
    });
  });

  return await pdfDoc.save();
}
