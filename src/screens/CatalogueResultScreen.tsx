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
  Alert,
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
import { downloadImage, downloadMultipleImages } from "../utils/downloadImage";

import { theme } from "../theme/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = Math.min(SCREEN_WIDTH * 1.05, SCREEN_HEIGHT * 0.55);
const POLL_INTERVAL = 6000;

const getFullImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith("http")) {
    return imageUrl;
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

export default function CatalogueResultScreen({ route, navigation }: any) {
  const { jobId, totalImages, scenarios, productImage } = route.params as {
    jobId: string;
    totalImages: number;
    scenarios: Scenario[];
    productImage?: string;
  };

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ completed: 0, total: 0 });
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
        }
      } catch (err) {
        console.error("Poll error:", err);
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

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    setIsDownloadingAll(true);
    setDownloadProgress({ completed: 0, total: images.length });

    const imageData = images.map(img => ({
      url: getFullImageUrl(img.imageUrl),
      label: img.label,
    }));

    await downloadMultipleImages(imageData, (completed, total) => {
      setDownloadProgress({ completed, total });
    });

    setIsDownloadingAll(false);
  };

  const showDownloadAllDialog = () => {
    Alert.alert(
      "Download All Images",
      `Download all ${images.length} catalogue images to your gallery?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Download All",
          onPress: handleDownloadAll,
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Catalogue Results" onBack={() => navigation.goBack()} />

      {/* Progress section */}
      <View style={styles.statusBar}>
        {!isDone ? (
          <>
            <View style={styles.progressRow}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
              <AppText style={styles.statusText}>
                Generating {completedCount}/{totalImages}
              </AppText>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </>
        ) : (
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <AppText style={styles.doneText}>All images generated!</AppText>
          </View>
        )}
      </View>

      {/* Main gallery */}
      <View style={styles.galleryContainer}>
        {images.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={allImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, idx) => `${item.scenarioId}-${idx}`}
              renderItem={({ item }) => {
                const isOriginal = item.scenarioId === "__original__";
                const imageUri = isOriginal ? item.imageUrl : getFullImageUrl(item.imageUrl);
                return (
                  <View style={styles.imageSlide}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.resultImage}
                      resizeMode="contain"
                    />
                    <View style={styles.labelContainer}>
                      <AppText style={styles.imageLabel}>
                        {isOriginal ? "📷 Original Product" : item.label}
                      </AppText>
                    </View>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={() => {
                        const idx = allImages.findIndex((img) => img.scenarioId === item.scenarioId);
                        setZoomImageIndex(idx >= 0 ? idx : 0);
                        setZoomVisible(true);
                      }}
                    >
                      <Ionicons name="expand-outline" size={20} color={theme.colors.white} />
                    </TouchableOpacity>
                    {!isOriginal && (
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => downloadImage(imageUri, item.label)}
                      >
                        <Ionicons name="download-outline" size={20} color={theme.colors.white} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />

            {/* Image counter and dots */}
            <View style={styles.paginationContainer}>
              <AppText style={styles.counterText}>
                {activeIndex + 1} / {allImages.length}
              </AppText>
              <View style={styles.dotsContainer}>
                {allImages.map((img, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === activeIndex && styles.dotActive,
                      img.scenarioId === "__original__" && { backgroundColor: theme.colors.accent, opacity: 0.5 },
                    ]}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.skeletonContainer}>
            <Animated.View style={[styles.skeletonImage, { opacity: pulseAnim }]} />
            <AppText style={styles.skeletonText}>
              {currentScenario || "Preparing..."}
            </AppText>
          </View>
        )}
      </View>

      {/* Scenario list */}
      <View style={styles.scenarioSection}>
        <AppText style={styles.scenarioTitle}>Catalogue Views</AppText>
        <View style={styles.scenarioList}>
          {scenarios.map((sc) => {
            const completed = images.some((img) => img.scenarioId === sc.id);
            const isActive = currentScenario === sc.label;
            return (
              <View
                key={sc.id}
                style={[
                  styles.scenarioItem,
                  completed && styles.scenarioItemDone,
                  isActive && styles.scenarioItemActive,
                ]}
              >
                {completed ? (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                ) : isActive ? (
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                ) : (
                  <View style={styles.scenarioDot} />
                )}
                <AppText
                  style={[
                    styles.scenarioLabel,
                    completed && styles.scenarioLabelDone,
                    isActive && styles.scenarioLabelActive,
                  ]}
                >
                  {sc.label}
                </AppText>
              </View>
            );
          })}
        </View>
      </View>

      {/* Try Another button */}
      {isDone && (
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <AppButton
              title="Download All"
              onPress={showDownloadAllDialog}
              disabled={images.length === 0}
              style={styles.downloadAllButton}
            />
            <AppButton
              title="Try Another"
              onPress={() => navigation.navigate("Home")}
              style={styles.tryAnotherButton}
            />
          </View>
        </View>
      )}

      {/* Download Progress Modal */}
      {isDownloadingAll && (
        <View style={styles.progressModal}>
          <View style={styles.progressModalContent}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <AppText style={styles.progressModalTitle}>
              Downloading Images...
            </AppText>
            <AppText style={styles.progressModalText}>
              {downloadProgress.completed} / {downloadProgress.total}
            </AppText>
            <View style={styles.downloadProgressBarContainer}>
              <View
                style={[
                  styles.downloadProgressBarFill,
                  {
                    width: `${(downloadProgress.completed / downloadProgress.total) * 100}%`
                  }
                ]}
              />
            </View>
          </View>
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
  statusBar: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.accent,
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  doneText: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: "600",
  },
  galleryContainer: {
    flex: 1,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  labelContainer: {
    position: "absolute",
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md + 50,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  imageLabel: {
    ...theme.typography.body,
    color: theme.colors.white,
    textAlign: "center",
    fontWeight: "600",
  },
  zoomBtn: {
    position: "absolute",
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtn: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  counterText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.accent,
    width: 20,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.screenPadding,
  },
  skeletonImage: {
    width: SCREEN_WIDTH - theme.spacing.screenPadding * 2,
    height: IMAGE_HEIGHT - 100,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  skeletonText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  scenarioSection: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  scenarioTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  scenarioList: {
    gap: theme.spacing.xs,
  },
  scenarioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  scenarioItemDone: {
    opacity: 0.7,
  },
  scenarioItemActive: {
    opacity: 1,
  },
  scenarioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  scenarioLabel: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  scenarioLabelDone: {
    color: theme.colors.success,
  },
  scenarioLabelActive: {
    color: theme.colors.accent,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
  buttonRow: {
    gap: theme.spacing.md,
  },
  downloadAllButton: {
    backgroundColor: theme.colors.accent,
  },
  tryAnotherButton: {
    backgroundColor: theme.colors.primary,
  },
  progressModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  progressModalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    minWidth: 250,
  },
  progressModalTitle: {
    ...theme.typography.title,
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  progressModalText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  downloadProgressBarContainer: {
    width: 200,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  downloadProgressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.accent,
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
});
