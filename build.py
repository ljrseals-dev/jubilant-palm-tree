#!/usr/bin/env python3
"""Build index.html (standalone, works with a live mic in a normal browser) and dist/artifact.html.

src/blowtorch.body.html is the source of truth (the same page is published as an Artifact).
The chat bot's system prompt is embedded from prompts/blowtorch_system_prompt.md at build time.
"""
import json
from pathlib import Path

root = Path(__file__).parent
body = (root / "src" / "blowtorch.body.html").read_text(encoding="utf8")

prompt = (root / "prompts" / "blowtorch_system_prompt.md").read_text(encoding="utf8")
# Drop the "paste everything below the line" header; keep what follows the first rule.
prompt = prompt.split("\n---\n", 1)[1].strip()
literal = json.dumps(prompt, ensure_ascii=False).replace("</", "<\\/").replace("<!--", "<\\!--")
token = '/*__SYSTEM_PROMPT__*/ ""'
assert body.count(token) == 1, "system prompt placeholder not found exactly once"
body = body.replace(token, literal)

page = (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
    "<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n"
    "</head>\n<body>\n" + body + "\n</body>\n</html>\n"
)
(root / "index.html").write_text(page, encoding="utf8")
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(body, encoding="utf8")
print(f"wrote index.html and dist/artifact.html (system prompt: {len(prompt)} chars)")
