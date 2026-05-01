# README.md

## What this is

This is an Expo/React Native application for Port A Local, serving as a local business directory and service hub for Port Aransas, TX. Functionality includes booking beach access, managing rentals, scheduling maintenance, and facilitating local deliveries.

## Quick Start

To get the application running on the simulator, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Pods (iOS):**
    ```bash
    cd ios
    # Use this if standard pod install fails due to environment encoding
    LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
    ```

3.  **Build the App:**
    ```bash
    xcodebuild -workspace ios/PortALocal.xcworkspace -scheme PortALocal -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO
    ```

4.  **Install on Simulator:**
    ```bash
    xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/PortALocal.app
    ```

5.  **Launch App:**
    ```bash
    xcrun simctl launch booted co.portalocal.app
    ```

6.  **Start Metro Bundler:**
    ```bash
    npx expo start
    ```

## Project Layout

*   `src/screens/`: Contains the primary, top-level view components for the application.
*   `src/components/`: Holds reusable, atomic UI elements (buttons, cards, headers).
*   `src/lib/`: Stores utility functions, API wrappers, and complex business logic.
*   `assets/`: Directory for static media, images, and local JSON data.
*   `ios/`: Contains the native iOS project files and configuration.

## Hardened Patterns

*   Network calls are wrapped with an 8-15 second `AbortController` timeout to prevent indefinite hanging.
*   Silent error catching is forbidden; all errors must be surfaced to the user via the `ErrorBanner` component.
*   Animations are conditionally gated using `useReducedMotion()` to respect user accessibility settings.
*   Decorative views are hidden from screen readers using `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`.

## Shipping to TestFlight

1.  Retrieve the Expo token from the Keychain:
    ```bash
    security find-generic-password -s expo-token -a heyelab -w
    ```
2.  Build and submit the production version:
    ```bash
    npx eas-cli build --platform ios --profile production --auto-submit --non-interactive
    ```

## Live Data Sources

*   **Tides/Weather:** NOAA Station 8775237 (Port Aransas) is used for real-time tide, air, and water temperature data.
*   **Solar Calculations:** Solar math (sunrise/sunset) is computed locally within `solarTimes.ts` to ensure offline reliability.

## Brand Guidelines

*   **Palette:**
    *   Navy: `#0b1120`
    *   Coral: `#e8656f`
    *   Gold: `#d4a843`
    *   Sand: `#f5f0e6`
*   **Display Font:** Georgia
*   **Mono Font:** Menlo
