import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { clearError, registerThunk } from "@/src/store/authSlice";
import { api } from "@/src/api/clients";
import { AuthShell, Input, PillButton } from "@/src/components/ui";
import {
  buildSignupPayload,
  getTermsRoute,
  USERNAME_REGEX,
  type RegisterRole,
  validateSignupFields,
} from "@/src/lib/signup";
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

const roleOptions: { value: RegisterRole; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
];

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
  const [role, setRole] = useState<RegisterRole>("buyer");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(role === "seller" ? "/(stack)/seller/onboarding" : "/(tabs)");
    }
  }, [isAuthenticated, role]);

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

  const validate = (): FieldErrors =>
    validateSignupFields({
      name,
      username,
      email,
      password,
      mobile,
      nidNumber,
      address,
    }) as FieldErrors;

  const handleSignup = () => {
    if (isLoading) return;

    if (!acceptedTerms) {
      setConsentError("অ্যাকাউন্ট তৈরি করতে শর্তাবলিতে সম্মতি দিন।");
      return;
    }

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
    setConsentError("");
    dispatch(
      registerThunk(
        buildSignupPayload(
          {
            name,
            username,
            email,
            password,
            mobile,
            nidNumber,
            address,
          },
          role,
          true,
        )
      )
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

  const openTerms = () => {
    router.push(getTermsRoute(role));
  };

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
        <View accessibilityRole="radiogroup" style={tw`mb-1`}>
          <Text style={tw`mb-2 text-sm font-medium text-text`}>আমি কীভাবে নিবন্ধন করব?</Text>
          <View style={tw`flex-row gap-2`}>
            {roleOptions.map((option) => {
              const selected = role === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setRole(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    tw`flex-1 rounded-xl border px-3 py-2.5`,
                    selected ? tw`border-primary bg-primary/10` : tw`border-borderStrong bg-card`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-center text-sm font-semibold`,
                      selected ? tw`text-primary` : tw`text-textMuted`,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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

        <View style={tw`pt-1`}>
          <TouchableOpacity
            onPress={() => {
              const nextValue = !acceptedTerms;
              setAcceptedTerms(nextValue);
              if (nextValue) setConsentError("");
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ selected: acceptedTerms }}
            style={tw`flex-row items-start gap-3`}
          >
            <View
              style={[
                tw`mt-0.5 h-5 w-5 items-center justify-center rounded border`,
                acceptedTerms ? tw`border-primary bg-primary` : tw`border-borderStrong bg-card`,
              ]}
            >
              {acceptedTerms ? <Text style={tw`text-xs font-bold text-white`}>✓</Text> : null}
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm leading-5 text-text`}>
                আমি{` `}
                <Text onPress={openTerms} style={tw`font-semibold text-primary underline`}>
                  {role === "buyer" ? "ক্রেতার শর্তাবলি" : "বিক্রেতার শর্তাবলি"}
                </Text>
                {` `}পড়ে সম্মতি দিয়েছি।
              </Text>
            </View>
          </TouchableOpacity>
          {consentError ? (
            <Text style={tw`mt-1 ml-8 text-xs text-red-text`}>{consentError}</Text>
          ) : null}
        </View>
      </View>

      <PillButton
        title="Register"
        onPress={handleSignup}
        loading={isLoading}
        disabled={!allFilled || !acceptedTerms}
        fullWidth
        style={tw`mt-5`}
      />
    </AuthShell>
  );
};

export default Signup;
