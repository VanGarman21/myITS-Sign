// FooterDokumen: Komponen footer dokumen tanda tangan
import React from "react";

interface FooterDokumenProps {
  footerBahasa?: "id" | "en";
  isFooterBlack?: boolean;
  qrCodeBase64?: string;
}

const FooterDokumen: React.FC<FooterDokumenProps> = ({
  footerBahasa = "id",
  isFooterBlack = true,
  qrCodeBase64 = "",
}) => {
  const color = isFooterBlack ? "black" : "white";
  return (
    <div
      style={{
        fontFamily: "Times New Roman",
        fontSize: 12,
        paddingLeft: 3,
        color,
      }}
    >
      <b>{footerBahasa === "id" ? "Catatan:" : "Notes:"}</b>
      <table
        style={{
          fontFamily: "Times New Roman",
          fontSize: 11,
          borderTop: `1px solid ${color}`,
          paddingTop: 5,
          width: "100%",
          marginTop: 4,
        }}
      >
        <tbody>
          <tr>
            <td style={{ paddingRight: "1rem", verticalAlign: "top" }}>
              <ul style={{ paddingLeft: 15, color, margin: 0 }}>
                {footerBahasa === "id" ? (
                  <>
                    <li>
                      UU ITE No 11 Tahun 2008 Pasal 5 ayat 1<br />
                      <i>
                        "Informasi Elektronik dan/atau Dokumen Elektronik
                        dan/atau hasil cetaknya merupakan alat bukti hukum yang
                        sah"
                      </i>
                    </li>
                    <li style={{ marginTop: 3 }}>
                      Dokumen ini telah ditandatangani secara elektronik
                      menggunakan <b>sertifikat elektronik </b>
                      yang diterbitkan <b>BSrE, BSSN</b>
                    </li>
                    <li style={{ marginTop: 3 }}>
                      Dokumen ini dapat dibuktikan keasliannya dengan memindai
                      QR Code
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      ITE Law No. 11 of 2008 Article 5 Paragraph 1<br />
                      <i>
                        "Electronic information and/or electronic documents
                        and/or printouts constitute valid legal evidence"
                      </i>
                    </li>
                    <li style={{ marginTop: 3 }}>
                      This document has been electronically signed using a{" "}
                      <b>digital certificate </b>
                      issued by <b>BSrE, BSSN</b>
                    </li>
                    <li style={{ marginTop: 3 }}>
                      You can verify the authenticity of this document by
                      scanning the QR code
                    </li>
                  </>
                )}
              </ul>
            </td>
            <td style={{ verticalAlign: "top" }}>
              {qrCodeBase64 && (
                <div>
                  <img
                    src={`data:image/png;base64,${qrCodeBase64}`}
                    alt="QR Code"
                    width="54px"
                    height="auto"
                  />
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FooterDokumen;
