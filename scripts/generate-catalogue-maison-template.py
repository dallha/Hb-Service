from __future__ import annotations

import os
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape


OUTPUT = Path("public/downloads/catalogue-maison-import-template.xlsx")

SHEET1_HEADERS = [
    "nom",
    "slug",
    "marque",
    "categorie",
    "genre",
    "description",
    "nouveau",
    "page_source",
    "nom_arabe",
    "image_url",
    "taille",
    "prix",
    "prix_barre",
    "stock",
    "sku",
    "ordre",
]


def col_letter(n: int) -> str:
    result = ""
    while n:
        n, rem = divmod(n - 1, 26)
        result = chr(65 + rem) + result
    return result


def inline_cell(ref: str, value: str, style: int = 0) -> str:
    return f'<c r="{ref}" t="inlineStr" s="{style}"><is><t>{escape(value)}</t></is></c>'


def num_cell(ref: str, value: int | float, style: int = 0) -> str:
    return f'<c r="{ref}" s="{style}"><v>{value}</v></c>'


def build_sheet1() -> str:
    header_row = "".join(
        inline_cell(f"{col_letter(i)}1", header, style=1)
        for i, header in enumerate(SHEET1_HEADERS, start=1)
    )

    sheet_data = f"""
    <sheetData>
      <row r="1" spans="1:16" ht="22" customHeight="1">{header_row}</row>
      <row r="2" spans="1:16" ht="20" customHeight="1">
        {inline_cell("A2", "Commence ici", style=2)}
        {inline_cell("B2", "Laisse vide si inutile", style=3)}
      </row>
    </sheetData>
    """.strip()

    validations = """
    <dataValidations count="2">
      <dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="E2:E1048576">
        <formula1>"H,F,U"</formula1>
      </dataValidation>
      <dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="G2:G1048576">
        <formula1>"oui,non"</formula1>
      </dataValidation>
    </dataValidations>
    """.strip()

    cols = """
    <cols>
      <col min="1" max="1" width="26" customWidth="1"/>
      <col min="2" max="2" width="28" customWidth="1"/>
      <col min="3" max="3" width="22" customWidth="1"/>
      <col min="4" max="4" width="20" customWidth="1"/>
      <col min="5" max="5" width="12" customWidth="1"/>
      <col min="6" max="6" width="42" customWidth="1"/>
      <col min="7" max="7" width="12" customWidth="1"/>
      <col min="8" max="8" width="12" customWidth="1"/>
      <col min="9" max="9" width="18" customWidth="1"/>
      <col min="10" max="10" width="24" customWidth="1"/>
      <col min="11" max="11" width="16" customWidth="1"/>
      <col min="12" max="12" width="14" customWidth="1"/>
      <col min="13" max="13" width="14" customWidth="1"/>
      <col min="14" max="14" width="12" customWidth="1"/>
      <col min="15" max="15" width="20" customWidth="1"/>
      <col min="16" max="16" width="12" customWidth="1"/>
    </cols>
    """.strip()

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:P2"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A2" sqref="A2"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  {cols}
  {sheet_data}
  <autoFilter ref="A1:P2"/>
  {validations}
</worksheet>
"""


def build_sheet2() -> str:
    rows = [
        ("A1", "Catalogue maison - mode d'emploi", 4),
        ("A3", "1. Télécharge le modèle CSV ou Excel.", 0),
        ("A4", "2. Remplis une ligne par variante. Si un produit a plusieurs tailles, répète le nom et change seulement la taille/prix.", 0),
        ("A5", "3. Réimporte le fichier depuis la page catalogue maison.", 0),
        ("A7", "Champs obligatoires", 4),
        ("A8", "nom, slug, marque, categorie, genre, description, taille, prix, stock, ordre", 0),
        ("A10", "Valeurs autorisées", 4),
        ("A11", "genre = H, F, U", 0),
        ("A12", "nouveau = oui / non", 0),
        ("A14", "Conseil", 4),
        ("A15", "Utilise un slug unique. Exemple: oud-noir-intense, rose-safran, huile-d-ambre.", 0),
    ]

    cell_xml = "\n".join(
        inline_cell(ref, value, style=style) if ref != "A8" and ref != "A11" and ref != "A12" else inline_cell(ref, value, style=0)
        for ref, value, style in rows
    )

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:A15"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <selection activeCell="A1" sqref="A1"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>
    <col min="1" max="1" width="110" customWidth="1"/>
  </cols>
  <sheetData>
    {"".join(f'<row r="{ref[1:]}" spans="1:1" ht="20" customHeight="1">{inline_cell(ref, value, style=style)}</row>' for ref, value, style in rows)}
  </sheetData>
</worksheet>
"""


def build_styles() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
    <font><i/><sz val="10"/><color rgb="FF666666"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FF666666"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD4AF37"/><bgColor rgb="FFD4AF37"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF5F0E8"/><bgColor rgb="FFF5F0E8"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE8E0D5"/></left>
      <right style="thin"><color rgb="FFE8E0D5"/></right>
      <top style="thin"><color rgb="FFE8E0D5"/></top>
      <bottom style="thin"><color rgb="FFE8E0D5"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center" wrapText="1"/>
    </xf>
  </cellXfs>
</styleSheet>
"""


def build_workbook_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Import Catalogue" sheetId="1" r:id="rId1"/>
    <sheet name="Aide" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>
"""


def build_workbook_rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""


def build_root_rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"""


def build_content_types() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""


def build_core_props() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Catalogue Maison HB_Service</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-06-01T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-01T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"""


def build_app_props() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>2</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="2" baseType="lpstr">
      <vt:lpstr>Import Catalogue</vt:lpstr>
      <vt:lpstr>Aide</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>HB_Service</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>
"""


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", build_content_types())
        zf.writestr("_rels/.rels", build_root_rels())
        zf.writestr("docProps/core.xml", build_core_props())
        zf.writestr("docProps/app.xml", build_app_props())
        zf.writestr("xl/workbook.xml", build_workbook_xml())
        zf.writestr("xl/_rels/workbook.xml.rels", build_workbook_rels())
        zf.writestr("xl/styles.xml", build_styles())
        zf.writestr("xl/worksheets/sheet1.xml", build_sheet1())
        zf.writestr("xl/worksheets/sheet2.xml", build_sheet2())

    print(f"Created {OUTPUT}")


if __name__ == "__main__":
    main()
