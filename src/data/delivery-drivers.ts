/**
 * PAL Delivery — driver roster.
 *
 * V1 manual config. To add a driver:
 *   1. Append to DRIVERS with id/name/phone/token
 *   2. Token must also exist in Vercel env vars as
 *      WHEELHOUSE_DRIVER_TOKEN_<UPPER_ID> so the dispatch link works
 *      across deploys (or just generate-and-paste once)
 *   3. Set isActive=true to start receiving dispatch SMS
 *
 * Drivers are kept separate from Wheelhouse participants on purpose —
 * delivery ops and internal coordination are different surfaces. We
 * mirror order events into Wheelhouse for visibility, but drivers don't
 * post threads.
 */

import type { DeliveryDriver } from "./delivery-types";

export const DRIVERS: DeliveryDriver[] = [
  // Placeholder — Winston will replace with the two real drivers he has
  // in mind. Tokens are random base32-ish; rotate any time by editing.
  {
    id: "winston",
    name: "Winston",
    phone: "+13614281706", // ADMIN_PHONE for first-30-orders validation lap
    isActive: false, // flip true once Winston wants to receive dispatch
    token: "drv_winston_REPLACE_ME",
    payoutMethod: "cash",
  },
  {
    id: "driver-2",
    name: "Driver Two (placeholder)",
    phone: "+15555550100",
    isActive: false,
    token: "drv_two_REPLACE_ME",
    payoutMethod: "venmo",
  },
];

export function getActiveDrivers(): DeliveryDriver[] {
  return DRIVERS.filter((d) => d.isActive);
}

export function getDriver(id: string): DeliveryDriver | undefined {
  return DRIVERS.find((d) => d.id === id);
}

export function getDriverByToken(token: string): DeliveryDriver | undefined {
  return DRIVERS.find((d) => d.token === token);
}
