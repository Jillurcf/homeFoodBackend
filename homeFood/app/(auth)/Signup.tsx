import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { clearError, registerThunk } from "@/src/store/authSlice";
import { api } from "@/src/api/clients";
import { AuthShell, Input, PillButton } from "@/src/components/ui";
import tw from "@/src/lib/tailwind";

type FieldName =
  | "name"
  | "username"
  | "email"
  | "password"
  | "mobile"
  | "nidNumber"
  | "address";

type FieldErrors = Partial<Record<FieldName, string>>;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const MOBILE_REGEX = /^\d{6,15}$/;
const NID_REGEX = /^\d{10,17}$/;

const Signup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    const value = username.trim();
    if (!value || !USERNAME_REGEX.test(value)) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const handle = setTimeout(async () => {
      try {
        const json = await api.post<{ success: boolean; data: { available: boolean } }>(
          "/auth/check-username",
          { username: value }
        );
        setUsernameStatus(json.data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("error");
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [username]);

  const updateField = (field: FieldName, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Please enter your full name.";
    }
    if (!username.trim()) {
      next.username = "Please enter a username.";
    } else if (!USERNAME_REGEX.test(username.trim())) {
      next.username = "Username can only contain letters, numbers and underscores.";
    }
    if (!email.trim()) {
      next.email = "Please enter your email.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (password.length < 6) {
      next.password = "Password must be at least 6 characters long.";
    }
    if (!MOBILE_REGEX.test(mobile.trim())) {
      next.mobile = "Please enter a valid mobile number.";
    }
    if (!NID_REGEX.test(nidNumber.trim())) {
      next.nidNumber = "Please enter a valid NID number (10 to 17 digits).";
    }
    if (!address.trim()) {
      next.address = "Please enter your present address.";
    }

    return next;
  };

  const handleSignup = () => {
    if (isLoading) return;

    if (usernameStatus === "taken") {
      setErrors((prev) => ({
        ...prev,
        username: "Username already exists. Please choose another.",
      }));
      return;
    }

    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    dispatch(
      registerThunk({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: mobile.trim() || undefined,
        nidNumber: nidNumber.trim(),
        address: address.trim(),
      })
    );
  };

  const usernameError =
    errors.username ||
    (usernameStatus === "taken"
      ? "Username already exists. Please choose another."
      : undefined);

  const usernameHint =
    usernameStatus === "checking"
      ? "Checking username..."
      : usernameStatus === "available"
        ? "Username is available."
        : usernameStatus === "error"
          ? "Error checking username."
          : undefined;

  const allFilled =
    name.trim() !== "" &&
    username.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    mobile.trim() !== "" &&
    nidNumber.trim() !== "" &&
    address.trim() !== "";

  return (
    <AuthShell
      title="Register"
      subtitle="Join the HomeFood community"
      footer={
        <View style={tw`flex-row items-center justify-center gap-1.5`}>
          <Text style={tw`text-sm text-textMuted`}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            accessibilityRole="button"
          >
            <Text style={tw`text-sm font-semibold text-text underline`}>Login</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {error ? (
        <View style={tw`mb-3 rounded-xl bg-red-bg px-3 py-2`}>
          <Text style={tw`text-center text-sm font-medium text-red-text`}>{error}</Text>
        </View>
      ) : null}

      <View style={tw`gap-3`}>
        <Input
          label="Full Name"
          placeholder="Your full name"
          value={name}
          onChangeText={updateField("name", setName)}
          autoComplete="name"
          textContentType="name"
          error={errors.name}
        />

        <Input
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={updateField("username", setUsername)}
          autoCapitalize="none"
          autoCorrect={false}
          error={usernameError}
          hint={usernameHint}
        />

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={updateField("email", setEmail)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={updateField("password", setPassword)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          textContentType="password"
          rightAccessory={
            <TouchableOpacity
              onPress={() => setShowPassword((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Text style={tw`ml-2 text-sm font-semibold text-primary`}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          }
          error={errors.password}
        />

        <Input
          label="Mobile Number"
          placeholder="e.g. 01XXXXXXXXX"
          value={mobile}
          onChangeText={updateField("mobile", setMobile)}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          error={errors.mobile}
        />

        <Input
          label="NID Number"
          placeholder="10 to 17 digits"
          value={nidNumber}
          onChangeText={updateField("nidNumber", setNidNumber)}
          keyboardType="number-pad"
          error={errors.nidNumber}
        />

        <Input
          label="Present Address"
          placeholder="Your present address"
          value={address}
          onChangeText={updateField("address", setAddress)}
          multiline
          numberOfLines={3}
          style={tw`min-h-16`}
          textAlignVertical="top"
          error={errors.address}
        />
      </View>

      <PillButton
        title="Register"
        onPress={handleSignup}
        loading={isLoading}
        disabled={!allFilled}
        fullWidth
        style={tw`mt-5`}
      />
    </AuthShell>
  );
};

export default Signup;
