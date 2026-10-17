import { randomUUID } from 'crypto';

export interface User {
  firstName: string;
  lastName: string;
  dob: string;          // YYYY-MM-DD
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;      // ISO code used by the country <select>
  phone: string;
  email: string;
  password: string;
}

/** A fresh, never-used customer on every call — unique email AND password. */
export function newUser(overrides: Partial<User> = {}): User {
  const id = `${Date.now()}${randomUUID().slice(0, 8)}`;
  return {
    firstName: 'Sis',
    lastName: `Tester${id.slice(-6)}`,
    dob: '1995-05-15',
    street: 'Abay Avenue',
    houseNumber: '59',
    postalCode: '10001',
    city: 'New York',
    state: 'New York',
    country: 'US',
    phone: '0123456789',
    email: `sis2.${id}@example.com`,
    // Mixed case + digit + symbol; random so it is never in a breach list (API checks "uncompromised").
    password: `Ts!${randomUUID().slice(0, 10)}Aa9`,
    ...overrides,
  };
}

/** An e-mail address that is guaranteed not to belong to any account. */
export function unknownEmail(): string {
  return `nobody.${Date.now()}${randomUUID().slice(0, 6)}@example.com`;
}

/** Password the Toolshop API sets when the forgot-password flow succeeds. */
export const RESET_PASSWORD = 'welcome02';
