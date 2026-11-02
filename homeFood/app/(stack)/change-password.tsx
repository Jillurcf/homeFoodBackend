import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { changePassword } from "@/src/api/auth";
import { MarketingShell } from "@/src/components/marketing/MarketingShell";
import { Input, PillButton } from "@/src/components/ui";
import { useAppSelector } from "@/src/store/hooks";
import tw from "@/src/lib/tailwind";

const getErrorMessage = (cause: unknown, fallback: string) => {
  if (typeof cause === "object" && cause !== null && "message" in cause) {
    const message = (cause as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
};

export default function ChangePasswordScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting || !token) return;

    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePassword(
        token,
        currentPassword,
        newPassword
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(result.message || "Your password has been updated.");
    } catch (cause) {
      setError(
        getErrorMessage(cause, "Unable to update your password.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketingShell
      title="Change password"
      subtitle="Update the password you use to log in to HomeFood."
    >
      {!isAuthenticated || !token ? (
        <View style={tw`rounded-2xl border border-border bg-card p-6`}>
          <Text style={tw`text-center text-sm text-textMuted`}>
            Please log in to change your password.
          </Text>
          <PillButton
            title="Log in"
            onPress={() => router.replace("/(auth)/login")}
            fullWidth
            style={tw`mt-4`}
          />
        </View>
      ) : (
        <View
          style={tw`rounded-2xl border border-border bg-card p-6 shadow-sm`}
        >
          {error ? (
            <View style={tw`mb-3 rounded-xl bg-red-bg px-3 py-2`}>
              <Text style={tw`text-center text-sm font-medium text-red-text`}>
                {error}
              </Text>
            </View>
          ) : null}
          {success ? (
            <View style={tw`mb-3 rounded-xl bg-emerald-bg px-3 py-2`}>
              <Text style={tw`text-center text-sm font-medium text-emerald-text`}>
                {success}
              </Text>
            </View>
          ) : null}

          <View style={tw`gap-3`}>
            <Input
              label="Current password"
              placeholder="Your current password"
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                setError(null);
              }}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              textContentType="password"
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowPasswords((value) => !value)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPasswords ? "Hide passwords" : "Show passwords"
                  }
                >
                  <Text style={tw`ml-2 text-sm font-semibold text-primary`}>
                    {showPasswords ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              }
            />
            <Input
              label="New password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setError(null);
              }}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              textContentType="newPassword"
            />
            <Input
              label="Confirm new password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setError(null);
              }}
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              textContentType="newPassword"
            />
          </View>

          <PillButton
            title={submitting ? "Updating..." : "Update password"}
            onPress={() => void handleSubmit()}
            loading={submitting}
            fullWidth
            style={tw`mt-5`}
          />
        </View>
      )}
    </MarketingShell>
  );
}
