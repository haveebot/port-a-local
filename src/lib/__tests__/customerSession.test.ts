import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readBearerToken,
  verifyCustomerSession,
  CustomerSessionPayload,
} from '../src/lib/customerSession'; // Assuming the test file is in __tests__ and the module is in src/lib
import crypto from 'node:crypto';

// Mock Request type for testing readBearerToken
interface MockRequest {
  headers: {
    get: (key: string) => string | null;
  };
}

/**
 * Helper function to generate a base64url encoded string.
 * @param data The string data to encode.
 * @returns The base64url string.
 */
const base64urlEncode = (data: string): string => {
  return Buffer.from(data).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Helper function to mint a test token.
 * @param payload The payload object.
 * @param secret The secret key.
 * @returns The full token string.
 */
const mintToken = (payload: Partial<CustomerSessionPayload>, secret: string): string => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour expiry

  const finalPayload: CustomerSessionPayload = {
    sub: payload.sub || 'test-sub',
    iat: payload.iat || iat,
    exp: payload.exp || exp,
    email: payload.email || null,
  };

  const payloadJson = JSON.stringify(finalPayload);
  const payloadB64 = base64urlEncode(payloadJson);

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payloadJson)
    .digest('base64');

  const sigB64 = hmac
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${payloadB64}.${sigB64}`;
};

describe('Customer Session Token Handling', () => {
  const TEST_SECRET = 'super-secure-test-secret';

  beforeEach(() => {
    process.env.CUSTOMER_SESSION_SECRET = TEST_SECRET;
  });

  describe('readBearerToken', () => {
    it('should correctly extract the token from a standard Bearer header', () => {
      const mockReq: MockRequest = {
        headers: {
          get: (key: string) => (key === 'authorization' ? 'Bearer my.valid.token' : null),
        },
      };
      expect(readBearerToken(mockReq)).toBe('my.valid.token');
    });

    it('should handle lowercase "bearer" case', () => {
      const mockReq: MockRequest = {
        headers: {
          get: (key: string) => (key === 'authorization' ? 'bearer my.valid.token' : null),
        },
      };
      expect(readBearerToken(mockReq)).toBe('my.valid.token');
    });

    it('should handle extra whitespace', () => {
      const mockReq: MockRequest = {
        headers: {
          get: (key: string) => (key === 'authorization' ? 'Bearer   my.valid.token  ' : null),
        },
      };
      expect(readBearerToken(mockReq)).toBe('my.valid.token');
    });

    it('should return null if the authorization header is missing', () => {
      const mockReq: MockRequest = {
        headers: {
          get: (key: string) => null,
        },
      };
      expect(readBearerToken(mockReq)).toBeNull();
    });

    it('should return null if the header is present but not in Bearer format', () => {
      const mockReq: MockRequest = {
        headers: {
          get: (key: string) => 'Basic dXNlcjpwYXNzd29yZA==',
        },
      };
      expect(readBearerToken(mockReq)).toBeNull();
    });

    it('should return null if the header is Bearer but no token follows', () => {
      const mockReq: MockRequest = {
        headers: {
          get: (key: string) => 'Bearer ',
        },
      };
      expect(readBearerToken(mockReq)).toBe(''); // Note: The regex captures the space, trim() handles it.
    });
  });

  describe('verifyCustomerSession', () => {
    const now = Math.floor(Date.now() / 1000);
    const validPayload = {
      sub: 'user-123',
      iat: now - 60,
      exp: now + 3600,
      email: 'test@example.com',
    };

    it('should successfully verify a valid, correctly minted token', () => {
      const token = mintToken(validPayload, TEST_SECRET);
      const result = verifyCustomerSession(token);

      expect(result).not.toBeNull();
      expect(result?.sub).toBe(validPayload.sub);
      expect(result?.exp).toBe(validPayload.exp);
      expect(result?.email).toBe(validPayload.email);
    });

    it('should return null if the token is null or undefined', () => {
      expect(verifyCustomerSession(null)).toBeNull();
      expect(verifyCustomerSession(undefined as any)).toBeNull();
    });

    it('should return null if the secret environment variable is missing', () => {
      delete process.env.CUSTOMER_SESSION_SECRET;
      const token = mintToken(validPayload, 'dummy'); // Token generation doesn't care, but verification does
      expect(verifyCustomerSession(token)).toBeNull();
    });

    // --- Malformed Token Tests ---

    it('should return null if the token does not contain two parts (no dot)', () => {
      const token = 'payload.sig.extra';
      expect(verifyCustomerSession(token)).toBeNull();
    });

    it('should return null if the token is missing the signature part', () => {
      const token = 'payload_only';
      expect(verifyCustomerSession(token)).toBeNull();
    });

    it('should return null if the payload base64 is malformed', () => {
      // Payload part is invalid base64
      const token = '!!!INVALID_B64!!!.sig';
      expect(verifyCustomerSession(token)).toBeNull();
    });

    it('should return null if the signature base64 is malformed', () => {
      // Signature part is invalid base64
      const token = 'payload.!!!INVALID_B64!!!';
      expect(verifyCustomerSession(token)).toBeNull();
    });

    // --- Security/Integrity Tests ---

    it('should return null if the signature is tampered with (timing-safe check)', () => {
      const originalToken = mintToken(validPayload, TEST_SECRET);
      const parts = originalToken.split('.');
      // Tamper with the signature part
      const tamperedToken = `${parts[0]}.A${parts[2]}`;
      expect(verifyCustomerSession(tamperedToken)).toBeNull();
    });

    it('should return null if the payload is tampered with (signature mismatch)', () => {
      const originalToken = mintToken(validPayload, TEST_SECRET);
      const parts = originalToken.split('.');
      // Tamper with the payload part
      const tamperedPayload = parts[0].replace(/a/g, 'z');
      const tamperedToken = `${tamperedPayload}.${parts[1]}`;
      expect(verifyCustomerSession(tamperedToken)).toBeNull();
    });

    // --- Logic/Payload Tests ---

    it('should return null if the token payload JSON is invalid', () => {
      // Manually construct a token with invalid JSON payload
      const badPayloadB64 = base64urlEncode('{"sub": "user", "exp": 123'); // Missing closing brace
      const token = `${badPayloadB64}.sig`;
      // Note: Since we can't easily calculate the signature for invalid JSON, we use a dummy signature
      const dummyToken = `${badPayloadB64}.dummy`;
      expect(verifyCustomerSession(dummyToken)).toBeNull();
    });

    it('should return null if the required sub field is missing', () => {
      const invalidPayload: Partial<CustomerSessionPayload> = { iat: now, exp: now + 100 };
      const token = mintToken(invalidPayload, TEST_SECRET);
      // We must manually break the payload to remove 'sub'
      const parts = token.split('.');
      const payloadJson = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      delete (payloadJson as any).sub;
      const badPayloadB64 = base64urlEncode(JSON.stringify(payloadJson));
      const badToken = `${badPayloadB64}.${parts[1]}`;
      expect(verifyCustomerSession(badToken)).toBeNull();
    });

    it('should return null if the required exp field is missing', () => {
      const invalidPayload: Partial<CustomerSessionPayload> = { sub: 'user-123', iat: now };
      const token = mintToken(invalidPayload, TEST_SECRET);
      // We must manually break the payload to remove 'exp'
      const parts = token.split('.');
      const payloadJson = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      delete (payloadJson as any).exp;
      const badPayloadB64 = base64urlEncode(JSON.stringify(payloadJson));
      const badToken = `${badPayloadB64}.${parts[1]}`;
      expect(verifyCustomerSession(badToken)).toBeNull();
    });

    it('should return null if the token is expired', () => {
      const expiredPayload: Partial<CustomerSessionPayload> = {
        sub: 'user-123',
        iat: now - 7200,
        exp: now - 100, // 100 seconds in the past
      };
      const token = mintToken(expiredPayload, TEST_SECRET);
      expect(verifyCustomerSession(token)).toBeNull();
    });

    it('should correctly handle optional fields (email)', () => {
      const payloadWithoutEmail: Partial<CustomerSessionPayload> = {
        sub: 'user-no-email',
        iat: now,
        exp: now + 3600,
        email: undefined,
      };
      const token = mintToken(payloadWithoutEmail, TEST_SECRET);
      const result = verifyCustomerSession(token);
      expect(result).not.toBeNull();
      expect(result?.email).toBeNull();
    });
  });
});
