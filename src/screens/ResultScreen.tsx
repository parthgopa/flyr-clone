import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ImageViewer from 'react-native-image-zoom-viewer';
import { Ionicons } from '@expo/vector-icons';
import AppText from "../components/ui/AppText";
import { backendURL } from "../services/api";
import AppButton from "../components/ui/AppButton";
import AppHeader from "../components/ui/AppHeader";
import { pollJobStatus } from "../services/api";
import { downloadImage } from "../utils/downloadImage";

import { theme } from "../theme/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = Math.min(SCREEN_WIDTH * 1.05, SCREEN_HEIGHT * 0.55);
const POLL_INTERVAL = 4000;

// Helper function to prepend backend URL to image URLs
const getFullImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith("http")) {
    return imageUrl; // Already a full URL
  }
  return `${backendURL}/${imageUrl}`;
};

interface Scenario {
  id: string;
  label: string;
}

interface GeneratedImage {
  scenarioId: string;
  label: string;
  imageUrl: string;
}

export default function ResultScreen({ route, navigation }: any) {
  const { jobId, totalImages, scenarios, subcategoryType, productImage } = route.params as {
    jobId: string;
    totalImages: number;
    scenarios: Scenario[];
    subcategoryType?: string;
    productImage?: string; // local URI to original product
  };

  const isCatalogue = subcategoryType === "catalogue";
  const isPhotoshoot = subcategoryType === "photoshoot";
  const isBranding = subcategoryType === "branding";
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Pulse animation for skeleton cards
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Polling logic
  useEffect(() => {
    if (isDone) return;

    const interval = setInterval(async () => {
      try {
        const data = await pollJobStatus(jobId);

        if (data.images.length > images.length) {
          setImages(data.images);
        }
        setCurrentScenario(data.currentScenario);

        if (data.status === "done") {
          setIsDone(true);
          setImages(data.images);
          clearInterval(interval);
        }
      } catch (err) {
        console.log("Poll error:", err);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [jobId, isDone, images.length]);

  // Prepend original product image for comparison
  const allImages: GeneratedImage[] = useMemo(() => {
    const original: GeneratedImage[] = productImage
      ? [{ scenarioId: "__original__", label: "Original Product", imageUrl: productImage }]
      : [];
    return [...original, ...images];
  }, [images, productImage]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index >= 0 && index < allImages.length) {
        setActiveIndex(index);
      }
    },
    [allImages.length]
  );

  const completedCount = allImages.length;
  const progress = totalImages > 0 ? images.length / totalImages : 0;

  // Auto-scroll to first generated image when it arrives
  useEffect(() => {
    if (images.length === 1) {
      const firstGeneratedIndex = productImage ? 1 : 0;
      setActiveIndex(firstGeneratedIndex);
    }
  }, [images.length, productImage]);

  return (
    <View style={styles.screen}>
      <AppHeader title="Results" onBack={() => navigation.goBack()} />

      {/* Progress section */}
      <View style={styles.statusBar}>
        {!isDone ? (
          <>
            <View style={styles.progressRow}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
              <AppText style={styles.statusText}>
                Generating images{currentScenario ? ` — ${currentScenario}` : "..."}
              </AppText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </>
        ) : (
          <View style={styles.progressRow}>
            <AppText style={styles.doneText}>
              ✓ All images generated
            </AppText>
          </View>
        )}
      </View>

      {/* Main Image Display */}
      {allImages.length > 0 && (
        <View style={styles.mainImageContainer}>
          <View style={styles.mainImageCard}>
            {allImages[activeIndex]?.scenarioId === "__original__" && (
              <View style={styles.originalBanner}>
                <Ionicons name="image-outline" size={14} color={theme.colors.white} />
                <AppText style={styles.originalBannerText}>Original Product</AppText>
              </View>
            )}
            <Image
              source={{
                uri: allImages[activeIndex]?.scenarioId === "__original__"
                  ? allImages[activeIndex].imageUrl
                  : getFullImageUrl(allImages[activeIndex]?.imageUrl || "")
              }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => {
                setZoomImageIndex(activeIndex);
                setZoomVisible(true);
              }}
            >
              <Ionicons name="expand-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.mainImageFooter}>
            <AppText style={styles.mainImageLabel}>
              {allImages[activeIndex]?.label}
            </AppText>
            {allImages[activeIndex]?.scenarioId !== "__original__" && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => {
                  const img = allImages[activeIndex];
                  const uri = getFullImageUrl(img.imageUrl);
                  downloadImage(uri, `${img.label.replace(/\s+/g, '_')}.jpg`);
                }}
              >
                <Ionicons name="download-outline" size={16} color={theme.colors.background} />
                <AppText style={styles.downloadText}>Download</AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Thumbnail Strip with Loading States */}
      <View style={styles.thumbnailSection}>
        <FlatList
          ref={flatListRef}
          data={[
            ...(productImage ? [{ scenarioId: "__original__", label: "Original Product", imageUrl: productImage }] : []),
            ...Array.from({ length: totalImages }).map((_, idx) => {
              const img = images[idx];
              return img || { scenarioId: `loading-${idx}`, label: `Image ${idx + 1}`, imageUrl: "", loading: true };
            })
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, idx) => `${item.scenarioId}-${idx}`}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item, index }) => {
            const isOriginal = item.scenarioId === "__original__";
            const isLoading = (item as any).loading;
            const isActive = index === activeIndex;

            return (
              <TouchableOpacity
                style={[
                  styles.thumbnail,
                  isActive && styles.thumbnailActive,
                  isOriginal && styles.thumbnailOriginal,
                ]}
                onPress={() => !isLoading && setActiveIndex(index)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.thumbnailLoading}>
                    <ActivityIndicator size="small" color={theme.colors.accent} />
                  </View>
                ) : (
                  <>
                    <Image
                      source={{
                        uri: isOriginal ? item.imageUrl : getFullImageUrl(item.imageUrl)
                      }}
                      style={styles.thumbnailImage}
                    />
                    {isOriginal && (
                      <View style={styles.thumbnailOriginalBadge}>
                        <AppText style={styles.thumbnailOriginalText}>Original</AppText>
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Footer */}
      {isDone && (
        <View style={styles.footer}>
          <AppButton
            title="Try Another"
            onPress={() => navigation.popToTop()}
            variant="outline"
          />
        </View>
      )}

      {/* Zoom Modal */}
      <Modal visible={zoomVisible} transparent={true} onRequestClose={() => setZoomVisible(false)}>
        <ImageViewer
          imageUrls={allImages.map((img) => ({
            url: img.scenarioId === "__original__" ? img.imageUrl : getFullImageUrl(img.imageUrl),
          }))}
          index={zoomImageIndex}
          onSwipeDown={() => setZoomVisible(false)}
          enableSwipeDown={true}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeZoomBtn}
              onPress={() => setZoomVisible(false)}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // --- Status / Progress ---
  statusBar: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
  doneText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.success,
    fontWeight: "600",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },

  // --- Main Image Display ---
  mainImageContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.md,
    justifyContent: "center",
  },
  mainImageCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: theme.colors.surfaceElevated,
  },
  originalBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingVertical: 6,
  },
  originalBannerText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 11,
  },
  expandBtn: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  mainImageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  mainImageLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.secondary,
    flex: 1,
  },

  // --- Thumbnail Strip ---
  thumbnailSection: {
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  thumbnailList: {
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.sm,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  thumbnailActive: {
    borderColor: theme.colors.accent,
    borderWidth: 3,
  },
  thumbnailOriginal: {
    borderColor: theme.colors.accent,
    opacity: 0.9,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailLoading: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
  },
  thumbnailOriginalBadge: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 1,
    borderRadius: 3,
    alignItems: "center",
  },
  thumbnailOriginalText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 8,
    fontWeight: "700",
  },

  // --- Gallery ---
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: theme.spacing.screenPadding,
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  imageCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: "100%",
    height: IMAGE_HEIGHT,
    resizeMode: "contain",
    backgroundColor: theme.colors.surfaceElevated,
  },
  zoomBtn: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  slideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  slideLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.secondary,
    flex: 1,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
  },
  downloadIcon: {
    fontSize: 16,
    color: theme.colors.background,
  },
  downloadText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontWeight: "600",
  },

  // --- Dots ---
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },

  // --- Thumbnail Navigation (Old - kept for compatibility) ---
  thumbnailRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.screenPadding,
  },
  thumbnailBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.radius.sm - 2,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },

  // --- Skeleton / Loading ---
  skeletonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.lg,
  },
  skeletonCard: {
    width: "100%",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonImage: {
    width: "100%",
    height: IMAGE_HEIGHT * 0.6,
    backgroundColor: theme.colors.surfaceElevated,
  },
  waitingText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.secondary,
    textAlign: "center",
  },
  scenarioList: {
    width: "100%",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  scenarioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  scenarioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  scenarioDotActive: {
    backgroundColor: theme.colors.accent,
  },
  scenarioItem: {
    ...theme.typography.body,
    color: theme.colors.muted,
  },
  scenarioItemActive: {
    color: theme.colors.accent,
    fontWeight: "600",
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
  closeZoomBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 9999,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 24,
  },

  // --- Original Product Image ---
  originalLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingVertical: 6,
  },
  originalLabelText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 11,
  },
  originalBadge: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 1,
    borderRadius: 3,
    alignItems: "center",
  },
  originalBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 7,
    fontWeight: "700",
  },
  dotOriginal: {
    backgroundColor: theme.colors.accent,
    opacity: 0.5,
  },
});
