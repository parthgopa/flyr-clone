import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import { theme } from "../../theme/theme";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { VideoView } from "expo-video";


const { width } = Dimensions.get("window");
const videoHeight = (width * 16) / 9; // 9:16 aspect ratio

export default function AdsResultScreen({ navigation, route }: any) {
  const { videoUri, prompt, category } = route.params;
  console.log(videoUri);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const handlePlayPause = (status: any) => {
    setIsPlaying(status.isPlaying);
  };

  useEffect(() => {
  const downloadVideo = async () => {
    const fileUri = FileSystem.documentDirectory + "generated.mp4";
    console.log("Downloading video to:", fileUri);
    const { uri } = await FileSystem.downloadAsync(videoUri, fileUri, {
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}` }, // if required
    });
    console.log("Downloaded video to:", uri);
    setLocalUri(uri);
  };
  downloadVideo();
}, [videoUri]);


  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log("Downloading video...");

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Cannot save video without permission");
        return;
      }

      // Download video
      const fileUri = FileSystem.documentDirectory + "flyr_ad.mp4";
      const downloadResult = await FileSystem.downloadAsync(videoUri, fileUri);

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync("Flyr Ads", asset, false);

      console.log("✓ Video downloaded successfully");
      Alert.alert("Success", "Video saved to gallery!");
    } catch (error: any) {
      console.error("Download failed:", error);
      Alert.alert("Download Failed", error.message || "Could not save video");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateAnother = () => {
    navigation.navigate("AdsHome");
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Your Ad" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.videoContainer}>
<Video
  source={{ uri: "file:///data/user/0/com.anonymous.flyrclone/files/generated.mp4" }}
  style={{ width: "100%", height: 300 }}
  useNativeControls
    // resizeMode="contain"
/>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.promptContainer}>
            <Ionicons name="text-outline" size={20} color={theme.colors.accent} />
            <AppText style={styles.promptLabel}>Prompt</AppText>
          </View>
          <AppText style={styles.promptText}>"{prompt}"</AppText>

          <View style={styles.categoryBadge}>
            <AppText style={styles.categoryText}>{category}</AppText>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownload}
            disabled={isDownloading}
            activeOpacity={0.7}
          >
            {isDownloading ? (
              <AppText style={styles.downloadButtonText}>Downloading...</AppText>
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color={theme.colors.background} />
                <AppText style={styles.downloadButtonText}>Download Video</AppText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={handleCreateAnother}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <AppText style={styles.createButtonText}>Create Another</AppText>
          </TouchableOpacity>
        </View>
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
    padding: theme.spacing.screenPadding,
  },
  videoContainer: {
    width: "100%",
    height: videoHeight,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promptContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  promptLabel: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
  },
  promptText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    fontStyle: "italic",
    marginBottom: theme.spacing.md,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${theme.colors.accent}15`,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionsSection: {
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
  },
  downloadButtonText: {
    ...theme.typography.button,
    color: theme.colors.background,
  },
  createButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  createButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});
