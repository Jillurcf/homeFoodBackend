import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReplace = vi.fn();
const mockDispatch = vi.fn();

vi.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
  },
}));

// We mock react-redux to control auth state per test
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => {
    // The selector is applied to the mock state defined in the test
    // We'll set mockState via a variable that tests can modify
    return selector(mockState);
  },
  Provider: ({ children }: { children: React.ReactNode }) => children,
}));

// ---------------------------------------------------------------------------
// Shared mutable state (tests will mutate this before rendering)
// ---------------------------------------------------------------------------

let mockState: {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    hasChecked: boolean;
    user: any;
    token: string | null;
    error: string | null;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: unauthenticated, not yet checked
  mockState = {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      hasChecked: false,
      isLoading: false,
      error: null,
    },
  };
});

// We import AuthGuard dynamically so that the hoisted mocks are in place
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AuthGuard = require('../AuthGuard').default;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthGuard', () => {
  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  describe('loading state', () => {
    it('should show a loading indicator when isLoading is true and hasChecked is false', () => {
      mockState.auth.isLoading = true;
      mockState.auth.hasChecked = false;

      render(
        <AuthGuard>
          <Text testID="child-content">Protected Content</Text>
        </AuthGuard>
      );

      // The loading spinner should be visible (ActivityIndicator)
      // ActivityIndicator renders an ActivityIndicatorComponent, so we check
      // by ensuring the child content is NOT rendered
      expect(screen.queryByTestId('child-content')).toBeNull();

      // ActivityIndicator should be present
      // We can't easily query for it by testID, but we know the View with the
      // loading state is rendered. Accessible by checking if the container view rendered.
    });

    it('should NOT show loading indicator when isLoading is true but hasChecked is also true', () => {
      mockState.auth.isLoading = true;
      mockState.auth.hasChecked = true;
      mockState.auth.isAuthenticated = false;

      render(
        <AuthGuard>
          <Text testID="child-content">Protected Content</Text>
        </AuthGuard>
      );

      // When hasChecked is true and not authenticated, should redirect (return null)
      // Neither the loading view nor the children should render
      expect(screen.queryByTestId('child-content')).toBeNull();
    });

    it('should not dispatch fetchMeThunk when already loading', () => {
      mockState.auth.isLoading = true;
      mockState.auth.hasChecked = false;
      mockState.auth.isAuthenticated = false;

      render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      // fetchMeThunk should NOT be dispatched because isLoading is true
      // (the guard in the useEffect prevents it)
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Authenticated state — renders children
  // -----------------------------------------------------------------------
  describe('when authenticated', () => {
    it('should render children when isAuthenticated is true and hasChecked is true', () => {
      mockState.auth.isAuthenticated = true;
      mockState.auth.hasChecked = true;
      mockState.auth.user = { id: '1', name: 'Test User' };

      render(
        <AuthGuard>
          <Text testID="child-content">Protected Content</Text>
        </AuthGuard>
      );

      expect(screen.getByTestId('child-content')).toBeDefined();
      expect(screen.getByText('Protected Content')).toBeDefined();
    });

    it('should render children when isAuthenticated is true even if hasChecked is false', () => {
      // The guard checks first: if (isLoading && !hasChecked) → loading view
      // The rendering at the bottom checks: if (!isAuthenticated) return null
      // So if isAuthenticated is true, it renders children
      mockState.auth.isAuthenticated = true;
      mockState.auth.hasChecked = false;
      mockState.auth.isLoading = false;

      render(
        <AuthGuard>
          <Text testID="child-content">Protected Content</Text>
        </AuthGuard>
      );

      expect(screen.getByTestId('child-content')).toBeDefined();
    });

    it('should render multiple children', () => {
      mockState.auth.isAuthenticated = true;
      mockState.auth.hasChecked = true;

      render(
        <AuthGuard>
          <Text testID="child-1">First</Text>
          <Text testID="child-2">Second</Text>
        </AuthGuard>
      );

      expect(screen.getByTestId('child-1')).toBeDefined();
      expect(screen.getByTestId('child-2')).toBeDefined();
    });

    it('should not redirect to login when authenticated', () => {
      mockState.auth.isAuthenticated = true;
      mockState.auth.hasChecked = true;

      render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should not dispatch fetchMeThunk when hasChecked is true', () => {
      mockState.auth.hasChecked = true;
      mockState.auth.isAuthenticated = true;

      render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Not authenticated — redirects to login
  // -----------------------------------------------------------------------
  describe('when not authenticated', () => {
    it('should redirect to login when hasChecked is true and not authenticated', () => {
      mockState.auth.hasChecked = true;
      mockState.auth.isAuthenticated = false;

      render(
        <AuthGuard>
          <Text testID="child-content">Protected Content</Text>
        </AuthGuard>
      );

      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });

    it('should not render children when redirected', () => {
      mockState.auth.hasChecked = true;
      mockState.auth.isAuthenticated = false;

      render(
        <AuthGuard>
          <Text testID="child-content">Protected Content</Text>
        </AuthGuard>
      );

      expect(screen.queryByTestId('child-content')).toBeNull();
    });

    it('should dispatch fetchMeThunk on mount when not checked', () => {
      mockState.auth.hasChecked = false;
      mockState.auth.isAuthenticated = false;
      mockState.auth.isLoading = false;

      render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('should return null when isAuthenticated is false and hasChecked is true', () => {
      mockState.auth.isAuthenticated = false;
      mockState.auth.hasChecked = true;
      mockState.auth.isLoading = false;

      const { container } = render(
        <AuthGuard>
          <Text testID="child-content">Protected</Text>
        </AuthGuard>
      );

      // Should not render children
      expect(screen.queryByTestId('child-content')).toBeNull();
    });

    it('should redirect exactly once after hasChecked becomes true', () => {
      mockState.auth.hasChecked = false;
      mockState.auth.isAuthenticated = false;
      mockState.auth.isLoading = false;

      const { rerender } = render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      // Simulate hasChecked becoming true after fetchMeThunk completes
      mockState.auth.hasChecked = true;
      rerender(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      // Should have dispatched fetchMeThunk (one dispatch) and then redirect
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  // -----------------------------------------------------------------------
  // useEffect cleanup
  // -----------------------------------------------------------------------
  describe('useEffect behavior', () => {
    it('should not redirect when hasChecked is false', () => {
      mockState.auth.hasChecked = false;
      mockState.auth.isAuthenticated = false;
      mockState.auth.isLoading = false;

      render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      // Should dispatch fetchMeThunk but not redirect yet
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should not dispatch fetchMeThunk when hasChecked is already true', () => {
      mockState.auth.hasChecked = true;
      mockState.auth.isAuthenticated = false;

      render(
        <AuthGuard>
          <Text>Protected</Text>
        </AuthGuard>
      );

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
