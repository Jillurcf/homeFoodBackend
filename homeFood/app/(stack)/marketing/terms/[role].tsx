import { useLocalSearchParams } from "expo-router";
import React from "react";
import { TermsScreen } from "@/src/components/marketing/TermsScreen";
import { TERMS_DOCUMENTS } from "@/src/content/terms";

export default function TermsRoute() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const document =
    role === "seller" ? TERMS_DOCUMENTS.seller : TERMS_DOCUMENTS.buyer;

  return <TermsScreen document={document} />;
}
