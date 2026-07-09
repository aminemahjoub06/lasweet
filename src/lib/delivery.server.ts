// Server-side delivery quote helpers shared by the public quote endpoint
// and the order creation flow.

import {
  MAX_DELIVERY_KM,
  computeDeliveryFee,
  estimatedRoadDistanceKm,
} from "./config";
import { geocodeAddress, type GeocodeResult } from "./geocoding.server";

export type DeliveryQuoteOutcome =
  | {
      status: "ok";
      distanceKm: number;
      feeAud: number;
      deliverable: true;
      method: "osm-estimate" | "google-estimate";
      geocode: GeocodeResult;
    }
  | {
      status: "out_of_range";
      distanceKm: number;
      feeAud: null;
      deliverable: false;
      method: "osm-estimate" | "google-estimate";
      geocode: GeocodeResult;
    }
  | {
      status: "unresolved";
      distanceKm: null;
      feeAud: null;
      deliverable: null;
      method: "pending";
      geocode: null;
    };

/**
 * Geocode an address, estimate road distance, and return a delivery quote.
 * When the geocoding provider is unreachable or the address can't be
 * resolved, returns `status: "unresolved"` so the caller can queue the
 * order with a pending quote instead of rejecting it.
 */
export async function computeDeliveryQuoteForAddress(
  address: string,
): Promise<DeliveryQuoteOutcome> {
  const geo = await geocodeAddress(address);
  const method =
    (process.env.GEOCODING_PROVIDER ?? "nominatim").toLowerCase() === "google"
      ? ("google-estimate" as const)
      : ("osm-estimate" as const);

  if (!geo) {
    return {
      status: "unresolved",
      distanceKm: null,
      feeAud: null,
      deliverable: null,
      method: "pending",
      geocode: null,
    };
  }

  const distanceKm = estimatedRoadDistanceKm(geo.lat, geo.lng);
  const feeAud = computeDeliveryFee(distanceKm);

  if (feeAud === null || distanceKm > MAX_DELIVERY_KM) {
    return {
      status: "out_of_range",
      distanceKm,
      feeAud: null,
      deliverable: false,
      method,
      geocode: geo,
    };
  }

  return {
    status: "ok",
    distanceKm,
    feeAud,
    deliverable: true,
    method,
    geocode: geo,
  };
}