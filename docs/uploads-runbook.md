# L1.5 Daily Health: summary and SharePoint uploads (runbook v3, 28 Oct 2026)

Changed 28 Oct 2026 at Sudarsanan's request. The work is split between two scheduled tasks:

- **Part A, the daily 06:45 IST task** ("L1.5 Daily Health Report — by 08:00 IST", trig_018LHUZBE5LjDCxye8aGRtfw) uploads the **summary** from the cloud as soon as the report is published. It needs no laptop. It no longer sends the team email and no longer uploads the full report.
- **Part B, the laptop task** ("L1.5 Daily Health - laptop full-report upload", trig_01FT8GL5g2mn7cuzzJpGiQB8, requires Sudarsanan's laptop) uploads only the **full report** through his OneDrive-synced folder, as soon as the laptop is on. The daily task fires it when it finishes; it also runs at 09:23, 13:23, 17:23 and 21:23 IST, and a run missed while the laptop is off runs when the laptop comes back on.
- **Notification:** the Power Automate flow "L1.5 Daily Health - notify on new SharePoint file" (owner Sudarsanan) fires when a file is created in SharePoint `Support Metrics/L1.5 Daily Health/Summary`. It posts to the Teams group "L1.5 Transformation Group" (Daily summary, Live report, Full report links) and sends the email, with the summary file as the body. It is the only notification: no task sends the report email or posts to Teams. (Verified 27 Oct: the flow's email goes to Sudarsanan only; recipients are set in the flow.)

## Fixed values
- Archive artifact: https://claude.ai/artifact/UsA3tSv64F7UeoWaMrvyhE (`reports/<D>.html`).
- driveId `b!QL69CzHykkeSUZGR8ko2seDEwENw3MdBp_Q37dI5YLNNJ-SH-QSbSYf0a4uHIMfN`; `L1.5 Daily Health` folder item `01QLYSL333DC723RBUFRHZFPT4MOBMJK5W`; `Summary` subfolder item `01QLYSL33TG77RQDYIXZB3VUV3KLRTIRPG` (list with read_resource `file:///<driveId>/<item>`).
- Laptop synced folder: `C:\Users\SudarsananKesavan\OneDrive - netradyne.com\Documents - Ops Customer Support\Support Metrics\L1.5 Daily Health`.
- Files: full report `L1.5_Daily_Health_Report_<D>.html` (200–430 KB) in `L1.5 Daily Health`; summary `L1.5_Daily_Summary_<D>.html` (about 7 KB) in `Summary`.
- State is the two SharePoint folder listings. `claude/l15-daily-health/uploads-log.json` is history only and is no longer updated.

## Part A. Summary upload (daily task, right after the archive publish)
Do this only when the day's report is complete and published to the archive. The summary upload is what notifies the team, so never upload it for a partial or failed run.
1. List the `Summary` folder. If `L1.5_Daily_Summary_<D>.html` is already there, skip Part A (each upload posts to Teams again).
2. `summary_build.py` is restored from the toolkit at `/home/claude/dhr/daily/summary_build.py`. If it is missing, write it from the python block at the end of this doc.
3. `python3 daily/summary_build.py --date <D> --email-html daily/build/<D>/email_<D>.html --out daily/build/<D>/L1.5_Daily_Summary_<D>.html`. The input is the email body `daily_report.py` builds (it is no longer sent). It prints the byte size and the number of rows; rows must be 4 or more.
4. Upload with `mcp__Microsoft_365__sharepoint_upload_file`: driveId above, parentItemId = `Summary` folder item, filename `L1.5_Daily_Summary_<D>.html`, content = the file text verbatim, expectedBytes = its byte size, conflictBehavior `fail`.
5. List the `Summary` folder again and check the file is there with that size. The flow then posts and emails.
6. If the upload fails, don't retry in a loop: try once more, then email Sudarsanan only (sudarsanan.kesavan@netradyne.com) saying the summary was not uploaded, with the live report link `https://claude.ai/artifact/UsA3tSv64F7UeoWaMrvyhE#d<D>`. Never email anyone else and never post to Teams.
7. Then `fire_trigger` trig_01FT8GL5g2mn7cuzzJpGiQB8 once (no text), so the full report goes up as soon as the laptop is on.

## Part B. Full-report upload (laptop task only)
1. Pending days = every D from 2026-09-30 on that has `reports/<D>.html` in the archive (`Artifact action=list, scope=files`) and has no `L1.5_Daily_Health_Report_<D>.html` in the `L1.5 Daily Health` folder listing. Nothing pending: finish in one line, send nothing.
2. Laptop check: `mcp__remote-devices__get_device_info`. If it fails or no device is connected, finish in one line naming the pending days and send nothing; the next run, or the laptop coming back on, catches up.
3. For each pending D, oldest first:
   a. `Artifact action=read, url=<archive>, path=reports/<D>.html` (saved to disk, not shown). Copy it to `/mnt/user-data/outputs/L1.5_Daily_Health_Report_<D>.html` with a short python script that adds, before the first `</header>`: `<p class="live">The live version, with an HTML download, is in the <a href="https://claude.ai/artifact/UsA3tSv64F7UeoWaMrvyhE#d<D>">L1.5 Daily Health Archive</a>, for people with access to it.</p>`, and replaces any email address not ending in `@netradyne.com` with `[personal address]` (free-mail domains) or `[customer address]` (the same rule as `redact()` below). Never print the page.
   b. `SendUserFile` on that file (display attach) to get its `file_uuid`, then `mcp__remote-devices__device_commit_files` with devicePath = the synced folder above + `\L1.5_Daily_Health_Report_<D>.html`.
   c. `mcp__remote-devices__device_list_dir` on the synced folder: the file's size must equal the local file's byte size exactly. A mismatch means a truncated write: don't count it as done.
   d. Confirm OneDrive pushed it up: list the `L1.5 Daily Health` folder with read_resource until the file appears with the same size (check every minute, up to 10 minutes).
4. Never use `sharepoint_upload_file` for the full report, never write to the `Summary` folder (that would post to Teams), never post to Teams, and write only inside `L1.5 Daily Health`.
5. Email Sudarsanan only, and only when a step failed for a day the laptop was reachable (size mismatch, not synced after 10 minutes, commit refused). Say which day and what failed.
6. Final line: the days uploaded (with sizes), or why nothing was done.

## summary_build.py
```python
#!/usr/bin/env python3
"""Build the styled L1.5 Daily Health summary HTML (email body for the Power Automate flow).

Usage: summary_build.py --date 2026-10-27 --email-html body.html --out L1.5_Daily_Summary_2026-10-27.html

Input: the email body daily_report.py builds (daily/build/<D>/email_<D>.html); the sent copy of an older
"L1.5 Daily Health Report - <DD-Mon-YYYY>" email also works.
Output: one self-contained file with inline styles only (Power Automate keeps them; Outlook connector strips them).
Non-Netradyne email addresses are redacted. Salesforce case links are kept.
"""
import argparse, html, re, datetime

ARCHIVE = "https://claude.ai/artifact/UsA3tSv64F7UeoWaMrvyhE"
SP = "https://netorg726775.sharepoint.com/sites/OpsCustomerSupport/Shared%20Documents/Support%20Metrics/L1.5%20Daily%20Health/"
EM = re.compile(r'[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
FREE = re.compile(r'@(gmail|yahoo|hotmail|outlook|icloud|aol|live|msn|proton|ymail|comcast|me)\.', re.I)


def redact(s):
    def r(m):
        a = m.group(0)
        if a.lower().endswith('@netradyne.com'):
            return a
        return '[personal address]' if FREE.search(a) else '[customer address]'
    return EM.sub(r, s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--date', required=True)
    ap.add_argument('--email-html', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    D = a.date
    src = redact(open(a.email_html, encoding='utf-8').read())

    # header block: first <p> -> title / window / produced
    p1 = re.search(r'<p>(.*?)</p>', src, re.S).group(1)
    parts = [re.sub(r'<[^>]+>', '', x).strip() for x in re.split(r'<br\s*/?>', p1)]
    title = parts[0]
    window = parts[1] if len(parts) > 1 else ''
    produced = parts[2] if len(parts) > 2 else ''

    # quick summary list items
    ul = re.search(r'Quick summary</b></p>\s*<ul>(.*?)</ul>', src, re.S).group(1)
    items = re.findall(r'<li>(.*?)</li>', ul, re.S)
    rows = []
    for i, li in enumerate(items):
        m = re.match(r'\s*<b>(.*?)</b>\s*(.*)', li, re.S)
        label, rest = (m.group(1), m.group(2)) if m else ('', li)
        label = label.rstrip(':').strip()
        rest = rest.lstrip(': ').strip()
        rest = re.sub(r'<a ([^>]*?)>', lambda mm: '<a ' + re.sub(r'\s*target="[^"]*"', '', mm.group(1)) + ' style="color:#0b5cad;text-decoration:none">', rest)
        bg = '#f3f6fa' if i % 2 == 0 else '#ffffff'
        rows.append(
            f'<tr style="background:{bg}"><td style="padding:10px 12px;border:1px solid #dde3ea;width:28%;vertical-align:top;font-weight:600">{label}</td>'
            f'<td style="padding:10px 12px;border:1px solid #dde3ea;vertical-align:top">{rest}</td></tr>')

    dt = datetime.date.fromisoformat(D)
    live = f'{ARCHIVE}#d{D}'
    full = f'{SP}L1.5_Daily_Health_Report_{D}.html'
    btn = 'display:inline-block;padding:10px 18px;border-radius:6px;font-weight:600;text-decoration:none;margin:0 8px 8px 0;'
    out = f'''<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;margin:0 auto;border:1px solid #dde3ea;border-radius:8px;overflow:hidden">
<div style="background:#0b3d6e;color:#ffffff;padding:18px 22px"><div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#a9c7e8">Netradyne Support | L1.5</div><div style="font-size:22px;font-weight:600;margin-top:4px">{html.escape(title)}</div><div style="font-size:13px;color:#d6e4f5;margin-top:6px">{html.escape(window)}</div></div>
<div style="padding:18px 22px;background:#ffffff;color:#1f2933;font-size:14px">
<p style="margin:0 0 12px 0;color:#5f6b7a;font-size:13px">{html.escape(produced)}</p>
<div style="font-size:15px;font-weight:600;margin:0 0 8px 0">Quick summary</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">{''.join(rows)}</table>
<div style="margin:20px 0 4px 0">
<a href="{live}" style="{btn}background:#0b3d6e;color:#ffffff">Live report (archive)</a>
<a href="{full}" style="{btn}background:#eaf1f9;color:#0b3d6e;border:1px solid #b9cde4">Full report copy (SharePoint)</a>
<a href="{ARCHIVE}" style="{btn}background:#eaf1f9;color:#0b3d6e;border:1px solid #b9cde4">Archive</a></div>
<p style="margin:10px 0 0 0;font-size:12px;color:#5f6b7a"><i>Findings describe what happened on cases, not people. No scores, rankings or ratings. The live report needs access to the Claude archive; the SharePoint copy is added from Sudarsanan's laptop as soon as it is on, so it can lag behind this message.</i></p>
</div>
<div style="background:#f3f6fa;padding:10px 22px;font-size:12px;color:#5f6b7a">Sent automatically by Power Automate: L1.5 Daily Health - notify on new SharePoint file.</div>
</div>
'''
    open(a.out, 'w', encoding='utf-8').write(out)
    print(a.out, len(out.encode('utf-8')), 'bytes', len(items), 'rows')


if __name__ == '__main__':
    main()
```
