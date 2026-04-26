/**
 * PAL Delivery — driver lookups (DB-backed).
 *
 * v2 (2026-04-26): drivers live in the `delivery_drivers` Postgres
 * table, NOT in a static array. New drivers self-apply via
 * /deliver/runner, get reviewed by Winston via a magic-link approval
 * email, and become active once approved.
 *
 * Adapter functions below preserve the v1 API names (getDriverByToken,
 * getActiveDrivers, getDriver) so all the existing call sites in the
 * dispatch + claim + status + connect routes keep working — they just
 * need to await now.
 */

import {
  getActiveDriversDb,
  getDriverById,
  getDriverByTokenDb,
  type DriverRecord,
} from "./delivery-store";
import type { DeliveryDriver } from "./delivery-types";

/** Map a DB record → the legacy DeliveryDriver shape used by callers */
function recordToLegacy(r: DriverRecord): DeliveryDriver {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email ?? undefined,
    isActive: r.isActive,
    token: r.token,
    payoutMethod: r.payoutMethod ?? "venmo",
    payoutHandle: r.payoutHandle ?? undefined,
  };
}

export async function getActiveDrivers(): Promise<DeliveryDriver[]> {
  const rows = await getActiveDriversDb();
  return rows.map(recordToLegacy);
}

export async function getDriver(id: string): Promise<DeliveryDriver | undefined> {
  const r = await getDriverById(id);
  return r ? recordToLegacy(r) : undefined;
}

export async function getDriverByToken(
  token: string,
): Promise<DeliveryDriver | undefined> {
  const r = await getDriverByTokenDb(token);
  return r ? recordToLegacy(r) : undefined;
}
