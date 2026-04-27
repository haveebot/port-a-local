# What's next — picking up customer-app testing

Last touched: 2026-04-26. Branch: `customer-ios-app`.

## Where we left off

Testing the **customer iOS app** (`co.portalocal.app`, source in `customer-app/`)
on the iPhone 17 Pro simulator. The app is installed and launches fine —
home screen renders correctly with the Quick Actions grid (Deliver, Maintenance,
Golf Cart Rentals, Beach Gear) and category browsing.

The Metro packager command we were using:

```bash
cd customer-app && npx expo start --port 8081 --clear
```

…and then to (re)install the dev build into the booted sim:

```bash
APP=$(find ~/Library/Developer/Xcode/DerivedData/PortALocal-* \
  -path '*/Debug-iphonesimulator/PortALocal.app' -type d 2>/dev/null | head -1)
xcrun simctl install "iPhone 17 Pro" "$APP"
```

## Open issues to triage

### 1. My Orders stuck on a loading spinner
Navigate AccountHome → My Orders. Spinner spun forever in our session.

`OrdersScreen` ([customer-app/src/screens/OrdersScreen.tsx](customer-app/src/screens/OrdersScreen.tsx))
puts `setLoading(false)` in a `finally` block, so a hung spinner means either:
- `loadSession()` never resolves (SecureStore stuck), **or**
- `fetchMyOrders()` never resolves — but prod
  `https://port-a-local.vercel.app/api/customer/orders?email=…`
  returns `404` in ~500 ms (route not deployed), so it should hit the catch.

**To verify**: open the dev menu in the running app (`Cmd+D` in the sim),
enable JS debugging, and watch the network tab + console while navigating into
My Orders. If you see no fetch fire, the bug is in `loadSession`. If the fetch
fires and resolves, the bug is in the screen's effect chain (likely a stale
`useFocusEffect` + `useCallback` dep loop).

After my fresh re-launch the screen wasn't reachable to repro because the app
restarted to home. **Repro starts with a signed-in session that has an email** —
that's the path that goes past the early-return.

### 2. expo-notifications warning on every launch
```
[expo-notifications] Error reading persisted server registration info:
Calling the 'getRegistrationInfoAsync' function has failed
```
Non-fatal — appears in the in-app warning toast. Probably keychain entitlements
on the dev build (the device log also shows
`Client has neither application-identifier nor keychain-access-groups
entitlements`). Not blocking but worth fixing before the next TestFlight build.

### 3. Prod `/api/customer/orders` returns 404
The deployed Vercel app at `port-a-local.vercel.app` doesn't expose the
customer orders API the native app expects. Either the route hasn't been
deployed yet or the path moved. Check `src/app/api/customer/orders/route.ts`
locally vs. what's actually live.

## Flows the user wanted to test (didn't finish)

The user said "all of them" — i.e. exercise every Quick Action end-to-end:

- [ ] **Deliver** — restaurant list → menu → cart → checkout → order success
- [ ] **Maintenance** — request form → photo upload → submit → confirmation
- [ ] **Golf Cart Rentals** — rent form
- [ ] **Beach Gear** — beach form
- [ ] **Browse by Category** → Explore Port Aransas listings
- [ ] **Account / Sign-in** — note Apple Sign-In can't *complete* on the sim
  (no Apple ID flow), but the button + UI states should still render
- [ ] **My Orders** — only reachable when signed in; see issue #1 above

For each: take a screenshot of every state transition, watch Metro logs for
warnings, watch the device log for native errors:

```bash
xcrun simctl spawn "iPhone 17 Pro" log stream \
  --predicate 'processImagePath CONTAINS "PortALocal"' --level=debug
```

## Repo layout reminder

Monorepo. Three apps share one Vercel-deployed Next.js backend:

- `src/` + `next.config.ts` — Next.js public site + API
- `customer-app/` — native iOS customer app (Expo/RN, **what we're testing**)
- `mobile/` — Port A Local Tasks (driver/operator) app

This mirror lives at `nickbmerrill-collab/port-a-local`. The canonical remote
is `haveebot/port-a-local` — push there too when changes are ready to ship.

## Local commit on this branch that isn't on `haveebot` yet

```
customer-app: wire deep-link routes for native order/maintenance/rent/beach screens
```
Adds eleven `linking.screens` entries so push-notification deep-links open
the native screens instead of the WebView. Verify by tapping a notification
or by `xcrun simctl openurl booted portalocal://deliver`.
