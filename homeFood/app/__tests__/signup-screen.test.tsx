import { describe, expect, it } from 'vitest';
import {
  buildSignupPayload,
  getTermsRoute,
  TERMS_VERSION,
  validateSignupFields,
} from '@/src/lib/signup';

describe('signup consent flow', () => {
  it('rejects invalid required fields before submission', () => {
    const errors = validateSignupFields({
      name: '',
      username: 'bad user',
      email: 'invalid',
      password: '123',
      mobile: 'abc',
      nidNumber: '123',
      address: '',
    });

    expect(errors.name).toBe('Please enter your full name.');
    expect(errors.username).toBe('Username can only contain letters, numbers and underscores.');
    expect(errors.email).toBe('Please enter a valid email address.');
    expect(errors.password).toBe('Password must be at least 6 characters long.');
    expect(errors.mobile).toBe('Please enter a valid mobile number.');
    expect(errors.nidNumber).toBe('Please enter a valid NID number (10 to 17 digits).');
    expect(errors.address).toBe('Please enter your present address.');
  });

  it('builds a buyer payload with versioned consent metadata', () => {
    const payload = buildSignupPayload(
      {
        name: ' Jane Doe ',
        username: 'jane_doe',
        email: 'jane@example.com',
        password: 'secret123',
        mobile: '01712345678',
        nidNumber: '1234567890',
        address: ' Dhaka ',
      },
      'buyer',
      true,
    );

    expect(payload).toMatchObject({
      name: 'Jane Doe',
      username: 'jane_doe',
      email: 'jane@example.com',
      phone: '01712345678',
      nidNumber: '1234567890',
      address: 'Dhaka',
      role: 'buyer',
      acceptedTerms: true,
      termsVersion: TERMS_VERSION,
    });
  });

  it('routes sellers to the seller terms page', () => {
    expect(getTermsRoute('seller')).toBe('/(stack)/marketing/terms/seller');
    expect(getTermsRoute('buyer')).toBe('/(stack)/marketing/terms/buyer');
  });
});
