# Port A Local: Beta Testing Guide

Welcome back to the beach! We’ve added a lot of new features to Port A Local since your last build. We need your help to make sure everything works perfectly before we launch.

---

### Getting Started

If you haven't installed the latest version yet, please use the link below to access the TestFlight invite.

[invite link]

### What's New in This Build

We’ve been working on making the app feel more connected to the coast. Here is what you'll notice:

*   **The Lighthouse:** The hero section now features a working lighthouse beacon animation (a rotating cone of light and pulsing lamp).
*   **Live Tide Data:** The animated waves at the bottom of the screen now display the current Port Aransas tide level in big serif numerals. The wave height adjusts to reflect the actual tide.
*   **Coastal Watch:** Below the hero section is a new Coastal Watch tile. This shows a topographic map of Mustang Island with a pulsing marker. It also includes a live feed (like a logbook) and real-time readouts for Air, Water, Tide, and Sunset data from NOAA.
*   **Data Refresh:** You can now pull down on the home screen to immediately refresh the NOAA data.
*   **Stability & UX:** We've improved the app's stability. The shopping cart will keep your items even if you close and reopen the app. We've also added a clear banner if your device loses internet connection.
*   **Forms & Payments:** All checkout forms (delivery, beach, maintenance, rentals) now have a friendly alert if the submission takes too long. External services (like payments) show clear instructions if the connection fails.
*   **Sign-In:** Signing in with Apple is now saved on our server, so you won't have to sign in every time you open the app.

### Things to Try (Testing Checklist)

Please try to test the following scenarios. They are the most critical areas for us right now.

**Connectivity & Data:**
*   **Pull-to-Refresh:** On the home screen, pull down hard to refresh the data. Does the NOAA readout update immediately?
*   **Offline Mode:** Open the app, then turn off Wi-Fi and cellular data. Try to access a service (like booking a beach spot). Does the offline banner appear correctly?
*   **Network Drop:** Start a checkout process (e.g., Stripe payment). While on the payment screen, turn off your Wi-Fi. Does the app show a clear error/retry message?

**Core Functionality:**
*   **Cart Persistence:** Add an item to your cart. Close the app completely (kill it from the background). Reopen the app. Is the item still in your cart?
*   **Deep Links:** Navigate to a service page (e.g., maintenance booking). Then, go to the home screen and immediately click a different service link. Does the app transition smoothly?
*   **Forms:** Fill out a complex form (like delivery checkout). Leave it open for a few minutes. Does the friendly timeout alert appear if the submission fails?

**Visual & Location:**
*   **Coastal Watch:** Scroll down and examine the Coastal Watch tile. Does the pulsing marker look correct? Does the logbook feed update?
*   **Tide Display:** Observe the wave animation. Does the large numeral display accurately reflect the current tide level?

### Known Limitations

Please note these areas are still under development and may not work as expected:

*   **Push Notifications:** To test push notifications, you must be using a physical device (not a simulator).
*   **Golden Hour:** The "Golden Hour Wash" feature is only visible in the app for the one hour leading up to sunset, Central Time.
*   **Background Tasks:** Some background data fetching may require you to manually open the app or pull to refresh.

### How to Report Bugs

If you find anything that doesn't work, or if the app crashes, please report it to us at `beta@portalocal.com`.

When reporting, please include the following information—it helps us fix the bug much faster:

1.  **The Build Number:** (Found in the TestFlight app).
2.  **What You Did:** (Step-by-step instructions, e.g., "I tapped the cart icon, then pulled down on the home screen.")
3.  **What You Expected:** (What should have happened, e.g., "I expected the tide number to update.")
4.  **What Actually Happened:** (The bug, e.g., "The app crashed," or "The tide number remained stuck on 1.2.")
5.  **Screenshots/Video:** Always include a screenshot or short video clip if possible.
