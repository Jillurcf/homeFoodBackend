import { describe, it, expect } from 'vitest';
import authReducer, {
  loginThunk,
  registerThunk,
  fetchMeThunk,
  logoutThunk,
  clearError,
} from '../authSlice';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hasChecked: false,
  isLoading: false,
  error: null,
};

const mockUser = {
  id: 'user_1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'buyer',
};

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-token';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('authSlice', () => {
  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------
  describe('initial state', () => {
    it('should return the initial state when called with undefined state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should have isAuthenticated set to false initially', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.isAuthenticated).toBe(false);
    });

    it('should have hasChecked set to false initially', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.hasChecked).toBe(false);
    });

    it('should have isLoading set to false initially', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.isLoading).toBe(false);
    });

    it('should have error set to null initially', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.error).toBeNull();
    });

    it('should have user set to null initially', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.user).toBeNull();
    });

    it('should have token set to null initially', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.token).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // clearError reducer
  // -----------------------------------------------------------------------
  describe('clearError', () => {
    it('should clear the error field when error is set', () => {
      const stateWithError = { ...initialState, error: 'Something went wrong' };
      const state = authReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });

    it('should remain null when error is already null', () => {
      const state = authReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });

    it('should not affect other state fields', () => {
      const stateWithData = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      };
      const state = authReducer(stateWithData, clearError());
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // loginThunk lifecycle
  // -----------------------------------------------------------------------
  describe('loginThunk', () => {
    describe('pending', () => {
      it('should set isLoading to true', () => {
        const state = authReducer(initialState, { type: loginThunk.pending.type });
        expect(state.isLoading).toBe(true);
      });

      it('should clear any previous error', () => {
        const stateWithError = { ...initialState, error: 'Previous error' };
        const state = authReducer(stateWithError, { type: loginThunk.pending.type });
        expect(state.error).toBeNull();
      });

      it('should not alter user, token, or isAuthenticated', () => {
        const stateWithAuth = {
          ...initialState,
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
        };
        const state = authReducer(stateWithAuth, { type: loginThunk.pending.type });
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe(mockToken);
        expect(state.isAuthenticated).toBe(true);
      });
    });

    describe('fulfilled', () => {
      it('should set isLoading to false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const state = authReducer(
          loadingState,
          { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.isLoading).toBe(false);
      });

      it('should set hasChecked to true', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.hasChecked).toBe(true);
      });

      it('should set the user payload', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.user).toEqual(mockUser);
      });

      it('should set the token payload', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.token).toBe(mockToken);
      });

      it('should set isAuthenticated to true', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.isAuthenticated).toBe(true);
      });

      it('should clear any error', () => {
        const stateWithError = { ...initialState, error: 'Previous error', isLoading: true };
        const state = authReducer(
          stateWithError,
          { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.error).toBeNull();
      });
    });

    describe('rejected', () => {
      it('should set isLoading to false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const state = authReducer(
          loadingState,
          { type: loginThunk.rejected.type, payload: 'Invalid credentials' }
        );
        expect(state.isLoading).toBe(false);
      });

      it('should set hasChecked to true', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.rejected.type, payload: 'Invalid credentials' }
        );
        expect(state.hasChecked).toBe(true);
      });

      it('should set the error message from the payload', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.rejected.type, payload: 'Invalid email or password' }
        );
        expect(state.error).toBe('Invalid email or password');
      });

      it('should use a fallback error message when payload is not provided', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.rejected.type, payload: undefined }
        );
        expect(state.error).toBe('Login failed');
      });

      it('should not set user or token on failure', () => {
        const state = authReducer(
          initialState,
          { type: loginThunk.rejected.type, payload: 'Error' }
        );
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
      });
    });
  });

  // -----------------------------------------------------------------------
  // registerThunk lifecycle
  // -----------------------------------------------------------------------
  describe('registerThunk', () => {
    describe('pending', () => {
      it('should set isLoading to true', () => {
        const state = authReducer(initialState, { type: registerThunk.pending.type });
        expect(state.isLoading).toBe(true);
      });

      it('should clear any previous error', () => {
        const stateWithError = { ...initialState, error: 'Previous error' };
        const state = authReducer(stateWithError, { type: registerThunk.pending.type });
        expect(state.error).toBeNull();
      });
    });

    describe('fulfilled', () => {
      it('should set isLoading to false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const state = authReducer(
          loadingState,
          { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.isLoading).toBe(false);
      });

      it('should set hasChecked to true', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.hasChecked).toBe(true);
      });

      it('should set the user payload', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.user).toEqual(mockUser);
      });

      it('should set the token payload', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.token).toBe(mockToken);
      });

      it('should set isAuthenticated to true', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.isAuthenticated).toBe(true);
      });

      it('should clear any error', () => {
        const stateWithError = { ...initialState, error: 'Previous error', isLoading: true };
        const state = authReducer(
          stateWithError,
          { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.error).toBeNull();
      });
    });

    describe('rejected', () => {
      it('should set isLoading to false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const state = authReducer(
          loadingState,
          { type: registerThunk.rejected.type, payload: 'Email already in use' }
        );
        expect(state.isLoading).toBe(false);
      });

      it('should set hasChecked to true', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.rejected.type, payload: 'Email already in use' }
        );
        expect(state.hasChecked).toBe(true);
      });

      it('should set the error from the payload', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.rejected.type, payload: 'Email already exists' }
        );
        expect(state.error).toBe('Email already exists');
      });

      it('should fall back to default error message when payload is missing', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.rejected.type, payload: undefined }
        );
        expect(state.error).toBe('Registration failed');
      });

      it('should not set user or token on failure', () => {
        const state = authReducer(
          initialState,
          { type: registerThunk.rejected.type, payload: 'Error' }
        );
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
      });
    });
  });

  // -----------------------------------------------------------------------
  // fetchMeThunk lifecycle
  // -----------------------------------------------------------------------
  describe('fetchMeThunk', () => {
    describe('pending', () => {
      it('should set isLoading to true', () => {
        const state = authReducer(initialState, { type: fetchMeThunk.pending.type });
        expect(state.isLoading).toBe(true);
      });

      it('should set hasChecked to false while loading', () => {
        const checkedState = { ...initialState, hasChecked: true };
        const state = authReducer(checkedState, { type: fetchMeThunk.pending.type });
        expect(state.hasChecked).toBe(false);
      });
    });

    describe('fulfilled', () => {
      it('should set isLoading to false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const state = authReducer(
          loadingState,
          { type: fetchMeThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.isLoading).toBe(false);
      });

      it('should set hasChecked to true', () => {
        const state = authReducer(
          initialState,
          { type: fetchMeThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.hasChecked).toBe(true);
      });

      it('should set the user from the payload', () => {
        const state = authReducer(
          initialState,
          { type: fetchMeThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.user).toEqual(mockUser);
      });

      it('should set the token from the payload', () => {
        const state = authReducer(
          initialState,
          { type: fetchMeThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.token).toBe(mockToken);
      });

      it('should set isAuthenticated to true', () => {
        const state = authReducer(
          initialState,
          { type: fetchMeThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
        );
        expect(state.isAuthenticated).toBe(true);
      });
    });

    describe('rejected', () => {
      it('should set isLoading to false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const state = authReducer(
          loadingState,
          { type: fetchMeThunk.rejected.type, error: { message: 'Token expired' } }
        );
        expect(state.isLoading).toBe(false);
      });

      it('should set hasChecked to true', () => {
        const state = authReducer(
          initialState,
          { type: fetchMeThunk.rejected.type, error: { message: 'Token expired' } }
        );
        expect(state.hasChecked).toBe(true);
      });

      it('should clear the user on rejection', () => {
        const authState = {
          ...initialState,
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
        };
        const state = authReducer(
          authState,
          { type: fetchMeThunk.rejected.type, error: { message: 'Token expired' } }
        );
        expect(state.user).toBeNull();
      });

      it('should clear the token on rejection', () => {
        const authState = {
          ...initialState,
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
        };
        const state = authReducer(
          authState,
          { type: fetchMeThunk.rejected.type, error: { message: 'Token expired' } }
        );
        expect(state.token).toBeNull();
      });

      it('should set isAuthenticated to false on rejection', () => {
        const authState = {
          ...initialState,
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
        };
        const state = authReducer(
          authState,
          { type: fetchMeThunk.rejected.type, error: { message: 'Token expired' } }
        );
        expect(state.isAuthenticated).toBe(false);
      });
    });
  });

  // -----------------------------------------------------------------------
  // logoutThunk lifecycle
  // -----------------------------------------------------------------------
  describe('logoutThunk', () => {
    it('should set user to null on fulfilled', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
      };
      const state = authReducer(authState, { type: logoutThunk.fulfilled.type });
      expect(state.user).toBeNull();
    });

    it('should set token to null on fulfilled', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
      };
      const state = authReducer(authState, { type: logoutThunk.fulfilled.type });
      expect(state.token).toBeNull();
    });

    it('should set isAuthenticated to false on fulfilled', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
      };
      const state = authReducer(authState, { type: logoutThunk.fulfilled.type });
      expect(state.isAuthenticated).toBe(false);
    });

    it('should set hasChecked to false on fulfilled', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
      };
      const state = authReducer(authState, { type: logoutThunk.fulfilled.type });
      expect(state.hasChecked).toBe(false);
    });

    it('should clear error on fulfilled', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
        error: 'Some previous error',
      };
      const state = authReducer(authState, { type: logoutThunk.fulfilled.type });
      expect(state.error).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // isAuthenticated transitions
  // -----------------------------------------------------------------------
  describe('isAuthenticated transitions', () => {
    it('should transition from false to true on loginThunk.fulfilled', () => {
      const state = authReducer(
        initialState,
        { type: loginThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
      );
      expect(state.isAuthenticated).toBe(true);
    });

    it('should transition from false to true on registerThunk.fulfilled', () => {
      const state = authReducer(
        initialState,
        { type: registerThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
      );
      expect(state.isAuthenticated).toBe(true);
    });

    it('should transition from false to true on fetchMeThunk.fulfilled', () => {
      const state = authReducer(
        initialState,
        { type: fetchMeThunk.fulfilled.type, payload: { user: mockUser, token: mockToken } }
      );
      expect(state.isAuthenticated).toBe(true);
    });

    it('should remain false on loginThunk.rejected', () => {
      const state = authReducer(
        initialState,
        { type: loginThunk.rejected.type, payload: 'Error' }
      );
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remain false on registerThunk.rejected', () => {
      const state = authReducer(
        initialState,
        { type: registerThunk.rejected.type, payload: 'Error' }
      );
      expect(state.isAuthenticated).toBe(false);
    });

    it('should transition from true to false on fetchMeThunk.rejected', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
      };
      const state = authReducer(
        authState,
        { type: fetchMeThunk.rejected.type, error: { message: 'Expired' } }
      );
      expect(state.isAuthenticated).toBe(false);
    });

    it('should transition from true to false on logoutThunk.fulfilled', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        hasChecked: true,
      };
      const state = authReducer(authState, { type: logoutThunk.fulfilled.type });
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remain true on loginThunk.pending when already authenticated', () => {
      const authState = {
        ...initialState,
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
      };
      const state = authReducer(authState, { type: loginThunk.pending.type });
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
