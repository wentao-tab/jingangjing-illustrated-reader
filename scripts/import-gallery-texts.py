"""Import the twelve CBETA TEI editions used by the non-commercial gallery."""

import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

REVISION = "8ebac86d00719479db5777dc6cd77ba111c3067a"
VOLUMES = {
    "T0251": "T08", "T0235": "T08", "T0262": "T09", "T0279": "T10",
    "T0365": "T12", "T0475": "T14", "T0412": "T13", "T0450": "T14",
    "T0366": "T12", "T2008": "T48", "T0784": "T17", "X1220": "X63",
}
TEI = "{http://www.tei-c.org/ns/1.0}"
XML = "{http://www.w3.org/XML/1998/namespace}"
METADATA = {"anchor", "docNumber", "lb", "mulu", "note", "pb", "rdg"}
TEXT_BLOCKS = {"byline", "dateline", "item", "l", "lg", "p", "signed", "trailer"}


def tag(node):
    return node.tag.rsplit("}", 1)[-1]


def tidy(text):
    return re.sub(r"[ \t]*[\r\n]+[ \t]*", "", text or "")


def gaiji_map(header):
    glyphs = {}
    for char in header.iter(f"{TEI}char"):
        mappings = {node.get("type"): node.text for node in char.findall(f"{TEI}mapping")}
        value = mappings.get("unicode")
        if value:
            glyph = "".join(chr(int(part[2:], 16)) for part in value.split())
        else:
            glyph = next(
                (prop.findtext(f"{TEI}value") for prop in char.findall(f"{TEI}charProp")
                 if prop.findtext(f"{TEI}localName") == "composition"),
                f"[{char.attrib[f'{XML}id']}]",
            )
        glyphs["#" + char.attrib[f"{XML}id"]] = glyph
    return glyphs


def text_tokens(node, glyphs):
    kind = tag(node)
    if kind == "milestone" and node.get("unit") == "juan":
        yield int(node.attrib["n"])
    elif kind == "g":
        yield glyphs[node.attrib["ref"]]
    elif kind in {"caesura", "space"}:
        yield "　" * int(node.get("quantity", "1"))
    elif kind not in METADATA and kind != "juan":
        yield tidy(node.text)
        for child in node:
            yield from text_tokens(child, glyphs)
            yield tidy(child.tail)
        if kind == "l":
            yield "\n"


def extract(xml, url):
    root = ET.fromstring(xml)
    header = root.find(f"{TEI}teiHeader")
    glyphs = gaiji_map(header)
    volumes = []
    volume = None
    chapter = None

    def start_volume(number):
        nonlocal volume, chapter
        volume = {"number": number, "chapters": []}
        volumes.append(volume)
        chapter = None

    def start_chapter(title):
        nonlocal chapter
        chapter = {"title": title, "blocks": []}
        volume["chapters"].append(chapter)

    def add_block(kind, tokens):
        parts = []
        # In long editions a new volume can begin inside a chapter or a verse.
        for token in [*tokens, None]:
            if isinstance(token, str):
                parts.append(token)
                continue
            text = "".join(parts).strip()
            if text:
                if chapter is None:
                    start_chapter("")
                chapter["blocks"].append([kind, text])
            parts.clear()
            if isinstance(token, int):
                start_volume(token)

    def walk(node):
        kind = tag(node)
        if kind == "milestone" and node.get("unit") == "juan":
            start_volume(int(node.attrib["n"]))
        elif kind in {"head", "jhead"}:
            title = "".join(text_tokens(node, glyphs)).strip()
            if title:
                start_chapter(title)
        elif kind in TEXT_BLOCKS:
            block_type = "verse" if kind in {"l", "lg"} else kind
            add_block(block_type, text_tokens(node, glyphs))
        elif kind not in METADATA and not (kind == "juan" and node.get("fun") == "close"):
            for child in node:
                walk(child)

    walk(root.find(f"{TEI}text/{TEI}body"))
    for volume in volumes:
        volume["chapters"] = [chapter for chapter in volume["chapters"] if chapter["blocks"]]
    extent = header.findtext(f".//{TEI}extent")
    assert [volume["number"] for volume in volumes] == list(range(1, int(re.match(r"\d+", extent)[0]) + 1))
    assert all(volume["chapters"] for volume in volumes)
    return {
        "sourceUrl": url,
        "edition": header.findtext(f".//{TEI}edition"),
        "date": header.findtext(f".//{TEI}publicationStmt/{TEI}date"),
        "author": header.findtext(f".//{TEI}titleStmt/{TEI}author"),
        "sourceHeader": re.search(r"<teiHeader>.*?</teiHeader>", xml, re.S)[0],
        "volumes": volumes,
    }


if __name__ == "__main__":
    target = Path(__file__).resolve().parents[1] / "src/data/gallery-texts.json"
    texts = {}
    for code, volume in VOLUMES.items():
        url = f"https://raw.githubusercontent.com/cbeta-org/xml-p5/{REVISION}/{code[0]}/{volume}/{volume}n{code[1:]}.xml"
        with urllib.request.urlopen(url, timeout=30) as response:
            texts[code] = extract(response.read().decode(), url)
        print(code, len(texts[code]["volumes"]))
    target.write_text(json.dumps(texts, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
