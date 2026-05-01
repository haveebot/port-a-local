## Setup
- [ ] Install the app via TestFlight. **Expected:** App launches successfully and prompts for Apple sign-in.
- [ ] Sign in using a test Apple ID. **Expected:** User is logged in and the app displays personalized content (if applicable).

## Home screen
- [ ] Observe the main screen. **Expected:** Lighthouse beacon rotates smoothly, and the waves animate continuously.
- [ ] Check the tide number display. **Expected:** The number reflects current, real Port Aransas data.
- [ ] Scroll down to the Coastal Watch section. **Expected:** The section displays the topo map, logbook, and the row containing AIR/WATER/TIDE/SUNSET data.

## Pull-to-refresh
- [ ] Pull down on the home screen. **Expected:** The coral spinner appears briefly, and the NOAA data refreshes (and updates the tide number if enough time has passed).

## Order food
- [ ] Select a restaurant and add 2-3 items to the cart. **Expected:** Items are correctly added and the subtotal updates.
- [ ] Proceed to checkout. **Expected:** The payment screen is visible.
- [ ] Complete the order using the provided Stripe test card details. **Expected:** A successful order confirmation screen is displayed.

## Cart persistence
- [ ] Add several items to the cart. **Expected:** Items are visible in the cart.
- [ ] Kill the app from the app switcher (background). **Expected:** The app is closed.
- [ ] Reopen the app. **Expected:** The cart still contains the previously added items.

## Maintenance request
- [ ] Navigate to the maintenance request form. **Expected:** The form fields are accessible.
- [ ] Fill out all required fields and submit the form. **Expected:** A confirmation message is displayed, confirming submission.

## Beach booking
- [ ] Select a product and desired dates. **Expected:** The calendar and product selection work correctly.
- [ ] Enter a valid address and submit the booking. **Expected:** The booking is processed successfully, and a confirmation screen is displayed.

## Search
- [ ] Search for a specific item (e.g., "fish tacos"). **Expected:** Relevant search results appear.
- [ ] Clear the search query. **Expected:** The search bar is empty.
- [ ] Re-search or navigate away and return. **Expected:** The recent search query appears as a clickable chip.

## Network resilience
- [ ] Initiate a checkout process. **Expected:** The user is on the payment screen.
- [ ] Turn on Airplane Mode mid-checkout. **Expected:** A friendly timeout alert appears, and the cart contents are preserved.
- [ ] Turn off Airplane Mode. **Expected:** The network banner disappears, and the user can complete the checkout process.

## Account
- [ ] Navigate to the account settings. **Expected:** The sign-out option is visible.
- [ ] Sign out of the app. **Expected:** The user is logged out and prompted to sign back in.
- [ ] Sign back in. **Expected:** The user is successfully logged back into the app.

## Accessibility (advanced)
- [ ] Enable VoiceOver in iPhone settings. **Expected:** The app announces all interactive elements and content changes when navigating the home tab.
- [ ] Disable VoiceOver. **Expected:** The app functions normally.
- [ ] Enable Reduce Motion in iPhone settings. **Expected:** Restart the app; animations (like the lighthouse or waves) should not loop or cause excessive movement.

## Bug report template
- [ ] Locate the bug report template within the app. **Expected:** The template is easily accessible and provides clear instructions on what information to copy/paste (e.g., steps to reproduce, device model, OS version).
