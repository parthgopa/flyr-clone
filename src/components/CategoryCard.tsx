import { View, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Asset } from "expo-asset";
import { Ionicons } from '@expo/vector-icons';
import AppText from "./ui/AppText";
import AppButton from "./ui/AppButton";
import AppCard from "./ui/AppCard";
import { downloadImage } from "../utils/downloadImage";
import { theme } from "../theme/theme";
import { Icon } from "react-native-vector-icons/Icon";

interface Props {
  title: string;
  before: ImageSourcePropType | string;
  after: ImageSourcePropType | string;
  onPress: () => void;
}

export default function CategoryCard({
  title,
  before,
  after,
  onPress,
}: Props) {
  const [showBefore, setShowBefore] = useState(true);
  const currentRaw = showBefore ? before : after;
  const currentImage = typeof currentRaw === "string" ? { uri: currentRaw } : currentRaw;
  const currentLabel = showBefore ? "Before" : "After";

  const handleDownload = async () => {
    try {
      if (typeof currentRaw === "string") {
        await downloadImage(currentRaw, `${title}_${currentLabel}.jpg`);
      } else {
        const [asset] = await Asset.loadAsync(currentRaw as number);
        if (asset.localUri || asset.uri) {
          await downloadImage(asset.localUri || asset.uri, `${title}_${currentLabel}.jpg`);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const toggleImage = () => {
    setShowBefore(!showBefore);
  };

  return (
    <AppCard>
      <View style={styles.imageWrapper}>
        <Image source={currentImage} style={styles.image} />

        {/* Before/After Badge - Top Left */}
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{currentLabel}</AppText>
        </View>

        {/* Download Button - Top Right */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={20} color={theme.colors.background} />
        </TouchableOpacity>

        {/* Navigation Arrows */}
        <TouchableOpacity
          style={[styles.navButton, styles.navLeft]}
          onPress={toggleImage}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.background} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navRight]}
          onPress={toggleImage}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      <AppButton title="Try It Out" onPress={onPress} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: "relative",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceElevated,
  },
  badge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontWeight: "700",
  },
  downloadButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.medium,
  },
  downloadIcon: {
    fontSize: 18,
    color: theme.colors.background,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  navLeft: {
    left: theme.spacing.sm,
  },
  navRight: {
    right: theme.spacing.sm,
  },
  navIcon: {
    fontSize: 28,
    color: theme.colors.background,
    fontWeight: "bold",
  },
});