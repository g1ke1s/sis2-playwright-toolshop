import { APIRequestContext, expect } from '@playwright/test';
import { API_URL } from '../playwright.config';
import { User } from './user.factory';

/**
 * The Toolshop derives street/city/state from country + postcode (postcode lookup)
 * and the invoice API rejects an address that does not match it. Asking the same
 * lookup up front makes the test user's address consistent with what the UI will
 * auto-fill, so checkout never races the lookup.
 * Falls back to the factory defaults if the lookup endpoint is unavailable.
 */
export async function withLookedUpAddress(request: APIRequestContext, user: User): Promise<User> {
  const response = await request.get(`${API_URL}/postcode-lookup`, {
    params: { country: user.country, postcode: user.postalCode, house_number: user.houseNumber },
  });
  if (!response.ok()) return user;
  const found = await response.json();
  return {
    ...user,
    street: found.street ?? user.street,
    city: found.city ?? user.city,
    state: found.state ?? user.state,
  };
}

/** Creates the customer through the public REST API (test-data setup, not the thing under test). */
export async function registerViaApi(request: APIRequestContext, user: User): Promise<void> {
  const response = await request.post(`${API_URL}/users/register`, {
    data: {
      first_name: user.firstName,
      last_name: user.lastName,
      dob: user.dob,
      phone: user.phone,
      email: user.email,
      password: user.password,
      address: {
        street: user.street,
        house_number: user.houseNumber,
        city: user.city,
        state: user.state,
        country: user.country,
        postal_code: user.postalCode,
      },
    },
  });
  expect(response.status(), await response.text()).toBe(201);
}
