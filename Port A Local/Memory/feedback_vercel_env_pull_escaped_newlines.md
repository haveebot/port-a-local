---
name: vercel env pull escapes newlines as literal \n in values — strip before use
description: When using `vercel env pull` to get production env to a local file for direct API calls (Twilio, Meta, etc.), values come back with trailing literal \n chars (5c 6e bytes) that break auth. Strip with sed before sourcing.
type: feedback
originSessionId: f96f1706-d1d4-4c47-bb8b-0919a0add5eb
---
**Cross-project. Bit me on PAL 2026-05-03 PM** when curling Twilio directly to send a customer SMS.

`vercel env pull /tmp/.env.pal-prod --environment=production` writes values as `KEY="value\n"` where `\n` is two literal characters (backslash + 'n'), not a newline byte. Bash's `source` / `set -a; .` doesn't unescape these — they survive as-is in the shell variable. The result: a Twilio Account SID that should be 34 chars comes through as 36, with a trailing `\n` that corrupts HTTP basic auth → `401 Authentication Error - invalid username`.

**Diagnostic that catches it:**

```bash
printf '%s' "$VAR" | xxd | tail -1
# look for trailing 5c 6e bytes
```

**Fix:**

```bash
VAR_CLEAN=$(echo "$VAR" | sed 's/\\n$//')
# or strip all trailing whitespace + escaped-newlines
VAR_CLEAN="${VAR%\\n}"
```

**Better fix:** wrap the source in a helper that auto-strips on load:

```bash
load_vercel_env() {
  while IFS='=' read -r k v; do
    [[ -z "$k" || "$k" =~ ^# ]] && continue
    v="${v%\"}"; v="${v#\"}"        # strip surrounding quotes
    v="${v%\\n}"                     # strip trailing literal \n
    export "$k=$v"
  done < "$1"
}
load_vercel_env /tmp/.env.pal-prod
```

**When to apply:** any time we curl an API directly using credentials pulled via `vercel env pull`. Twilio (auth), Meta (token), Stripe (key), anything that does strict-string credential matching. Vercel's runtime doesn't see this issue because the env vars there come from the encrypted store directly — only the `pull` step inserts the escape.

**Doesn't apply to:** code running ON Vercel (the runtime gets clean values).
