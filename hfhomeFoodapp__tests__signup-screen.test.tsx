import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "expo-router";

const mockDispatch = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockApiPost = vi.fn();

vi.mock("expo-router", () => ({
  router: {
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  },
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => ({
    auth: { isLoading: false, error: null, isAuthenticated: false },
  }),
}));

vi.mock("@/src/lib/tailwind", () => ({
  default: (..._args: any[]) => ({}),
}));

vi.mock("@/src/api/clients", () => ({
  api: {
    post: mockApiPost,
    get: vi.fn(),
  },
}));

vi.mock("@/src/store", () => ({
  __esModule: true,
  store: {},
}));

vi.mock("@/src/store/authSlice", () => ({
  clearError: () => ({ type: "auth/clearError" }),
  registerThunk: (payload: any) => ({ type: "auth/registerThunk", payload }),
}));

vi.mock("@/src/components/ui", () => {
  const React = require("react");
  const { View, Text, TextInput, TouchableOpacity } = require("react-native");

  const Input = ({ label, error, hint, rightAccessory, ...props }: any) => (
    <View>
      <Text>{label}</Text>
      <TextInput {...props} />
      {hint ? <Text>{hint}</Text> : null}
      {error ? <Text>{error}</Text> : null}
      {rightAccessory}
    </View>
  );

  const PillButton = ({ title, onPress, loading, disabled, ...props }: any) => (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} {...props}>
      <Text>{loading ? "Wait..." : title}</Text>
    </TouchableOpacity>
  );

  const AuthShell = ({ title, subtitle, footer, children }: any) => (
    <View>
      <Text>{title}</Text>
      {subtitle ? <Text>{subtitle}</Text> : null}
      {children}
      {footer}
    </View>
  );

  return { Input, PillButton, AuthShell };
});

const Signup = require("../(auth)/Signup").default;

describe("Signup screen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiPost.mockResolvedValue({ data: { available: true } });
  });

  it("renders the role selector and consent copy", () => {
    render(<Signup />);

    expect(screen.getByText("Buyer")).toBeTruthy();
    expect(screen.getByText("Seller")).toBeTruthy();
    expect(screen.getByText(/??????? ????????|????????? ????????/)).toBeTruthy();
  });

  it("updates the consent label when the role changes", () => {
    render(<Signup />);

    fireEvent.press(screen.getByText("Seller"));

    expect(screen.getByText("????????? ????????")).toBeTruthy();
  });

  it("submits a valid registration payload with consent", () => {
    render(<Signup />);

    fireEvent.changeText(screen.getByPlaceholderText("Your full name"), "Jane Doe");
    fireEvent.changeText(screen.getByPlaceholderText("Choose a username"), "jane_doe");
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "jane@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("At least 6 characters"), "secret123");
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 01XXXXXXXXX"), "01712345678");
    fireEvent.changeText(screen.getByPlaceholderText("10 to 17 digits"), "1234567890");
    fireEvent.changeText(screen.getByPlaceholderText("Your present address"), "Dhaka");
    fireEvent.press(screen.getByRole("checkbox"));
    fireEvent.press(screen.getByText("Register"));

    expect(mockDispatch).toHaveBeenCalled();
    const action = mockDispatch.mock.calls.at(-1)[0];
    expect(action.type).toBe("auth/registerThunk");
    expect(action.payload).toMatchObject({
      role: "buyer",
      acceptedTerms: true,
      termsVersion: "1.0",
    });
  });

  it("opens the buyer terms page when the link is pressed", () => {
    render(<Signup />);

    fireEvent.press(screen.getByText("??????? ????????"));

    expect(router.push).toHaveBeenCalledWith("/(stack)/marketing/terms/buyer");
  });
});
