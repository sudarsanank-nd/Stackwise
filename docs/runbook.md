# L1.5 Daily Health — daily job runbook

This runbook is for the scheduled job that runs every day, weekends included, at **06:45 IST** (01:15 UTC), 15 minutes after the review window closes, so the report is out by **08:00 IST**. (Until 28 Sep it ran at 11:00 IST.) L1.5 works 24/7, so every day is reviewed. Owner: Sudarsanan Kesavan.

**Changed 28 Oct 2026 (asked by Sudarsanan): summary upload replaces the team email, from the 29 Oct run onward.**
- **No team email.** The run no longer sends `email_D.html` to anyone. `daily_report.py` still builds it, because it is the input for the summary.
- **Summary upload at the end of the run** (step 7): right after the archive publish, the run builds `L1.5_Daily_Summary_D.html` with `summary_build.py` and uploads it from the cloud to SharePoint `Support Metrics/L1.5 Daily Health/Summary`. No laptop is needed. The Power Automate flow "L1.5 Daily Health - notify on new SharePoint file" fires on the new file, posts to the Teams group "L1.5 Transformation Group" and sends the email. That flow is the only notification: the run doesn't email the report or post to Teams.
- **No full-report SharePoint upload from this run** (step 6b). The laptop task "L1.5 Daily Health - laptop full-report upload" puts the full tabbed report into SharePoint through Sudarsanan's OneDrive-synced folder as soon as his laptop is on. This run fires it at the end of step 7. This also removes the run's largest token cost.
- Details: `claude/l15-daily-health/uploads-runbook.md`, Part A (this run) and Part B (the laptop task).

**Changed 01 Oct 2026 (asked by Sudarsanan): new-case volume, from the 02 Oct run onward.** Every Support Case created in the window is pulled (step 3, item 4b) and `new_cases.py` counts them by 12-hour window (06:30–18:30 and 18:30–06:30 IST): how many came to L1.5, and how many were touched, worked on or given only an initial response. The same is counted per engineer. `daily_report.py` shows it on Day at a glance (a sixth line and a 12-hour table), the Volume tab (four New cases columns and a follow-up table on the previous run's initial-response-only cases), each per-resource card, the Metrics tab (KPI and definitions), the email (one more quick-summary line) and the archive list. `kb_update.py` stores the totals in the daily log. Initial response only is a count, not a finding: never compare engineers on it.

**Changed 30 Sep 2026 (asked by Sudarsanan): short email, from the 01 Oct run onward.** The email no longer repeats the report. It carries the window (and the produced time when late), a four-line quick summary (volume and calls; first response and resolution SLA with open cases past target; privacy cases needing action today, linked, plus how many are carried over; the three largest gaps) and the three report links. The tables, calls by shift, privacy table and gaps are in the tabbed report. `daily_report.py` builds it (`short_email`), about 2 KB; the narrative's `email_actions` is no longer used. A styled copy of the old long email (header band, tiles, bordered tables) is parked in `src/email_style.py`: the Outlook connector refuses or strips every style attribute (retested 30 Sep), so it can only be sent by a sender that keeps inline styles, such as a Power Automate flow. Don't use it in the daily run. (From 29 Oct the email is not sent; it is the input for the summary.)

**Changed 30 Sep 2026 (asked by Sudarsanan): token optimisation, from the 30 Sep run onward.** The 30 Sep 06:45 run stopped on a usage limit. The job now:
- **Restores from the toolkit artifact** (https://claude.ai/artifact/KwyJPmGJSb4LohnzoUzav7): one file, `dhr_toolkit.txt`, holds every script, prompt, the brief, the baseline register and `kb_state.json`. Artifact read saves it to disk without showing it, so the restore costs no tokens. Project docs stay the readable copy and the fallback (step 0).
- **Reviews cases in tiers** (step 4): full sonnet review on compact dossiers for anything with a privacy, UK/EU, escalation, resolution, closure, reopen, complaint, bounce-back, P1 or routing-rule signal; a haiku screen for the remaining routine cases, with every case it flags sent to a full review; rule checks only for cases with no L1.5 email or comment in the window. Reviewers assign the theme id themselves from `ref/theme_catalogue.txt`.
- **Keeps the main session small:** `kb_brief.py` replaces reading `kb_state.json`, `merge_reviews.py` writes `out/digest.md` (read that, never the review JSON), `ref/narrative_schema.md` replaces reading the previous narrative, `rules.py` prints counts only, the delta subagent runs on sonnet.
- **Project saves use `local_path`**, never pasted content.
- Unchanged at the time: the window, sources, rules, owner decisions, report sections, tabbed SharePoint copy, email layout and recipients.
- **Data impact:** theme counts judged by reviewers are not directly comparable with runs before 30 Sep (compact dossiers, tiering, reviewer-assigned theme ids). On 30 Sep only, `today_counts.json` carries `"method_change": true`, so those themes show direction "method change". Rule-based themes (T07, T08, T13, T17, T20, T24), volume, SLA, calls and at-risk numbers are computed exactly as before.

**Changed 29 Sep 2026 (asked by Sudarsanan), from the 30 Sep run onward:**
- No PDF. The archive day view's download button now saves the tabbed HTML report (`reports/D.html`). Don't render a PDF, don't upload one as an asset and don't pass `--pdf-asset`.
- The SharePoint copy is **always the tabbed layout**, whatever its size. Never fall back to `--sp-compact`. The 29 Sep tabbed file (279 KB, 698 findings) went up in one call and was verified identical.
- **Email** (superseded from 01 Oct by the short email above, and not sent from 29 Oct): layout with tables (Day at a glance, incoming calls by shift, privacy actions, top gaps, report links) and red/amber/green status markers. The Outlook connector allows only plain tags with no attributes (no fonts, colours or styles), so the markers are the only colour. `daily_report.py` builds it and refuses to write a body outside the allowlist.
- **Incoming calls by shift** on the Day at a glance tab (in the email until 30 Sep): Morning 06:00–15:00, General 10:30–19:30, Evening 18:30–03:30, Night 21:30–06:30 IST. Shifts overlap, so the per-shift table counts overlap calls in both shifts, and a time-band table counts each call once. Needs `raw/calls_rows.json` (step 3.3).
- **Links:** every case number links to its Salesforce record (`https://netradyne.my.salesforce.com/<Id>`); Confluence page ids show as linked page titles (`daily/kb_pages.json`). In the tabbed page the case links are added in the browser from one map, which keeps the file small. Needs `raw/case_links_extra.json` for case numbers outside today's pull (step 6.0).
- **Owner decisions OD-1 to OD-5** (baseline register, section 2): personal addresses are allowed for Amazon DSPs (validate, flag only drivers or not-found users; the IDMS resource lookup is not reachable, so this is a driver check through Driver•i); for Amazon UK Event Access L1.5 may place the footage request but the customer response must come from Amazon L2; 02601087 is done; ignore the 25–27 Sep windows; KB ids become linked titles.

- **Review window:** 06:30 IST the previous day to 06:30 IST on the run day, which is 01:00 UTC to 01:00 UTC. The run time is not the window.
- **Every run is a fresh session.** Everything the job needs is in the toolkit artifact and in the project under `claude/l15-daily-health/`.
- **Rules that never change:**
  - Work only from real records. Never estimate or fill gaps.
  - No ranking, scoring or rating of individuals.
  - Tie every finding to a case number, email or Teams message.
  - Flag GDPR prominently for same-day action.
  - Separate process gaps from knowledge gaps from one-offs.
  - Where unclear process, missing KB content, tooling or workload could explain a gap, say so.
  - State what could not be verified.
  - The full standard is in `review-brief.md` (`ref/review_brief.md`).
- **Keep the main context small:** never cat or Read dossiers, batch files, review JSONL, raw pulls or `kb_state.json` in the main session. Scripts print short summaries; read `out/kb_brief.md` and `out/digest.md` instead.

## 0. Restore the workspace (under a minute, no tokens)

1. `Artifact action=read, url=https://claude.ai/artifact/KwyJPmGJSb4LohnzoUzav7, path=dhr_toolkit.txt`. The result gives the saved path. Unbundle it:
   ```
   python3 - <<'EOF'
   import os
   s = open('<saved path>', encoding='utf-8').read(); i = n = 0
   while True:
       j = s.find('#==== FILE: ', i)
       if j < 0: break
       e = s.index('\n', j); p, c = s[j + 12:e].split(' CHARS: '); c = int(c.split()[0])
       os.makedirs(os.path.dirname('/home/claude/' + p), exist_ok=True)
       open('/home/claude/' + p, 'w', encoding='utf-8').write(s[e + 1:e + 1 + c]); i = e + 1 + c; n += 1
   print('restored', n)
   EOF
   ```
   Then `python3 /home/claude/dhr/make_toolkit.py --check`. It prints the toolkit's `published_utc` and any file that doesn't match the manifest.
2. Freshness: call `project_info` once. For each doc in the table below, if the project copy's `created_at` is **later** than the toolkit's `published_utc` (someone edited it by hand), or the file is missing from the toolkit, restore that doc from the project (`project_read`, then write it to the local path) and say so in the method line. Otherwise use the toolkit copy and don't read the project doc.

| Project doc | Local path |
|---|---|
| `claude/l15-daily-health/state/kb_state.json` | `/home/claude/dhr/daily/kb_state.json` |
| `claude/l15-daily-health/baseline-register.md` | `/home/claude/dhr/daily/baseline-register.md` |
| `claude/l15-daily-health/review-brief.md` | `/home/claude/dhr/ref/review_brief.md` |
| `src/build.py`, `analyze.py`, `rules.py`, `scope_adjust.py`, `metrics_scoped.py`, `triage.py`, `merge_reviews.py`, `make_toolkit.py`, `new_cases.py` | `/home/claude/dhr/<name>` |
| `src/daily_report.py`, `kb_update.py`, `kb_render.py`, `kb_brief.py`, `case_links.py`, `kb_pages.json`, `theme.css`, `sp_theme.css` | `/home/claude/dhr/daily/<name>` |
| `src/review_S.md`, `screen_H.md`, `narrative_schema.md` | `/home/claude/dhr/ref/<name>` |

   `summary_build.py` (step 7) is in the toolkit at `dhr/daily/summary_build.py`; if it is missing, write it from the python block at the end of `uploads-runbook.md`. `src/review_prompt_r.md`, `make_pdf.js` and the previous day's `narrative.json` are no longer used. Open `claude/l15-daily-health/baseline/*.md` (the full rule digests) only when a delta check says a rule changed.
3. If the toolkit can't be read at all, restore every doc in the table from the project and carry on; step 8 republishes the toolkit.

Playwright and Chromium are preinstalled. Run node with `NODE_PATH=$(npm root -g)` if you need it.

## 1. Load memory

1. Set D to today's IST date. Run `python3 daily/kb_brief.py D` and read what it prints (`out/kb_brief.md`, about 6–9 KB): distribution flag, watermarks, open themes with streaks and the last three counts, the KB, instruction and probing keys, decisions pending, open actions, the last daily-log row and the next theme id. It also writes `ref/theme_catalogue.txt` for the reviewers. Don't read `kb_state.json` itself; when you need one field, print it with a one-line python command.
2. Write `/home/claude/dhr/run_config.json` with these fields:
   - `date` = D
   - `window_start_utc` = (D−1)T01:00:00
   - `window_end_utc` = DT01:00:00
   - `window_label`, e.g. `06:30 IST 29 Sep → 06:30 IST 30 Sep 2026`
   - `role_holders`: from the User query in step 3
   - `excl_user`: from the scope rules (print `scope_rules` from `kb_state.json`)
   - `excl_pairs`: from step 3.4
3. Compare `watermarks.last_run_date` with D−1. If days were missed, say so in "Changes since last run" and in "For you". Those windows are not reviewed unless Sudarsanan asks. The 25–27 Sep gap is closed: don't mention it (OD-4).

## 2. Delta checks: only what changed since the last run

One general-purpose subagent **on sonnet** (`model: "sonnet"`) runs all four checks. It follows `daily/baseline-register.md` section 4 exactly, uses the watermarks printed by `kb_brief.py`, writes `out/delta_D.json` (changes, baseline_changes, register row edits, new watermarks) plus `daily/shift_D.json`, applies any register edits to `daily/baseline-register.md` itself, and replies in under 150 words.

- **Confluence:** run the two CQL checks, for new and edited pages. Read only the pages they return. Compare each with its baseline row or digest. Record what changed and apply the new version from today.
- **Outlook:** check mail since the watermark only, from the listed senders, DLs and topics. Keep only new instructions, corrections, team agreements and overrides.
- **Teams:** list the chats first and open only the listed chats whose last update is after the watermark. Numbering continues from the next PI number in `baseline-register.md` (PI-66 as of 29 Sep). Also collect shift and leave posts for `shift_D.json`, keyed by the Salesforce user name (Teams display names differ, e.g. "Sai Dhavala" = Sai Prashanth Dhavala, "Arpitha K M" = Arpitha KM, "Anirudh Menon" = Anirudh Menon S).
- **GDPR documents:** run the SharePoint check for new versions.

If a source has nothing new, write one line such as "No KB changes since last run." and move on.

The output of this step feeds three places:

- Up to 3 lines for the report's "Changes since last run".
- `baseline_changes[]` entries.
- Updated rows in `baseline-register.md` for anything that changed, with its date.

## 3. Salesforce: cases touched in the window only

Pull only cases touched inside the window. Earlier days are never re-pulled. The one addition is the new-case pull in item 4b: every Support Case created inside the window.

Use `mcp__Salesforce_Production_Read_Only__soqlQuery`. Save results to `/home/claude/dhr/raw/` with the file names below. The scripts expect these exact shapes.

- W0 and W1 are the window bounds in UTC, for example `2026-09-24T01:00:00Z`.
- The connector returns at most 1000 rows. It does not follow `nextRecordsUrl`.
- Queries that include `EmailMessage.TextBody` page at **200** rows (seen 29 Sep; earlier notes said 250). Slice every such query to 195 rows or fewer and check `done: true`.
- Small results come back inline. To force a spill to disk, add a wide subquery such as `(SELECT Id, TextBody FROM EmailMessages)`, or a long text field such as `Parent.Description` or `Case.Description`.
- A CaseHistory semi-join on CaseHistory is not allowed.
- Normalise `\xa0` in user names.
- The long pulls (3.3 `emails_all`/`comments_all`, and `cases_a`/`longtext`) go to two sonnet subagents that read `raw/case_ids.json` themselves, so the Id lists stay out of the main context. They reply with row counts only.

1. **Users:** `SELECT Id, Name, IsActive, Title FROM User WHERE UserRole.Name = 'Customer Support' AND IsActive = true`. The result goes into `role_holders`.
2. **Case set (L1.5 actions in the window):**
   - `raw/chrows_all.json` (a list):
     ```
     SELECT Id, CaseId, Case.CaseNumber, CreatedById, CreatedBy.Name, CreatedDate, Field, DataType, OldValue, NewValue FROM CaseHistory WHERE CreatedBy.UserRole.Name = 'Customer Support' AND CreatedDate >= W0 AND CreatedDate < W1
     ```
     Slice by hour so each query returns 550 rows or fewer. Get hourly counts first with `HOUR_IN_DAY(CreatedDate)`.
   - `raw/emails_out.json` (`{records}`):
     ```
     SELECT Id, ParentId, CreatedById, CreatedBy.Name, CreatedDate, MessageDate, Subject, FromAddress, ToAddress, CcAddress, BccAddress, Incoming, Status, HasAttachment FROM EmailMessage WHERE Incoming = false AND CreatedBy.UserRole.Name = 'Customer Support' AND CreatedDate >= W0 AND CreatedDate < W1
     ```
   - `raw/comments.json` (`{records}`):
     ```
     SELECT Id, ParentId, CreatedById, CreatedBy.Name, CreatedDate, IsPublished FROM CaseComment WHERE CreatedBy.UserRole.Name = 'Customer Support' AND CreatedDate >= W0 AND CreatedDate < W1
     ```
   - `raw/case_ids.json`: the union of Case ids from the three pulls above.
3. **Case details for the set.** Use `Id IN (...)`, sliced.
   - `raw/cases_a.json` (`{records}`), with these fields: Id, CaseNumber, OwnerId, Owner.Name, Owner_Role__c, RecordType.Name, AccountId, Account.Name, Account.Parent.Name, Account_Country__c, CreatedDate, ClosedDate, IsClosed, Status, Sub_Status__c, Origin, Type, Case_Topic__c, Sub_Topic__c, Topic__c, Addl_Details__c, Priority, Subject, SuppliedEmail, Email_to_Case_DL__c, Data_Access_Region__c, Escalation_Type__c, Number_Of_Reopens__c, Resolution_Time__c, Response_Time_in_Hours__c, Intial_Response_Time__c, IR_SLA_CHECK__c, RT_SLA_CHECK__c, SLA_Compliant__c, L1_OLA_Compliance__c, Time_Remaining_for_Resolution__c, Customer_Waiting_Time__c, SLA_Paused_Timestamp__c, Actionable_Time_Taken_By_L1__c, Time_taken_by_L1_to_Escalate__c, Jira_ticket_URL__c, Device_Serial_Number__c, ParentId, Customer_Escalated__c, First_Response_Resolution__c, LastModifiedDate.
   - `raw/core_extra.json`: `{"records": []}` unless a second slice is needed.
   - `raw/longtext.json`: a dict keyed by Case Id, with these fields: Id, CaseNumber, Description, Internal_Resolution_Notes__c, Resolution_Details__c, Reason_for_Escalation__c, Root_Cause__c, Current_Status_Remarks__c, Resolution_Comments__c, Customer_Escalated_Reason__c, ContactEmail, Contact.Name, SuppliedName.
   - `raw/emails_all.json` (a list): every EmailMessage on the set, with Id, ParentId, Incoming, CreatedDate, MessageDate, CreatedBy.Name, FromAddress, FromName, ToAddress, CcAddress, Subject, Status, HasAttachment and TextBody. Slice each query to 195 rows or fewer.
   - `raw/comments_all.json` (a list): every CaseComment on the set, with Id, ParentId, CreatedDate, CreatedBy.Name, CreatedBy.UserRole.Name, IsPublished and CommentBody.
   - `raw/l2_owner_changes.json` (`{records}`): Owner changes in the window by the L2 roles (Commercial Support, Reseller Support, Amazon NA Support, Amazon EU Support, and I&A / Support Manager if present). Use `Field = 'Owner'`. These are the bounce-backs.
   - `raw/calls_agg.json`: `{name: {"in": [n, secs], "out": [n, secs]}}`, from:
     ```
     SELECT Owner.Name, CallType, COUNT(Id) n, SUM(CallDurationInSeconds) s FROM Task WHERE CallDurationInSeconds > 0 AND Owner.UserRole.Name = 'Customer Support' AND CreatedDate >= W0 AND CreatedDate < W1 GROUP BY Owner.Name, CallType
     ```
   - `raw/calls_rows.json` (a list, one record per call; used for calls by shift):
     ```
     SELECT Id, Owner.Name, CallType, CallDurationInSeconds, CreatedDate FROM Task WHERE CallDurationInSeconds > 0 AND Owner.UserRole.Name = 'Customer Support' AND CreatedDate >= W0 AND CreatedDate < W1
     ```
     About 70 rows, so it comes back inline: save the records with a short Python script (keep `Owner.Name`, `CallType`, `CallDurationInSeconds`, `CreatedDate`). Check that the per-person counts and seconds equal `calls_agg.json`.
4. **Scope.** Apply the scope rules from `kb_state.json`.
   - For Angelika Sahoo, pull the full Owner history of every case she acted on:
     ```
     SELECT CaseId, Case.CaseNumber, CreatedDate, CreatedBy.Name, OldValue, NewValue FROM CaseHistory WHERE Field = 'Owner' AND DataType = 'Text' AND CaseId IN (...)
     ```
   - A case that reached her from an L2 queue or L2 user, or that she took back from one, goes into `excl_pairs`.
   - Anyone newly announced as moved to L2 stays in scope until Sudarsanan confirms. Flag them in "For you".
4b. **New cases (from the 02 Oct run).** Every Support Case created in the window, whoever owns it, and its owner history. Pull each in two halves split at W0 + 12 h (13:00 UTC, which is 18:30 IST): W0 to W0 + 12 h, then W0 + 12 h to W1. The long text field is there only to make the result spill to a file. Check `done: true` and that the record count equals `totalSize` on every slice; if a half returns 1000 rows or `done: false`, split it by hour. On 28 Sep (a Sunday) this was 109 cases and 154 history rows; on 30 Sep (a weekday) 288 cases and 450 history rows.
   - Cases:
     ```
     SELECT Id, CaseNumber, CreatedDate, Origin, CreatedBy.Name, Owner.Name, Owner_Role__c, Status, Parent.Description FROM Case WHERE RecordType.Name = 'Support Case' AND CreatedDate >= <from> AND CreatedDate < <to> ORDER BY CreatedDate
     ```
   - Owner history:
     ```
     SELECT Id, CaseId, Case.CaseNumber, CreatedDate, CreatedBy.Name, OldValue, NewValue, Case.Description FROM CaseHistory WHERE Field = 'Owner' AND DataType = 'Text' AND CaseId IN (SELECT Id FROM Case WHERE RecordType.Name = 'Support Case' AND CreatedDate >= <from> AND CreatedDate < <to>) ORDER BY CaseId, CreatedDate
     ```
   - Merge each pair of spilled results (the script checks every slice is complete): `python3 new_cases.py --merge raw/new_cases.json <file 1> <file 2>` and `python3 new_cases.py --merge raw/new_owner_hist.json <file 1> <file 2>`.
   - Device Case records (automated device health, about 690 on 28 Sep), GTM and Feature Request records are not counted.
5. Run the scripts in `/home/claude/dhr`, in this order: `python3 build.py`, `python3 analyze.py`, `python3 rules.py`, `python3 scope_adjust.py`, `python3 metrics_scoped.py`, `python3 new_cases.py`, then `python3 triage.py`.
   - `build.py` writes one dossier per case and `out/cases.json`.
   - `rules.py` writes `out/rules.json` and prints counts only. It checks mandatory fields, IRN on closure, WFC moves with no customer email within 2 h, account routing (Pepsi/Frito-Lay, DHL, Student Transportation of America, Amazon UK Event Access), bounce-backs and requester dropped.
   - `new_cases.py` writes `out/new_cases.json`: new cases by 12-hour window, how many came to L1.5 (started in the L1 Support queue or created by an L1.5 engineer), went to another team, were touched, worked on, given only an initial response or updated only; the same per engineer; and a follow-up on the previous run's initial-response-only cases (from `kb_state.json`; the first follow-up table appears on 03 Oct). The definitions are in its docstring and on the report's Metrics tab. It checks that the halves and totals reconcile and stops if a pull was incomplete. If it prints a `WARNING` line, a case L1.5 touched is missing from `raw/new_cases.json`: check that case's record type before reporting. `daily_report.py` and `kb_update.py` read `out/new_cases.json` themselves; nothing goes into the narrative or `today_counts.json`.
   - `triage.py` tiers every in-scope case and writes the batch prompts (step 4). Check its tier split looks sane (on 24 Sep data: about two thirds full review, a quarter screened, under a tenth rules only).

## 4. Case review (tiered)

`triage.py` has already written everything the reviewers need:

- `out/triage.json`: each case's tier (`S` full review, `H` screen, `T0` rules only) and the signals behind it.
- `out/batches/plan.json`: one entry per batch with its model (`sonnet` for S, `haiku` for H), cases, part files and output file.
- `out/batches/<B>.prompt.md`: the complete prompt for batch B (window, in-scope names with Jayanth Krishna excluded, part files, output path and the owner decisions are already filled in).

1. Launch one general-purpose subagent per batch in `plan.json`, with `model` set to the batch's model and this prompt only: `Read /home/claude/dhr/out/batches/<B>.prompt.md and follow it exactly.` Launch several per message (up to 10 at a time) so they run in parallel. Each agent reads its part files in one turn and writes its JSONL in one call; don't read their output files yourself.
2. When every H batch has finished, run `python3 triage.py --wave2`. It sends every case the haiku screen marked `review` (or left unscreened) into S2 batches (`out/batches/plan_wave2.json`). Launch those on sonnet the same way.
3. Run `python3 merge_reviews.py D`. It prints coverage and lists any missing cases. If some are missing (an agent stopped early), relaunch that batch's prompt; the agent writes only the missing cases. Repeat until nothing is missing.
4. Theme ids: the reviewers give each finding a `tid` from `ref/theme_catalogue.txt`, `P` for probing, or `NEW: <title>`. `merge_reviews.py` lists the NEW titles. Map each one to an existing theme when it matches one (never create a duplicate), otherwise to a new id (next id from `kb_brief.py`, T32 onward as of 29 Sep), in `out/tid_map.json` (`{"NEW: title": "T04", ...}`). Then run `python3 merge_reviews.py D --map out/tid_map.json`.
5. Verify before reporting, then record the results in `out/verify.json` (`{"drop": [[case, tid], ...], "add": [finding, ...]}`) and run the merge once more (with `--map`):
   - Check every privacy finding in the digest's GDPR list against the record. Print only the relevant lines of `dossiers/<case>.md` (grep for the time or the keyword); don't read whole dossiers.
   - Bulk FE Jiras (CVNETRADYN, spanning many cases) are not errors.
   - Tenant-config monitoring cases are P3 by design. Only GDPR config alerts are P1.
   - An internal requester is not a customer.
   - Child cases closed against their parent without their own customer email follow PI-63 and are not a gap.
   - Scan every outbound email in the window for footage links (fleetdata, .mp4, amazonaws) with a short script over `out/cases.json` (`out_win[].np`), printing case, sender and recipient domain only; links to personal addresses are privacy items.
   - A password-reset link sent to the account's registered address is not a privacy item.
   - **Personal-address footage recipients (OD-1).** The digest lists the DSP ones the reviewers recorded under `not_verifiable`. For each: if the account is an Amazon DSP, look the address up with `mcp__Driver-i_mcp__tool_find_drivers(query=<address>, tenant_name=<DSP short code>)`. A match means a driver received footage: privacy item (T03), added through `verify.json`. No match is expected for fleet admins and dispatchers and is not flagged, because the IDMS resource lookup that covers all users is not reachable from this job; say in "Could not verify" how many were checked. Non-DSP accounts: a personal-address link with no identity or role check recorded is still a privacy item.
   - **Amazon UK Event Access (OD-2).** L1.5 raising the footage request or checking Event Access before moving the case to Amazon L2 is fine. Flag (T01) only a customer-facing response from L1.5: upload or ignition guidance, footage, links, or updates beyond the standard IR.
   - Rule-derived findings (priority downgrades without sign-off, Student Transportation of America still in L1.5, accident footage at P3) go in through `verify.json` `add`, as before.

The merged files keep the shapes `daily_report.py` expects:
- `out/reviews_all.json`: `{case: {case, resources, issue_type, summary, findings[], probing[], correct_asks[], strengths[], not_verifiable[]}}`. Screened-clean and rules-only cases have empty lists.
- `out/findings_final.json`: a list of `{case, resource, theme, tid, what, evidence, standard, severity: gdpr|major|minor, gap_type, confidence, issue_type}`.
- `out/tid_counts.json` (findings and cases per tid), `out/findings_D.csv` (for step 8) and `out/digest.md`.

## 5. Update the knowledge file (memory)

- Theme counts: model-judged themes from `out/tid_counts.json` (use `cases` or `findings` to match the theme's unit, as shown in `kb_brief.py`); rule-based themes (T07, T08, T13, T17, T20, T24) from `out/rules.json` and the metrics, computed as before.
- If today matches an existing theme, increment it. Never create a duplicate. Create a new theme only when it is new.
- Write `/home/claude/dhr/daily/today_counts.json` using the schema in the header of `kb_update.py`. It needs:
  - a count for every open theme, 0 when not seen
  - `new_themes`
  - `examples`
  - `log`: date, window, cases, resources, calls, in/out, IR and RT pairs, past target, findings, privacy_cases, a one-line note, and `page` = `reports/D.html` (`kb_update.py` adds `new_cases` to it from `out/new_cases.json`)
  - `baseline_changes`
  - any new KB-missed, instruction or probing evidence (use the exact keys `kb_brief.py` prints)
  - fixes applied and their status
  - new blind spots
  - `decisions_pending` and `open_actions`
  - new watermarks, each set to the time that source was checked
  - **30 Sep 2026 only:** `"method_change": true, "rule_based": ["T07", "T08", "T13", "T17", "T20", "T24"]`. Leave both out from 1 Oct.
- Run `python3 daily/kb_update.py D daily/today_counts.json`. It sets streaks and direction, flags SYSTEMIC at 3 or more, closes themes after 10 zero runs, and renders `knowledge-base.md`.

## 6. Build the report (short: readable in 5 minutes)

Write `daily/narrative_D.json` following `ref/narrative_schema.md` (same fields as the 29 Sep narrative; don't read an earlier narrative). Work from `out/digest.md`, `out/kb_brief.md`, `out/delta_D.json` and the metrics printed by `metrics_scoped.py`. Limits:

- `changes`: 3 lines at most.
- `glance`: exactly 5 lines. From 02 Oct `daily_report.py` adds a sixth, the **New cases** line with the 12-hour split, as the second bullet, and puts the 12-hour table under the calls-by-shift tables. Don't repeat those numbers in your lines. In the Volume line, call cases left at status New "still at New", not "new", so they are not confused with new cases.
- `privacy`: every same-day GDPR item, including items carried over from earlier runs that have not moved.
- `well`: 10 at most, named, with case numbers.
- `gaps`: 12 at most, each with a theme id and a kind (Process, Knowledge, Tooling or One-off).
- `gaps_more`: one line for the smaller themes.
- `actions`: team, individuals and you.
- `coaching`: 8 at most.
- `not_verified`.
- Optional, used by the SharePoint copy: `process` (rows of `src`, `rule`, `result` = missed | partly | met | untested | conflict, `how`, `cases`), `method` (how the review was done; the "Depth of review" line states the tiers), `metrics_note` (one line on the resolution breaches), `email_actions` (non-privacy same-day actions for the email) and `produced` (the time the report was produced, when it was later than 08:00 IST).
- Initial response only is a count, not a finding. It is often a hand-over at the end of a shift. Don't put it under gaps or coaching unless the case record shows a real problem (for example a customer left waiting), and never compare engineers on it.
- New-case volume then shows on: Day at a glance (the line and the 12-hour table), the Volume tab (four New cases columns and, from 03 Oct, the follow-up table), each per-resource card (header and one line with the initial-response-only case numbers), the Metrics tab (KPI and definitions), the email and summary (one quick-summary line), the archive list (New cases column) and the knowledge-base daily log.
- No personal or customer email addresses and no Driver•i driver names in the narrative. `daily_report.py` also redacts addresses from every file it publishes (since 28 Oct).

Also write `daily/shift_D.json` from the Teams shift and leave posts (the delta subagent drafts it).

Then build and publish, in this order:

0. Case links: `python3 daily/case_links.py D` lists the case numbers the report will show that are not in `raw/cases_a.json`, and prints a SOQL query for their Ids. Run it and save `{"records": [{"Id", "CaseNumber"}, ...]}` to `raw/case_links_extra.json` (keep only those two fields). Re-run `case_links.py` until it reports 0.
1. `python3 daily/daily_report.py D` (no `--pdf-asset`, no `--sp-compact`, no `--sp-url`).
2. Read the archive: `Artifact action=read, url=<kb_state.job.archive_url>`. This is required before any publish from a new session.
3. Publish: `Artifact publish, url=<archive_url>, file_path=daily/archive/index.html, files={"reports/D.json": "daily/archive/reports/D.json", "reports/D.html": "daily/archive/reports/D.html"}`.
   - `reports/D.html` is the same tabbed page as the SharePoint copy, minus the "live version" line. `reports/D.json` carries `"page": "reports/D.html"`, and the archive day view shows that page in a frame under a bar with ← All reports, **Download HTML** (saves `reports/D.html` as `L1.5_Daily_Health_Report_D.html`) and Open on its own page. The 24 Sep report has no `page`, so it still opens the older single-page view with its PDF button.
   - Do not pass `capabilities` (it keeps `assets` and `downloads`; `downloads` is what the Download HTML button uses).
   - Do not pass `icon`.
   - Earlier report files stay published.
4. Check the result with `Artifact action=list, scope=files, url=<archive_url>`. It must list `reports/D.json` and `reports/D.html`. The laptop task copies `reports/D.html` into SharePoint, so this file is the source of the SharePoint copy.

## 6b. SharePoint full copy (changed 28 Oct 2026: not from this run)

Don't upload the full report to SharePoint from this run, and don't call `sharepoint_upload_file` for it. The laptop task "L1.5 Daily Health - laptop full-report upload" (trig_01FT8GL5g2mn7cuzzJpGiQB8, uploads-runbook.md Part B) takes `reports/D.html` from the archive, adds the live-version line and puts it into Ops Customer Support > Support Metrics > L1.5 Daily Health as `L1.5_Daily_Health_Report_D.html` through Sudarsanan's OneDrive-synced folder, as soon as his laptop is on. Step 7 fires it. It is always the tabbed layout; never use `--sp-compact`.

## 7. Summary upload (replaces the team email from 29 Oct)

Follow `uploads-runbook.md` Part A, right after step 6.4 succeeds:

1. Don't send `email_D.html` to anyone, and don't post to Teams.
2. If `L1.5_Daily_Summary_D.html` is not yet in SharePoint `L1.5 Daily Health/Summary`: `python3 daily/summary_build.py --date D --email-html daily/build/D/email_D.html --out daily/build/D/L1.5_Daily_Summary_D.html`, then upload it with `mcp__Microsoft_365__sharepoint_upload_file` (driveId from `kb_state.job.sharepoint`, parentItemId = the Summary folder item `01QLYSL33TG77RQDYIXZB3VUV3KLRTIRPG`, content verbatim, expectedBytes, conflictBehavior `fail`) and check it is listed with that size.
3. The Power Automate flow "L1.5 Daily Health - notify on new SharePoint file" then posts to the Teams group "L1.5 Transformation Group" and sends the email. It is the only notification. `kb_state.job.recipients` and `distribution_approved` are no longer used by this run; the flow's own settings decide who gets the email.
4. `fire_trigger` trig_01FT8GL5g2mn7cuzzJpGiQB8 once, with no text, so the full report goes to SharePoint as soon as the laptop is on.
5. Never upload the summary for a partial or failed report: the upload is what tells the team. If the run cannot finish, or the summary upload fails twice, email Sudarsanan only (`sudarsanan.kesavan@netradyne.com`): say what failed and what was verified, with the live report link if the report was published.

## 8. Save to the project, then refresh the toolkit

Write these with `project_write` and **`local_path`** (never paste content):

| Local file | Project doc |
|---|---|
| `daily/kb_state.json` | `claude/l15-daily-health/state/kb_state.json` |
| `daily/knowledge-base.md` | `claude/l15-daily-health/knowledge-base.md` |
| `daily/narrative_D.json` | `claude/l15-daily-health/days/D/narrative.json` |
| `daily/shift_D.json` | `claude/l15-daily-health/days/D/shift.json` |
| `out/findings_D.csv` (case, resource, theme, theme_id, severity, gap_type, confidence, standard, what) | `claude/l15-daily-health/days/D/findings.csv` |

Also write `daily/baseline-register.md` (to `claude/l15-daily-health/baseline-register.md`) and any changed digest, but only if something changed. Nothing else. If the project refuses a write because it is full, say so in the final summary and carry on: the toolkit holds the same files.

**Last step, after the project saves:** `python3 make_toolkit.py D` prints a `files` map. Publish it: `Artifact publish, url=https://claude.ai/artifact/KwyJPmGJSb4LohnzoUzav7, file_path=/home/claude/dhr/toolkit/index.html, files=<the printed map>` (no `icon`). If the publish is refused because this session hasn't read the artifact, run `Artifact action=read` on that url and publish again. If it is refused because a file contains U+FFFD, replace the literal character with the escape `�` in that file, re-run `make_toolkit.py` and publish again. Then check with `Artifact action=read, path=dhr_toolkit.txt` that it saved (the result gives the byte size). The toolkit must be published after the project saves, so tomorrow's freshness check (step 0.2) prefers it. Anyone who edits a project copy by hand makes that copy newer, and the next run picks it up from the project.

## Limits

- The archive holds up to about 250 daily files, because an artifact has a 255-file cap (two files per day since 28 Sep). Before that, start a second archive and link it from the first.
- Portal, IDMS and device data are invisible to the review.
- Calls have no case link.
- There are no rostered hours.
- The "L1 Queries" channel returns 403.
- Compact dossiers cut older history (reviewers keep the description, the latest one or two earlier items and every in-window item, clipped); a reviewer opens the full dossier only when a gdpr or major finding depends on clipped text.
- A session usage limit can pause the run (29 Sep: about 07:40–11:45 IST; 30 Sep: the 06:45 run stopped and was re-run late). Resume from the JSONL files; say in "Changes since last run" that the report is late (the narrative's `produced` field carries it into the summary).
- New-case counts are cut at 06:30 IST: work after 06:30 on a case created before it shows in the next report as an existing case, so a reply late in a shift that runs past 06:30 shows as initial response only. The follow-up table in the next report shows whether the same person picked the case up.
- The SharePoint full copy depends on Sudarsanan's laptop being on: on a day it stays off, the summary's "Full report copy (SharePoint)" button opens nothing until the laptop task runs. The live report link always works for people with archive access.
