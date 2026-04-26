# Port A Local — iOS App Store Submission Guide

This is the runbook for taking the customer app from "builds locally" to
"installable from the App Store." Most of these steps are one-time setup
(an hour or two). After that, every release is a single `eas submit`.

## 1. Apple Developer prerequisites (you do this once)

You need three things before EAS can submit anything:

- **Apple Developer Program membership** ($99/year) at
  <https://developer.apple.com/programs/>
- **App Store Connect record** for `Port A Local` with bundle id
  `co.portalocal.app`. Create at <https://appstoreconnect.apple.com/apps>
  → "+ → New App". Copy the numeric **App ID** (Apple calls it the ASC
  App ID — looks like `1234567890`).
- **Apple Team ID** — visible at
  <https://developer.apple.com/account> in the membership panel
  (10-character string like `ABCDE12345`).

## 2. Fill in `eas.json`

In [`eas.json`](./eas.json), replace the three `REPLACE_WITH_*` strings
in `submit.production.ios`:

```jsonc
"ios": {
  "appleId": "you@example.com",          // your Apple developer login
  "ascAppId": "1234567890",              // numeric ASC ID from step 1
  "appleTeamId": "ABCDE12345"            // 10-char team id from step 1
}
```

## 3. Install + log in to EAS CLI (one-time, on your machine)

```bash
npm install -g eas-cli
eas login
cd customer-app
eas init                # creates the project on EAS, links it to this dir
```

`eas init` will write a `projectId` into `app.json`. Commit that.

## 4. Configure Apple Sign-In capability (one-time, on Apple)

In <https://developer.apple.com/account/resources/identifiers> →
Identifiers → your `co.portalocal.app` App ID → enable
**Sign In with Apple**. EAS will pick this up the next build.

## 5. Build for TestFlight

```bash
cd customer-app
eas build --platform ios --profile preview      # for ad-hoc / TestFlight
# or
eas build --platform ios --profile production   # store-ready signed build
```

EAS will:
- Generate an iOS distribution certificate + provisioning profile (or
  reuse yours)
- Run the build on their cloud Mac
- Upload the `.ipa` to EAS

## 6. Submit to App Store Connect

```bash
eas submit --platform ios --latest
```

This pushes the latest production build to the App Store Connect record
you set up in step 1. Once Apple finishes processing (10-30 min) you can
add it to a TestFlight group or promote it to App Store review.

## 7. App Store metadata you'll need to fill in (App Store Connect)

These fields aren't automated — fill them in once on App Store Connect:

- **App name**: Port A Local
- **Subtitle**: Local food, rentals, and more
- **Category**: Food & Drink (primary), Travel (secondary)
- **Privacy policy URL**: https://port-a-local.vercel.app/privacy
- **Support URL**: https://port-a-local.vercel.app
- **App Privacy questionnaire**: declare what you collect — at minimum
  Identifiers (Apple user id), Contact Info (name/phone/email/address
  per order), Purchases (order history)
- **Encryption export compliance**: already declared in
  `app.json → ios.infoPlist.ITSAppUsesNonExemptEncryption = false` —
  Apple won't re-prompt
- **Screenshots**: 6.7" (iPhone 17 Pro Max), 6.1" (iPhone 17), and one
  iPad set. Use the simulator: `xcrun simctl io <udid> screenshot`

## 8. Server-side setup before going live

The customer app calls these env vars on the Vercel deployment — set
them before submitting:

| Variable | Used by | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `/api/deliver/order` | Stripe live secret |
| `STRIPE_WEBHOOK_SECRET` | `/api/deliver/webhook` | Webhook signing |
| `RESEND_API_KEY` | order intake email | optional but recommended |
| `DELIVER_PUBLIC_LAUNCH` | `/api/deliver/order` | `true` to take real orders |
| `CUSTOMER_SESSION_SECRET` | `/api/customer/apple-signin` | random 32+ chars |

Generate the session secret:
`openssl rand -base64 48`

## Recurring releases (after step 1-6 are done once)

```bash
cd customer-app
eas build --platform ios --profile production --auto-submit
```

That single command builds + submits + bumps the build number for you.
