import { View, FlatList, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import { useState } from "react";
import { Asset } from "expo-asset";
import { Ionicons } from '@expo/vector-icons';
import AppText from "./ui/AppText";
import AppButton from "./ui/AppButton";
import AppCard from "./ui/AppCard";
import { downloadImage } from "../utils/downloadImage";
import { theme } from "../theme/theme";

interface Thumbnail {
  label: string;
  image?: ImageSourcePropType;
  image_url?: string;
}

interface Props {
  title: string;
  thumbnails: Thumbnail[];
  onPress: () => void;
}

export default function CatalogueCard({
  title,
  thumbnails,
  onPress,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentThumbnail = thumbnails[activeIndex];

  /** Resolve image source: prefer image_url (string from DB), fallback to image (require) */
  const resolveSource = (t: Thumbnail) => {
    if (t.image_url) return { uri: t.image_url };
    if (typeof t.image === "string") return { uri: t.image };
    return t.image as ImageSourcePropType;
  };

  const currentSource = resolveSource(currentThumbnail);

  const handleDownload = async () => {
    try {
      if (currentThumbnail.image_url || typeof currentThumbnail.image === "string") {
        const url = (currentThumbnail.image_url || currentThumbnail.image) as string;
        await downloadImage(url, `${title}_${currentThumbnail.label}.jpg`);
      } else {
        const [asset] = await Asset.loadAsync(currentThumbnail.image as number);
        if (asset.localUri || asset.uri) {
          await downloadImage(asset.localUri || asset.uri, `${title}_${currentThumbnail.label}.jpg`);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleThumbnailPress = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <AppCard>
      <View style={styles.imageWrapper}>
        <Image source={currentSource} style={styles.image} />

        {/* Thumbnail Label Badge - Top Left */}
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{currentThumbnail.label}</AppText>
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
          onPress={() => setActiveIndex((prev) => prev === 0 ? thumbnails.length - 1 : prev - 1)}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.background} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navRight]}
          onPress={() => setActiveIndex((prev) => (prev + 1) % thumbnails.length)}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Thumbnail Strip */}
      <View style={styles.thumbnailStrip}>
        <FlatList
          data={thumbnails}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.thumbnail,
                index === activeIndex && styles.thumbnailActive,
              ]}
              onPress={() => handleThumbnailPress(index)}
            >
              <Image source={resolveSource(item)} style={styles.thumbnailImage} />
              {index === activeIndex && (
                <View style={styles.thumbnailBorder} />
              )}
            </TouchableOpacity>
          )}
        />
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
    height: 220,
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
  thumbnailStrip: {
    marginBottom: theme.spacing.md,
  },
  thumbnailList: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: "relative",
  },
  thumbnailActive: {
    borderColor: theme.colors.accent,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.radius.sm - 2,
    borderColor: theme.colors.accent,
  },
});
