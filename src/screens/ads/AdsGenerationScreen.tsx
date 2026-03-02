import { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import { theme } from "../../theme/theme";
import { generateVideo } from "../../services/videoApi";

export default function AdsGenerationScreen({ navigation, route }: any) {
  const { prompt, category } = route.params;
  const [status, setStatus] = useState("generating");
  const [progress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    startGeneration();
    startPulseAnimation();
  }, []);

  const startGeneration = async () => {
    try {
      console.log("Starting video generation (this will take 30-60 seconds)...");
      setStatus("generating");
      animateProgress(0.3);

      // This is a blocking call that waits for video completion
      const response = await generateVideo(prompt, category);

      if (response.success) {
        console.log("✓ Video generation completed!");
        setStatus("completed");
        animateProgress(1);

        setTimeout(() => {
          navigation.replace("AdsResult", {
            videoUri: response.video_uri,
            prompt: response.prompt,
            category: response.category,
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error("Video generation failed:", error);
      setStatus("error");
    }
  };

  const animateProgress = (toValue: number) => {
    Animated.timing(progress, {
      toValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getStatusMessage = () => {
    switch (status) {
      case "starting":
      case "initializing":
        return "Initializing AI...";
      case "generating":
        return "Creating your video ad...";
      case "completed":
        return "Video ready!";
      case "error":
        return "Generation failed";
      default:
        return "Processing...";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      default:
        return "videocam";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      default:
        return theme.colors.accent;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: `${getStatusColor()}20`,
            },
          ]}
        >
          <Ionicons name={getStatusIcon() as any} size={64} color={getStatusColor()} />
        </Animated.View>

        <AppText style={styles.statusText}>{getStatusMessage()}</AppText>

        <AppText style={styles.promptText}>"{prompt}"</AppText>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {status === "generating" && (
          <View style={styles.loadingInfo}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <AppText style={styles.loadingText}>
              This may take 30-60 seconds...
            </AppText>
          </View>
        )}

        {status === "error" && (
          <View style={styles.errorContainer}>
            <AppText style={styles.errorText}>
              Something went wrong. Please try again.
            </AppText>
          </View>
        )}
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
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.screenPadding,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  promptText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    fontStyle: "italic",
  },
  progressContainer: {
    width: "100%",
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
  },
  loadingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.error}15`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.error}30`,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: "center",
  },
});
