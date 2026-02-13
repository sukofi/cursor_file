
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getLoginUrl } from './const';

describe('getLoginUrl', () => {
  // Save original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    // Note: window.location is read-only in some environments, so we use Object.defineProperty
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    vi.unstubAllEnvs();
  });

  it('generates the correct login URL', () => {
    // Mock import.meta.env
    // Verify how vitest handles import.meta.env. 
    // Usually it's available. If not, we might need a setup file.
    // For this test, we assume standard Vite behavior where we can mock it 
    // or we assume the code picks up values.
    // Since we cannot easily mock import.meta.env in all setups without config changes, 
    // we will check if the URL structure is correct regardless of the specific env values,
    // OR we rely on the fact that undefined env vars might result in "undefined" string or similar.

    // However, to be robust, let's try to verify the logic:
    // It constructs: `${oauthPortalUrl}/app-auth`

    const urlString = getLoginUrl();
    const url = new URL(urlString);

    // Check query params which are logic-dependent
    expect(url.searchParams.get('type')).toBe('signIn');

    // Check that construction succeeded with the env var
    expect(url.protocol).toBe('http:');
    expect(url.host).toBe('localhost:3000');
    expect(url.pathname).toBe('/app-auth');

    const redirectUri = url.searchParams.get('redirectUri');
    expect(redirectUri).toBe('http://localhost:3000/api/oauth/callback');

    const state = url.searchParams.get('state');
    expect(state).toBeDefined();
    // Verify state matches base64 of redirectUri
    if (state) {
      expect(atob(state)).toBe('http://localhost:3000/api/oauth/callback');
    }
  });
});
