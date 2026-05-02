/**
 * @fileoverview Tests for the beach product catalog data source.
 *
 * WARNING: This file represents the trusted source of truth for the
 * /api/checkout/beach route. The price-IDOR vulnerability must be mitigated
 * by always calculating the total amount from this data structure, never
 * from client-supplied request bodies.
 */

import { describe, it, expect } from 'vitest';
import {
  BEACH_PRODUCTS,
  BeachProduct,
  getBeachProduct,
  dailyTotalCents,
} from '../src/data/beach-products'; // Assuming the test runs from a directory structure where this import works

describe('BEACH_PRODUCTS Catalog', () => {
  it('should contain the correct number of products', () => {
    expect(BEACH_PRODUCTS).toHaveLength(2);
  });

  it('should define the correct products (cabana and chairs)', () => {
    const productValues = BEACH_PRODUCTS.map((p) => p.value);
    expect(productValues).toEqual(expect.arrayContaining(['cabana', 'chairs']));
  });

  it('should define the correct structure and values for cabana', () => {
    const cabana = BEACH_PRODUCTS.find((p) => p.value === 'cabana');
    expect(cabana).toBeDefined();
    const cabanaProduct = cabana as BeachProduct;
    expect(cabanaProduct.label).toBe('Cabana Setup');
    expect(cabanaProduct.vendorBaseCents).toBe(27500);
    expect(cabanaProduct.palFeeCents).toBe(2500);
  });

  it('should define the correct structure and values for chairs', () => {
    const chairs = BEACH_PRODUCTS.find((p) => p.value === 'chairs');
    expect(chairs).toBeDefined();
    const chairsProduct = chairs as BeachProduct;
    expect(chairsProduct.label).toBe('Chair & Umbrella Setup');
    expect(chairsProduct.vendorBaseCents).toBe(7500);
    expect(chairsProduct.palFeeCents).toBe(1000);
  });
});

describe('getBeachProduct', () => {
  it('should return the correct product for "cabana"', () => {
    const product = getBeachProduct('cabana');
    expect(product).toBeDefined();
    expect(product?.value).toBe('cabana');
  });

  it('should return the correct product for "chairs"', () => {
    const product = getBeachProduct('chairs');
    expect(product).toBeDefined();
    expect(product?.value).toBe('chairs');
  });

  it('should return null for an unknown slug', () => {
    const product = getBeachProduct('unknown_slug');
    expect(product).toBeNull();
  });
});

describe('dailyTotalCents', () => {
  it('should calculate the correct total for cabana (27500 + 2500 = 30000)', () => {
    const cabanaProduct = getBeachProduct('cabana')!;
    expect(dailyTotalCents(cabanaProduct)).toBe(30000);
  });

  it('should calculate the correct total for chairs (7500 + 1000 = 8500)', () => {
    const chairsProduct = getBeachProduct('chairs')!;
    expect(dailyTotalCents(chairsProduct)).toBe(8500);
  });
});
