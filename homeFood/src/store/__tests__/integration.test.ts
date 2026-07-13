import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginThunk,
  registerThunk,
  logoutThunk,
  clearError,
  fetchMeThunk,
} from '../authSlice';

// ---------------------------------------------------------------------------
// Mocks for external dependencies
// ---------------------------------------------------------------------------

// Mock expo-secure-store
vi.mock('expo-secure-store', () => ({
  default: {
    setItemAsync: vi.fn(),
    getItemAsync: vi.fn(),
    deleteItemAsync: vi.fn(),
  },
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

// Mock the API client
vi.mock('../api/clients', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Types & Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
  id: 'user_1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'buyer',
};

const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock-token';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Auth Integration', () => {
  let store: ReturnType<typeof createTestStore>;
  let api: { post: any; get: any };
  let secureStore: { setItemAsync: any; getItemAsync: any; deleteItemAsync: any };

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
    api = require('../api/clients').api;
    secureStore = require('expo-secure-store');
  });

  // -----------------------------------------------------------------------
  // Login flow
  // -----------------------------------------------------------------------
  describe('Login Flow', () => {
    it('should transition from idle to loading when loginThunk is dispatched', () => {
      // Set up API mock to delay (so we see pending state)
      api.post.mockReturnValue(new Promise(() => {})); // never resolves

      store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update state with user and token on successful login', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.hasChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should store the token in SecureStore on successful login', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));

      expect(secureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('should update state with error on failed login', async () => {
      api.post.mockRejectedValueOnce(new Error('Invalid email or password'));

      await store.dispatch(loginThunk({ email: 'wrong@example.com', password: 'wrong' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid email or password');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it('should handle network failure during login', async () => {
      api.post.mockRejectedValueOnce(new Error('Network request failed'));

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network request failed');
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not store token on failed login', async () => {
      api.post.mockRejectedValueOnce(new Error('Unauthorized'));

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'wrong' }));

      expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should POST to /auth/login endpoint', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'secret' }));

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'secret',
      });
    });
  });

  // -----------------------------------------------------------------------
  // Register flow
  // -----------------------------------------------------------------------
  describe('Register Flow', () => {
    const registerPayload = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1234567890',
    };

    it('should transition from idle to loading when registerThunk is dispatched', () => {
      api.post.mockReturnValue(new Promise(() => {})); // never resolves

      store.dispatch(registerThunk(registerPayload));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update state with user and token on successful registration', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });

      await store.dispatch(registerThunk(registerPayload));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.hasChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should store the token in SecureStore on successful registration', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });

      await store.dispatch(registerThunk(registerPayload));

      expect(secureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('should update state with error on failed registration', async () => {
      api.post.mockRejectedValueOnce(new Error('Email already registered'));

      await store.dispatch(registerThunk(registerPayload));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Email already registered');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it('should handle network failure during registration', async () => {
      api.post.mockRejectedValueOnce(new Error('Network request failed'));

      await store.dispatch(registerThunk(registerPayload));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network request failed');
    });

    it('should not store token on failed registration', async () => {
      api.post.mockRejectedValueOnce(new Error('Validation error'));

      await store.dispatch(registerThunk(registerPayload));

      expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should register without phone number', async () => {
      const payloadWithoutPhone = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      };

      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: { ...mockUser, phone: undefined }, token: mockToken },
      });

      await store.dispatch(registerThunk(payloadWithoutPhone));

      expect(api.post).toHaveBeenCalledWith('/auth/register', payloadWithoutPhone);
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
    });

    it('should POST to /auth/register endpoint with correct payload', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });

      await store.dispatch(registerThunk(registerPayload));

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerPayload);
    });
  });

  // -----------------------------------------------------------------------
  // Logout flow
  // -----------------------------------------------------------------------
  describe('Logout Flow', () => {
    it('should clear user, token, and isAuthenticated on logout', async () => {
      // First login
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));

      // Verify logged in
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Now logout
      await store.dispatch(logoutThunk());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should delete the token from SecureStore on logout', async () => {
      // Login first
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));

      // Logout
      await store.dispatch(logoutThunk());

      expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('should reset hasChecked to false on logout', async () => {
      // Login first
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'password123' }));
      expect(store.getState().auth.hasChecked).toBe(true);

      // Logout
      await store.dispatch(logoutThunk());

      expect(store.getState().auth.hasChecked).toBe(false);
    });

    it('should allow logout even when not logged in', async () => {
      // Logout without being logged in first
      await store.dispatch(logoutThunk());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear any existing error on logout', async () => {
      // Simulate a failed login
      api.post.mockRejectedValueOnce(new Error('Login failed'));
      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'wrong' }));
      expect(store.getState().auth.error).toBe('Login failed');

      // Logout
      await store.dispatch(logoutThunk());

      expect(store.getState().auth.error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Fetch Me flow
  // -----------------------------------------------------------------------
  describe('Fetch Me Flow', () => {
    it('should load existing token from SecureStore on fetchMeThunk', async () => {
      secureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      api.get.mockResolvedValueOnce({
        success: true,
        data: mockUser,
      });

      await store.dispatch(fetchMeThunk());

      expect(secureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('should restore session from stored token on fetchMeThunk success', async () => {
      secureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      api.get.mockResolvedValueOnce({
        success: true,
        data: mockUser,
      });

      await store.dispatch(fetchMeThunk());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isLoading).toBe(false);
      expect(state.hasChecked).toBe(true);
    });

    it('should clear session when token is missing', async () => {
      secureStore.getItemAsync.mockResolvedValueOnce(null);

      await store.dispatch(fetchMeThunk());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.hasChecked).toBe(true);
    });

    it('should clear session when token is expired (401)', async () => {
      secureStore.getItemAsync.mockResolvedValueOnce('expired-token');
      api.get.mockRejectedValueOnce(new Error('Session expired'));

      await store.dispatch(fetchMeThunk());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.hasChecked).toBe(true);

      // Should also delete the expired token
      expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('should make GET request to /auth/me with the stored token', async () => {
      secureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      api.get.mockResolvedValueOnce({
        success: true,
        data: mockUser,
      });

      await store.dispatch(fetchMeThunk());

      expect(api.get).toHaveBeenCalledWith('/auth/me', mockToken);
    });
  });

  // -----------------------------------------------------------------------
  // Clear error
  // -----------------------------------------------------------------------
  describe('clearError', () => {
    it('should clear the error in the store', () => {
      // Set an error via rejected login
      api.post.mockRejectedValueOnce(new Error('Test error'));
      store.dispatch(loginThunk({ email: 'test@example.com', password: 'pass' }));

      // Wait for rejection, then clear error
      // Actually, clearError is a sync reducer, so we test it directly
      store.dispatch(clearError());

      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Full auth lifecycle
  // -----------------------------------------------------------------------
  describe('Full Auth Lifecycle', () => {
    it('should complete the full register → logout → re-login flow', async () => {
      // 1) Register
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
      await store.dispatch(registerThunk({
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      }));
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // 2) Logout
      await store.dispatch(logoutThunk());
      expect(store.getState().auth.isAuthenticated).toBe(false);

      // 3) Login again
      const secondToken = 'second-jwt-token';
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: secondToken },
      });
      await store.dispatch(loginThunk({ email: 'john@example.com', password: 'password123' }));
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe(secondToken);
    });

    it('should handle login after failed registration', async () => {
      // 1) Failed registration
      api.post.mockRejectedValueOnce(new Error('Email already taken'));
      await store.dispatch(registerThunk({
        name: 'John',
        username: 'john',
        email: 'existing@example.com',
        password: 'password123',
      }));
      expect(store.getState().auth.isAuthenticated).toBe(false);

      // 2) Successful login
      api.post.mockResolvedValueOnce({
        success: true,
        data: { user: mockUser, token: mockToken },
      });
      await store.dispatch(loginThunk({ email: 'other@example.com', password: 'password123' }));
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });

    it('should not persist auth state between store recreations (no token)', async () => {
      // Since we don't persist Redux state (only the token in SecureStore),
      // a new store should start with initial state
      const newStore = createTestStore();
      expect(newStore.getState().auth.isAuthenticated).toBe(false);
      expect(newStore.getState().auth.user).toBeNull();
      expect(newStore.getState().auth.token).toBeNull();
    });
  });
});
