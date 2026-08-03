// Server-side delivery quote helpers shared by the public quote endpoint
// and the order creation flow.

import {
  MAX_DELIVERY_KM,
  computeDeliveryFee,
  estimatedRoadDistanceKm,
} from "./config";
import { geocodeAddressWithRetry, type GeocodeResult } from "./geocoding.server";

export type DeliveryQuoteOutcome =
  | {
      status: "ok";
      distanceKm: number;
      feeAud: number;
      minPieces: number;
      deliverable: true;
      method: "osm-estimate" | "google-estimate";
      geocode: GeocodeResult;
    }
  | {
      status: "out_of_range";
      distanceKm: number;
      feeAud: null;
      minPieces: number;
      deliverable: false;
      method: "osm-estimate" | "google-estimate";
      geocode: GeocodeResult;
    }
  | {
      status: "unresolved";
      distanceKm: null;
      feeAud: null;
      minPieces: number;
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
  const geo = await geocodeAddressWithRetry(address);
  const method =
    (process.env.GEOCODING_PROVIDER ?? "nominatim").toLowerCase() === "google"
      ? ("google-estimate" as const)
      : ("osm-estimate" as const);

  if (!geo) {
    return {
      status: "unresolved",
      distanceKm: null,
      feeAud: null,
      minPieces: 0,
      deliverable: null,
      method: "pending",
      geocode: null,
    };
  }

  const distanceKm = estimatedRoadDistanceKm(geo.lat, geo.lng);
  const { feeAud, minPieces } = computeDeliveryFee(distanceKm);

  if (feeAud === null || distanceKm > MAX_DELIVERY_KM) {
    return {
      status: "out_of_range",
      distanceKm,
      feeAud: null,
      minPieces: 0,
      deliverable: false,
      method,
      geocode: geo,
    };
  }

  return {
    status: "ok",
    distanceKm,
    feeAud,
    minPieces,
    deliverable: true,
    method,
    geocode: geo,
  };
}