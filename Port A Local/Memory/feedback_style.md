---
name: Working style and preferences
description: How Winston wants to collaborate — tone, behavior, memory habits, email setup
type: feedback
---

Be direct and casual — no corporate tone, no filler. Winston's prior AI assistant was named "Havee" and had a warm but no-nonsense style.

**Read memory before acting.** At session start, read the vault's daily notes AND MEMORY.md. Daily notes are more current; MEMORY.md alone can be stale.

**Write it down.** Mental notes don't survive. Always write decisions, context, and lessons to files.

**Why:** Prior session failures (April 6-7) came from Havee not reading daily logs, leading to stale context and bad outputs. Winston's patience for re-doing work is low.

**How to apply:** Before doing anything on a project, read relevant vault files. Vault lives at `/Users/winstoncaraker/Projects/workspace/sage-em/` and workspace MEMORY.md/daily logs at `/Users/winstoncaraker/Projects/workspace/memory/`.

---

**Email setup:**
- `haveebot@gmail.com` — old working email (legacy, Sage Em use only)
- `winstonciv@gmail.com` — PAL account creation email until Workspace is live
- `winston@sageem.co` — Winston's Sage account, no direct access
- PAL emails (Google Workspace live): admin@theportalocal.com (ops), hello@theportalocal.com (public), bookings@theportalocal.com (Resend sender)
- Do not use haveebot for any PAL-related accounts or communication

---

**Domain naming rule: no hyphens.** Clean URLs only — never `port-a-local.com` style. Always `theportalocal.com` style.

**Why:** Clean URLs look more professional and are easier to say/remember.

**How to apply:** Any time a domain is suggested or purchased, no hyphens allowed.

---

**Sessions do not close until Winston explicitly says so.** Do not assume a task is complete or a session is wrapping up. Keep working until told to stop.

---

**Push GitHub at end of every session** — commit changes to the workspace/vault repos.

**Why:** Memory and work product lives in Git. No push = lost session.

**How to apply:** End of session = git add + commit + push to haveebot repos.

---

**Push to main for live review.** When Winston wants to see changes on the Vercel deployment, push to `main` — Vercel only rebuilds on `main` commits. Always confirm before pushing. Don't work in feature branches unless asked.

**Why:** Winston reviews on the live Vercel URL, not a local dev server. Changes sitting in a worktree branch are invisible to him.

**How to apply:** After a clean build, ask "Want me to push to main?" or push when instructed. Multiple pushes per session are fine.

---

**"Dumptruck" = full backup.** When Winston says "dumptruck" or "run the dumptruck," it means: update session notes, update all wiki/memory files, update vault (Home, Roadmap, Features, Decision Log), sync workspace memory copy, push all repos to GitHub, and verify everything is clean.

**Why:** Named during the Apr 12 monster session (30 commits). Single command to lock everything down.
