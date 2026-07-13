import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../clients';

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockFetch.mockReset();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupFetchResponse(
  ok: boolean,
  body: unknown,
  status = 200,
  statusText = 'OK'
) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(body),
  });
}

function setupFetchTimeout() {
  mockFetch.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        // Simulate an abort error
        const abortError = new DOMException('The operation was aborted', 'AbortError');
        reject(abortError);
      })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('API Client', () => {
  // -----------------------------------------------------------------------
  // POST request without token
  // -----------------------------------------------------------------------
  describe('POST request without token', () => {
    it('should make a POST request to the correct URL', async () => {
      setupFetchResponse(true, { success: true, data: { id: 1 } });

      await api.post('/auth/login', { email: 'test@test.com', password: '123456' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/auth/login');
      expect(options.method).toBe('POST');
    });

    it('should send the request body as JSON', async () => {
      setupFetchResponse(true, { success: true });

      const body = { email: 'user@example.com', password: 'secret123' };
      await api.post('/auth/register', body);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toBe(JSON.stringify(body));
    });

    it('should set Content-Type header to application/json', async () => {
      setupFetchResponse(true, { success: true });

      await api.post('/auth/login', { email: 'a@b.com', password: 'pass' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should not include Authorization header when no token is provided', async () => {
      setupFetchResponse(true, { success: true });

      await api.post('/auth/login', { email: 'a@b.com', password: 'pass' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBeUndefined();
    });

    it('should return the parsed JSON response', async () => {
      const responseBody = { success: true, data: { token: 'abc123' } };
      setupFetchResponse(true, responseBody);

      const result = await api.post('/auth/login', { email: 'a@b.com', password: 'pass' });

      expect(result).toEqual(responseBody);
    });
  });

  // -----------------------------------------------------------------------
  // POST request with token
  // -----------------------------------------------------------------------
  describe('POST request with token', () => {
    it('should include the Authorization Bearer header', async () => {
      setupFetchResponse(true, { success: true });

      await api.post('/auth/register', { name: 'Test' }, 'my-jwt-token');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer my-jwt-token');
    });

    it('should still include Content-Type header', async () => {
      setupFetchResponse(true, { success: true });

      await api.post('/auth/register', { name: 'Test' }, 'token123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });
  });

  // -----------------------------------------------------------------------
  // GET request with token
  // -----------------------------------------------------------------------
  describe('GET request with token', () => {
    it('should make a GET request to the correct URL', async () => {
      setupFetchResponse(true, { success: true, data: { user: {} } });

      await api.get('/auth/me', 'valid-token');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/auth/me');
      expect(options.method).toBe('GET');
    });

    it('should include the Authorization Bearer header', async () => {
      setupFetchResponse(true, { success: true });

      await api.get('/auth/me', 'bearer-token-value');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer bearer-token-value');
    });

    it('should include Content-Type header', async () => {
      setupFetchResponse(true, { success: true });

      await api.get('/auth/me', 'token');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should not send a body', async () => {
      setupFetchResponse(true, { success: true });

      await api.get('/auth/me', 'token');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toBeUndefined();
    });

    it('should return the parsed JSON response', async () => {
      const responseBody = { success: true, data: { user: { id: '1' } } };
      setupFetchResponse(true, responseBody);

      const result = await api.get('/auth/me', 'token');

      expect(result).toEqual(responseBody);
    });
  });

  // -----------------------------------------------------------------------
  // Error handling (non-OK responses)
  // -----------------------------------------------------------------------
  describe('error handling for non-OK responses', () => {
    it('should throw an error with the status code and message on 401', async () => {
      setupFetchResponse(false, { message: 'Unauthorized' }, 401, 'Unauthorized');

      await expect(api.get('/auth/me', 'expired-token')).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should throw an error with the status code on 403', async () => {
      setupFetchResponse(false, { message: 'Forbidden' }, 403, 'Forbidden');

      await expect(api.post('/auth/login', {})).rejects.toMatchObject({
        status: 403,
      });
    });

    it('should throw an error with the status code on 404', async () => {
      setupFetchResponse(false, { message: 'Not Found' }, 404, 'Not Found');

      await expect(api.post('/auth/login', {})).rejects.toMatchObject({
        status: 404,
      });
    });

    it('should throw a generic error message when no message is provided', async () => {
      setupFetchResponse(false, {}, 500, 'Internal Server Error');

      await expect(api.post('/auth/login', {})).rejects.toMatchObject({
        message: 'Something went wrong',
      });
    });

    it('should include validation errors in the thrown object', async () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      setupFetchResponse(false, { message: 'Validation failed', errors }, 422, 'Unprocessable');

      try {
        await api.post('/auth/register', { email: 'bad' });
      } catch (err: any) {
        expect(err.errors).toEqual(errors);
        expect(err.status).toBe(422);
      }
    });

    it('should throw on 409 conflict (duplicate)', async () => {
      setupFetchResponse(false, { message: 'Email already in use' }, 409, 'Conflict');

      await expect(api.post('/auth/register', { email: 'existing@test.com' })).rejects.toMatchObject({
        status: 409,
        message: 'Email already in use',
      });
    });
  });

  // -----------------------------------------------------------------------
  // Network timeout
  // -----------------------------------------------------------------------
  describe('network timeout', () => {
    it('should reject with an abort error when the request times out', async () => {
      setupFetchTimeout();

      await expect(api.post('/auth/login', { email: 'a@b.com', password: 'pass' })).rejects.toThrow();
    });

    it('should reject when abort signal is triggered', async () => {
      setupFetchTimeout();

      try {
        await api.get('/auth/me', 'token');
      } catch (err) {
        // Should throw, any error type is acceptable (DOMException, Error, etc.)
        expect(err).toBeDefined();
      }
    });
  });

  // -----------------------------------------------------------------------
  // Correct headers verification
  // -----------------------------------------------------------------------
  describe('correct headers', () => {
    it('should set Content-Type for every request', async () => {
      setupFetchResponse(true, {});
      await api.post('/auth/login', {});

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should set Content-Type for GET requests too', async () => {
      setupFetchResponse(true, {});
      await api.get('/auth/me', 'token');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should only include Authorization when token is provided', async () => {
      setupFetchResponse(true, {});
      await api.post('/auth/login', {});

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBeUndefined();
    });

    it('should not include the Authorization header as undefined string', async () => {
      setupFetchResponse(true, {});
      await api.post('/auth/login', {});

      const [, options] = mockFetch.mock.calls[0];
      // Must not be present at all, not present with value "undefined"
      expect(Object.prototype.hasOwnProperty.call(options.headers, 'Authorization')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle empty response body', async () => {
      setupFetchResponse(true, {});

      const result = await api.post('/auth/login', { email: 'a@b.com', password: 'pass' });
      expect(result).toEqual({});
    });

    it('should handle a response with nested null values', async () => {
      setupFetchResponse(true, { success: true, data: null });

      const result = await api.post('/auth/login', { email: 'a@b.com', password: 'pass' });
      expect(result.data).toBeNull();
    });

    it('should pass through the signal to abort controller', async () => {
      setupFetchResponse(true, { success: true });

      await api.post('/auth/login', { email: 'a@b.com', password: 'pass' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.signal).toBeDefined();
      expect(options.signal instanceof AbortSignal).toBe(true);
    });
  });
});
