---
name: Sage canonical document versioning — verify-on-render + auto-archive
description: Every generator-produced Sage document must verify rendered output against spec assertions and auto-archive its predecessor on every render. Locked 2026-04-30 after L&EA contract v1.1/v1.2 mismatch.
type: feedback
originSessionId: 2026-04-30-am-lea-contract-mismatch
---

After Sage's first signed agency contract (L&EA / Travis D'Amico, 2026-04-30) was discovered to be on an outdated version (v1.1) instead of the intended v1.2 with Z's review changes, locked these rules permanently:

## Root cause

The contract generator script declared `DOC_VERSION = "v1.2"` in its metadata while still hardcoding all of v1.1's body content in Python. The markdown source at `Documents/Sage-Agency-Sales-Representative-Agreement.md` was correctly updated to v1.2 during Z's 2026-04-28 review, but the Python generator that produces the actual PDF was never patched. Every PDF rendered from that script for several days was v1.1 wearing v1.2's metadata.

The prior session declared "v1.2 PDF staged at `~/Desktop/...` ready to send" without ever opening the rendered PDF to verify it actually contained the v1.2 content. Winston trusted the system, attached the file, and sent v1.1 to both Taylor (who signed it as Sage's President) and Travis (who signed it as L&EA's Principal). Z's 6 review revisions — quote-based pricing language, removed Schedule C, softened §13(b) reporting, Schedule B trade-area catch-all, §16 Reserved, trimmed signature block — were all lost.

## Rule 1 — Verify-on-render is non-skippable

Every document generator (contract, brief, brand pack, spec sheet, anything that produces PDF/image/HTML output that gets sent externally) must include a `verify_<version>()` function that:

1. Reads back the rendered output
2. Asserts every key marker that distinguishes this version from the predecessor is **present** (positive assertions)
3. Asserts every predecessor's marker that should be gone is **absent** (negative assertions)
4. Refuses to leave the file on disk on assertion failure (`unlink()` + raise `RuntimeError`)
5. Surfaces a clear `Verify: PASS — N markers present, M leftovers absent` line on success

Reference implementation: [`sage-em/sage/Sage Em/scripts/generate-agency-contract.py`](../../../Projects/workspace/sage-em/sage/Sage Em/scripts/generate-agency-contract.py) — see `V12_MUST_HAVE`, `V11_MUST_NOT_HAVE`, `verify_v12()`. Same pattern applies to:

- `generate-agency-brief.py`
- `generate-engineer-brief.py`
- `generate-monday-comparison-report.py`
- `generate-brand-onepager.py`
- Future contract amendments, addenda, schedules
- Any new generator under `sage-em/sage/Sage Em/scripts/`

When the spec changes (v1.2 → v1.3), update `V<X>_MUST_HAVE` / `V<previous>_MUST_NOT_HAVE` **first**, then make the source changes. The assertions are the contract; the source code follows.

## Rule 2 — Auto-archive predecessor on every render

Every generator must call `auto_archive_predecessor(canonical_path)` before writing its output. This:

1. Detects if the canonical PDF already exists
2. Moves it to `<same-folder>/Archive/<stem>-superseded-<YYYY-MM-DD-HHMM>.<ext>` (using the existing file's mtime for the timestamp)
3. Then writes the new file at the canonical path

This prevents the "two versions side-by-side" failure mode where a stale predecessor sits in the same directory as the current version and gets accidentally grabbed.

Reference implementation: same generator script, function `auto_archive_predecessor()`.

## Rule 3 — Canonical filename + send-ready variant on Desktop

For documents that are routinely sent externally:

- **Vault canonical** (`Documents/<DocName>.pdf`): the latest unsigned/template version, source-of-truth for the generator
- **Vault send-ready variant** (`Documents/<DocName>-<Variant>.pdf`): e.g. `-TaylorSigned.pdf` for contracts with Taylor's pre-stamped signature
- **Desktop send-ready** (`~/Desktop/<DocName>-v<X>-<Variant>.pdf`): explicit version + variant in the filename. **Always include the version explicitly.** Past behavior of using bare `<DocName>.pdf` on Desktop with version implicit in metadata was the proximate cause of the v1.1 attach.

The version-explicit Desktop filename is the visual confirm: when Winston is attaching, he sees `-v1.2-TaylorSigned.pdf` in the file picker and knows what he's sending.

Old Desktop patterns to deprecate:
- ❌ `Sage-Agency-Sales-Representative-Agreement.pdf` (no version visible)
- ✅ `Sage-Agency-Sales-Representative-Agreement-v1.2-TaylorSigned.pdf`

## Rule 4 — Signed-document archival

When an agency or other party signs a document, archive their signed copy permanently:

`Documents/Archive/<EntityCode>-<DocStem>-<status>-<date>.pdf`

Examples from L&EA:
- `LEA-Sage-Agency-Agreement-v1.1-Taylor-signed-2026-04-29.pdf`
- `LEA-Sage-Agency-Agreement-v1.1-Taylor-AND-Travis-signed-2026-04-30.pdf`

This is the legal record. Distinct from the canonical Documents/ which always reflects the latest unsigned template.

## Cross-references

- Memory: [`feedback_sage_contract_principles.md`](feedback_sage_contract_principles.md) — three drafting principles (quote-based, op-simplicity, Reserve over Remove). This file complements those by locking the *production discipline* not the drafting principles.
- Vault: `Strategy/Sage Contract — Z Review v1.1 (2026-04-28).md` — the review that produced v1.2 and was lost in the v1.1 ship.
- Vault: `Documents/Archive/` — frozen historical record (not source of truth).
