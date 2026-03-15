import { MeasurementInput, OrderInput } from "@workspace/api-client-react";

const BASE_PRICES: Record<string, number> = {
  cotton: 89,
  "stretch-cotton": 99,
  linen: 109,
};

const POCKET_PRICES: Record<string, number> = {
  classic: 0,
  cargo: 15,
  "no-pocket": -5,
};

const OCCASION_PRICES: Record<string, number> = {
  formal: 10,
  casual: 0,
};

const FIT_PRICES: Record<string, number> = {
  slim: 5,
  regular: 0,
  relaxed: 0,
};

export function calculatePrice(
  customization?: Partial<OrderInput>,
  measurement?: Partial<MeasurementInput>
): number {
  let total = 0;

  if (customization?.fabricType) {
    total += BASE_PRICES[customization.fabricType] || 0;
  } else {
    total += BASE_PRICES["cotton"]; // Default baseline
  }

  if (customization?.pocketStyle) {
    total += POCKET_PRICES[customization.pocketStyle] || 0;
  }

  if (customization?.occasion) {
    total += OCCASION_PRICES[customization.occasion] || 0;
  }

  if (measurement?.fitPreference) {
    total += FIT_PRICES[measurement.fitPreference] || 0;
  }

  return total;
}
