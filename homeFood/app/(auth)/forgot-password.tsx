import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import {
  requestPasswordReset,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "@/src/api/auth";
import { AuthShell, Input, PillButton } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

type Step = "email" | "otp" | "reset" | "done";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (cause: unknown, fallback: string) => {
  if (typeof cause === "object" && cause !== null && "message" in cause) {
    const message = (cause as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendCode = async (isResend = false) => {
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = isResend
        ? await resendOtp(trimmedEmail)
        : await requestPasswordReset(trimmedEmail);
      setExpiresInMinutes(result.expiresInMinutes);
      setCooldown(result.cooldownSeconds);
      if (!isResend) {
        setOtp("");
        setStep("otp");
      }
    } catch (cause) {
      setError(
        getErrorMessage(cause, "Unable to send a reset code right now.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (submitting) return;
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyOtp(email.trim(), otp);
      setResetToken(result.resetToken);
      setExpiresInMinutes(result.expiresInMinutes);
      setStep("reset");
    } catch (cause) {
      setError(getErrorMessage(cause, "Invalid or expired code."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (submitting) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(resetToken, password);
      setPassword("");
      setConfirmPassword("");
      setStep("done");
    } catch (cause) {
      setError(getErrorMessage(cause, "Unable to reset your password."));
    } finally {
      setSubmitting(false);
    }
  };

  const subtitle =
    step === "email"
      ? "Enter your email and we'll send you a verification code"
      : step === "otp"
        ? `Enter the 6-digit code sent to ${email.trim()}`
        : step === "reset"
          ? "Choose a new password for your account"
          : "Your password has been updated";

  return (
    <AuthShell
      title="Reset password"
      subtitle={subtitle}
      footer={
        step !== "done" ? (
          <View style={tw`flex-row items-center justify-center gap-1.5`}>
            <Text style={tw`text-sm text-textMuted`}>Remembered it?</Text>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              accessibilityRole="button"
            >
              <Text style={tw`text-sm font-semibold text-text underline`}>
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
    >
      {error ? (
        <View style={tw`mb-3 rounded-xl bg-red-bg px-3 py-2`}>
          <Text style={tw`text-center text-sm font-medium text-red-text`}>
            {error}
          </Text>
        </View>
      ) : null}

      {step === "email" ? (
        <View style={tw`gap-3`}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <PillButton
            title={submitting ? "Sending code..." : "Send code"}
            onPress={() => void sendCode()}
            loading={submitting}
            fullWidth
            style={tw`mt-2`}
          />
        </View>
      ) : null}

      {step === "otp" ? (
        <View style={tw`gap-4`}>
          <View>
            <Text style={tw`mb-2 text-center text-xs text-textMuted`}>
              The code expires in {expiresInMinutes} minutes.
            </Text>
            <OtpInput
              numberOfDigits={6}
              type="numeric"
              autoFocus
              onTextChange={(value) => {
                setOtp(value);
                setError(null);
              }}
              onFilled={(value) => setOtp(value)}
              focusColor={colors.primary}
              theme={{
                containerStyle: tw`justify-center gap-2`,
                pinCodeContainerStyle: tw`h-12 w-11 items-center justify-center rounded-xl border border-borderStrong bg-card`,
                focusedPinCodeContainerStyle: tw`border-primary`,
                pinCodeTextStyle: tw`text-lg font-semibold text-text`,
                focusStickStyle: tw`bg-primary`,
              }}
            />
          </View>

          <PillButton
            title={submitting ? "Verifying..." : "Verify code"}
            onPress={() => void handleVerify()}
            loading={submitting}
            fullWidth
          />

          <TouchableOpacity
            onPress={() => void sendCode(true)}
            disabled={submitting || cooldown > 0}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting || cooldown > 0 }}
            style={tw`items-center`}
          >
            <Text
              style={[
                tw`text-sm font-semibold underline`,
                submitting || cooldown > 0
                  ? tw`text-textFaint`
                  : tw`text-text`,
              ]}
            >
              {cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend code"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setStep("email");
              setOtp("");
              setError(null);
            }}
            accessibilityRole="button"
            style={tw`items-center`}
          >
            <Text style={tw`text-xs text-textMuted`}>
              Use a different email
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {step === "reset" ? (
        <View style={tw`gap-3`}>
          <Input
            label="New password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError(null);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="newPassword"
            rightAccessory={
              <TouchableOpacity
                onPress={() => setShowPassword((value) => !value)}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Text style={tw`ml-2 text-sm font-semibold text-primary`}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            }
          />
          <Input
            label="Confirm new password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setError(null);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <PillButton
            title={submitting ? "Updating password..." : "Update password"}
            onPress={() => void handleReset()}
            loading={submitting}
            fullWidth
            style={tw`mt-2`}
          />
        </View>
      ) : null}

      {step === "done" ? (
        <View style={tw`gap-4`}>
          <Text style={tw`text-center text-sm leading-6 text-textMuted`}>
            You can now log in with your new password.
          </Text>
          <PillButton
            title="Back to login"
            onPress={() => router.replace("/(auth)/login")}
            fullWidth
          />
        </View>
      ) : null}
    </AuthShell>
  );
};

export default ForgotPassword;
