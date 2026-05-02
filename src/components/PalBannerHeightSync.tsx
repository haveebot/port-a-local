"use client";

import { useEffect } from "react";

/**
 * PalBannerHeightSync — measures the active EmergencyBanner's actual
 * rendered height and writes it to the --pal-banner-h CSS variable.
 *
 * Why: the banner wraps unpredictably on mobile (2-3 lines depending
 * on message length + viewport width). A static CSS var either
 * overshoots (gap between banner and nav) or undershoots (banner
 * overlaps nav). Measuring is the only way to be precise.
 *
 * Falls back to globals.css's CSS-only var (188px mobile / 76px
 * desktop) for the initial SSR paint before JS hydrates. After
 * hydration, this component overrides with the exact measurement.
 *
 * Re-syncs on window resize + on banner content changes via
 * ResizeObserver — handles viewport rotation, dynamic message
 * updates, etc.
 */
export default function PalBannerHeightSync() {
  useEffect(() => {
    // Stable data-attribute selector — works across severities (alert vs
    // status, assertive vs polite). The role/aria-live combo varies by
    // severity (spotlight is role=status/polite; warning+critical are
    // role=alert/assertive) so we can't query by those.
    const banner = document.querySelector<HTMLElement>("aside[data-pal-banner]");
    if (!banner) return;

    const setVar = () => {
      const h = banner.getBoundingClientRect().height;
      // Ceil so we never undershoot by sub-pixel rounding.
      document.body.style.setProperty(
        "--pal-banner-h",
        `${Math.ceil(h)}px`,
      );
    };

    // Initial sync (after first paint)
    setVar();

    // Track resize of the banner itself (content changes, layout shifts)
    const ro = new ResizeObserver(setVar);
    ro.observe(banner);

    // Track viewport changes (rotation, browser chrome show/hide)
    window.addEventListener("resize", setVar);
    window.addEventListener("orientationchange", setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
      window.removeEventListener("orientationchange", setVar);
    };
  }, []);

  return null;
}
