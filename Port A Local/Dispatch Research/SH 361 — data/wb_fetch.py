#!/usr/bin/env python3
"""Fetch a URL via the Wayback Machine raw capture (id_ mode) and print readable text.
Usage: wb_fetch.py <url> [timestamp-prefix e.g. 2026|2025|20240401]
Falls back to the live URL if no capture. Prints title/date/byline/body for South Jetty pages.
"""
import sys, re, html, subprocess, time

def curl(url, timeout=45):
    r = subprocess.run(["curl","-sL","--compressed","--max-time",str(timeout),"-A","Mozilla/5.0","-w","\n@@HTTP=%{http_code} URL=%{url_effective}",url],capture_output=True,text=True,errors="ignore")
    out = r.stdout
    m = re.search(r"@@HTTP=(\d+) URL=(\S+)\s*$", out)
    code = int(m.group(1)) if m else 0
    eff = m.group(2) if m else ""
    body = out[:m.start()] if m else out
    return code, eff, body

def clean(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<noscript.*?</noscript>", "", s, flags=re.S|re.I)
    # keep paragraph breaks
    s = re.sub(r"</(p|div|h\d|li|tr|br)>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return s.strip()

def main():
    url = sys.argv[1]
    ts = sys.argv[2] if len(sys.argv) > 2 else "2026"
    tries = [f"https://web.archive.org/web/{ts}id_/{url}", url]
    for attempt, u in enumerate(tries):
        code, eff, body = curl(u)
        if code == 200 and len(body) > 2000:
            print(f"# SOURCE: {eff}")
            txt = clean(body)
            # trim South Jetty chrome: start at the article title if found
            m = re.match(r"\s*(.+?) - Port Aransas South Jetty", txt)
            if m:
                title = m.group(1).strip()
                j = txt.find(title, m.end())
                if j > 0:
                    txt = txt[j:]
            else:
                m = re.search(r"\n([^\n]{5,140})\n\s*(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}", txt)
                if m:
                    txt = txt[m.start():]
            end = txt.find("Error loading comments")
            if end > 0: txt = txt[:end]
            print(txt[:20000])
            return
        elif code == 429:
            time.sleep(8)
    print(f"# FAILED code={code} url={url}")

if __name__ == "__main__":
    main()
