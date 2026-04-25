"use client";

import Link, { type LinkProps } from "next/link";
import { track } from "@vercel/analytics";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * <TrackedLink> — drop-in replacement for next/link <Link> that fires
 * a Vercel Analytics custom event on click before the route change.
 *
 * Use for INTERNAL navigation that we want to measure (cross-link
 * clicks, hub page → detail page, etc.). For external links / mailto,
 * use <TrackedAnchor> instead.
 */
export default function TrackedLink({
  event,
  properties,
  onClick,
  children,
  ...rest
}: LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps | "onClick"> & {
    event: string;
    properties?: Record<string, string | number | boolean>;
    onClick?: ComponentPropsWithoutRef<"a">["onClick"];
    children?: ReactNode;
  }) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        try {
          track(event, properties);
        } catch {
          // never block navigation on analytics errors
        }
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
