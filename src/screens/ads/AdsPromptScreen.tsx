import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import { theme } from "../../theme/theme";
import { refinePrompt } from "../../services/videoApi";

export default function AdsPromptScreen({ navigation, route }: any) {
  const { category } = route.params;
  const [prompt, setPrompt] = useState("");
  const [refinedPrompt, setRefinedPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [showRefined, setShowRefined] = useState(false);

  const handleRefinePrompt = async () => {
    if (!prompt.trim()) {
      Alert.alert("Empty Prompt", "Please enter a prompt first");
      return;
    }

    try {
      setIsRefining(true);
      console.log("Refining prompt for category:", category.id);

      const response = await refinePrompt(prompt, category.id);

      if (response.success) {
        setRefinedPrompt(response.refined_prompt);
        setShowRefined(true);
        console.log("✓ Prompt refined successfully");
      }
    } catch (error: any) {
      console.error("Prompt refinement failed:", error);
      Alert.alert("Refinement Failed", error.message || "Could not refine prompt");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateAd = () => {
    const finalPrompt = showRefined ? refinedPrompt : prompt;

    if (!finalPrompt.trim()) {
      Alert.alert("Empty Prompt", "Please enter a prompt first");
      return;
    }

    console.log("Generating ad with prompt:", finalPrompt);
    navigation.navigate("AdsGeneration", {
      prompt: finalPrompt,
      category: category.id,
    });
  };

  const handleUseRefined = () => {
    setPrompt(refinedPrompt);
    setShowRefined(false);
  };

  const renderExample = (example: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.exampleChip}
      onPress={() => setPrompt(example)}
      activeOpacity={0.7}
    >
      <Ionicons name="bulb-outline" size={14} color={theme.colors.accent} />
      <AppText style={styles.exampleText}>{example}</AppText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title={`${category.title} Ad`} onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Describe Your Ad</AppText>
          <AppText style={styles.sectionSubtitle}>
            Tell us what kind of video advertisement you want to create
          </AppText>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E.g., A luxury watch rotating on a velvet cushion with golden lighting..."
              placeholderTextColor={theme.colors.secondary}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.refineButton, isRefining && styles.refineButtonDisabled]}
            onPress={handleRefinePrompt}
            disabled={isRefining}
            activeOpacity={0.7}
          >
            {isRefining ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={theme.colors.background} />
                <AppText style={styles.refineButtonText}>Refine with AI</AppText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {showRefined && (
          <View style={styles.refinedSection}>
            <View style={styles.refinedHeader}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <AppText style={styles.refinedTitle}>AI Refined Prompt</AppText>
            </View>
            <View style={styles.refinedBox}>
              <AppText style={styles.refinedText}>{refinedPrompt}</AppText>
            </View>
            <TouchableOpacity
              style={styles.useRefinedButton}
              onPress={handleUseRefined}
              activeOpacity={0.7}
            >
              <AppText style={styles.useRefinedText}>Use This Prompt</AppText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Example Prompts</AppText>
          <View style={styles.examplesContainer}>
            {category.examples.map(renderExample)}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateAd}
          activeOpacity={0.8}
        >
          <Ionicons name="videocam" size={20} color={theme.colors.background} />
          <AppText style={styles.generateButtonText}>Generate Ad</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.screenPadding,
    paddingBottom: 100,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.black,
    padding: theme.spacing.md,
    minHeight: 120,
  },
  refineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  refineButtonDisabled: {
    opacity: 0.6,
  },
  refineButtonText: {
    ...theme.typography.button,
    color: theme.colors.background,
  },
  refinedSection: {
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30`,
  },
  refinedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  refinedTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.success,
  },
  refinedBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  refinedText: {
    ...theme.typography.body,
    color: theme.colors.black,
    lineHeight: 22,
  },
  useRefinedButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  useRefinedText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: "600",
  },
  examplesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  exampleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  exampleText: {
    ...theme.typography.caption,
    color: theme.colors.black,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.screenPadding,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  generateButtonText: {
    ...theme.typography.button,
    color: theme.colors.background,
    fontSize: 16,
  },
});
