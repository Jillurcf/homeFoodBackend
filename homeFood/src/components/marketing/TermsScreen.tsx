import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MarketingShell } from "@/src/components/marketing/MarketingShell";
import { colors } from "@/src/constants/theme";
import type { TermsBlock, TermsDocument } from "@/src/content/terms";
import tw from "@/src/lib/tailwind";

function Block({ block }: { block: TermsBlock }) {
  if (block.type === "paragraph") {
    return (
      <Text style={tw`font-bengali text-sm leading-7 text-textMuted`}>
        {block.text}
      </Text>
    );
  }

  if (block.type === "subheading") {
    return (
      <Text style={tw`font-bengali text-base font-semibold text-text`}>
        {block.text}
      </Text>
    );
  }

  if (block.type === "note") {
    return (
      <View style={tw`rounded-xl border border-primary/20 bg-primary/5 px-4 py-3`}>
        <Text style={tw`font-bengali text-sm leading-7 text-textMuted`}>
          {block.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={tw`gap-2`}>
      {block.items.map((item) => (
        <View key={item} style={tw`flex-row items-start gap-2.5`}>
          <View style={tw`mt-2 h-1.5 w-1.5 rounded-full bg-primary`} />
          <Text style={tw`flex-1 font-bengali text-sm leading-7 text-textMuted`}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function TermsScreen({ document }: { document: TermsDocument }) {
  return (
    <MarketingShell
      bengaliOverline={
        document.role === "buyer" ? "ক্রেতার শর্তাবলি" : "বিক্রেতার শর্তাবলি"
      }
      bengaliTitle
      title={document.title}
    >
      <View style={tw`rounded-2xl border border-border bg-card p-5 shadow-sm`}>
        <View style={tw`flex-row items-center gap-2.5`}>
          <View
            style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`font-bengali text-xs font-semibold text-textMuted`}>
              কার্যকর হওয়ার তারিখ
            </Text>
            <Text style={tw`mt-0.5 font-bengali text-sm font-semibold text-text`}>
              {document.effectiveDate}
            </Text>
          </View>
        </View>

        <View style={tw`mt-4 flex-row items-center gap-2.5`}>
          <View
            style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
          >
            <Ionicons name="globe-outline" size={18} color={colors.primary} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`font-bengali text-xs font-semibold text-textMuted`}>
              ওয়েবসাইট
            </Text>
            <Text style={tw`mt-0.5 font-bengali text-sm font-semibold text-text`}>
              {document.website}
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`gap-3`}>
        {document.intro.map((paragraph) => (
          <Text
            key={paragraph}
            style={tw`font-bengali text-sm leading-7 text-textMuted`}
          >
            {paragraph}
          </Text>
        ))}
      </View>

      <View style={tw`gap-4`}>
        {document.sections.map((section) => (
          <View
            key={section.id}
            style={tw`rounded-2xl border border-border bg-card p-5 shadow-sm`}
          >
            <Text style={tw`font-bengali text-lg font-semibold text-text`}>
              {section.title}
            </Text>
            <View style={tw`mt-3 gap-3`}>
              {section.blocks.map((block, index) => (
                <Block key={`${section.id}-${index}`} block={block} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </MarketingShell>
  );
}
