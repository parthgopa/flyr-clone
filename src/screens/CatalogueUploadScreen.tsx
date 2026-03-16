import { View, Image, StyleSheet, Alert, ScrollView, FlatList } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Asset } from "expo-asset";
import { imageUriToBase64 } from "../utils/imageToBase64";

import AppButton from "../components/ui/AppButton";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import UploadDropzone from "../components/UploadDropzone";
import InsufficientCreditsModal from "../components/InsufficientCreditsModal";

import { theme } from "../theme/theme";
import { startCatalogueGenerationJob } from "../services/api";

export default function CatalogueUploadScreen({ navigation, route }: any) {
  const { categoryId, selectedModels, modelName, showcaseItem, selectedBackground } = route.params;

  const [productImage, setProductImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState({ needed: 0, current: 0 });

  // Pre-select showcase image if available (use first thumbnail's image_url)
  useEffect(() => {
    if (showcaseItem?.thumbnails?.[0]?.image_url && !productImage) {
      setProductImage(showcaseItem.thumbnails[0].image_url);
    }
  }, [showcaseItem]);

  /* ---------------- IMAGE PICKERS ---------------- */

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  /* ---------------- GENERATE ---------------- */

  const handleGenerate = async () => {
    if (!productImage) {
      Alert.alert("Upload image", "Please upload a product image first.");
      return;
    }

    try {
      setLoading(true);

      const productBase64 = await imageUriToBase64(productImage);

      // Convert all selected model images to base64
      const modelImagesBase64 = await Promise.all(
        selectedModels.map(async (model: any) => {
          const [asset] = await Asset.loadAsync(model.image);
          if (asset.localUri) {
            return await imageUriToBase64(asset.localUri);
          }
          return null;
        })
      );

      // Filter out any null values
      const validModelImages = modelImagesBase64.filter(img => img !== null);

      if (validModelImages.length === 0) {
        Alert.alert("Error", "Could not load model images.");
        setLoading(false);
        return;
      }

      const payload = {
        categoryId,
        modelImages: validModelImages,
        productImage: productBase64,
        modelLabels: selectedModels.map((m: any) => m.label),
        backgroundColor: selectedBackground?.color || null,
        backgroundLabel: selectedBackground?.label || "White",
      };

      const res = await startCatalogueGenerationJob(payload);

      // Navigate to CatalogueResult screen
      navigation.navigate("CatalogueResult", {
        jobId: res.jobId,
        totalImages: res.totalImages,
        scenarios: res.scenarios,
        productImage,
      });
    } catch (err: any) {
      console.log("Generate error:", err);
      
      // Check if error is 402 - insufficient credits
      if (err.response?.status === 402) {
        const errorData = err.response.data;
        setCreditsInfo({
          needed: errorData.credits_needed || 0,
          current: errorData.current_credits || 0,
        });
        setShowCreditsModal(true);
      } else {
        Alert.alert("Error", "Failed to generate catalogue images");
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <AppHeader title="Upload Product" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* SELECTED BACKGROUND PREVIEW */}
        {selectedBackground && (
          <View style={styles.section}>
            <AppText style={styles.label}>Selected Background</AppText>
            <View style={styles.backgroundPreview}>
              {selectedBackground.type === "color" ? (
                <View style={[styles.bgColorPreview, { backgroundColor: selectedBackground.color }]} />
              ) : (
                <Image source={selectedBackground.image} style={styles.bgImagePreview} />
              )}
              <AppText style={styles.bgPreviewLabel}>{selectedBackground.label}</AppText>
            </View>
          </View>
        )}

        {/* SELECTED MODEL PHOTOS PREVIEW */}
        <View style={styles.section}>
          <AppText style={styles.label}>
            Selected Model Photos ({selectedModels.length})
          </AppText>
          <FlatList
            data={selectedModels}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modelList}
            renderItem={({ item }) => (
              <View style={styles.modelCard}>
                <Image source={item.image} style={styles.modelImage} />
                <AppText style={styles.modelLabel}>{item.label}</AppText>
              </View>
            )}
          />
        </View>

        {/* UPLOAD DROPZONE */}
        <View style={styles.section}>
          <AppText style={styles.label}>Product Image</AppText>
          <UploadDropzone
            onPick={pickFromGallery}
            onCamera={pickFromCamera}
          />
        </View>

        {/* PRODUCT PREVIEW */}
        {productImage && (
          <View style={styles.section}>
            <AppText style={styles.label}>Product Preview</AppText>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ACTION */}
      <View style={styles.footer}>
        <AppButton
          title={loading ? "Generating..." : "Generate Catalogue"}
          onPress={handleGenerate}
        />
      </View>

      {/* INSUFFICIENT CREDITS MODAL */}
      <InsufficientCreditsModal
        visible={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        onBuyCredits={() => {
          setShowCreditsModal(false);
          navigation.navigate("BuyMoreImages");
        }}
        creditsNeeded={creditsInfo.needed}
        currentCredits={creditsInfo.current}
        generationType="catalogue"
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.screenPadding,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodyMedium,
    color: theme.colors.secondary,
    fontWeight: "600",
  },
  modelList: {
    gap: theme.spacing.sm,
  },
  modelCard: {
    width: 100,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modelImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
    backgroundColor: theme.colors.surfaceElevated,
  },
  modelLabel: {
    ...theme.typography.caption,
    fontSize: 9,
    color: theme.colors.secondary,
    textAlign: "center",
    paddingVertical: theme.spacing.xs,
  },
  previewCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  productImage: {
    width: "100%",
    height: 240,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceElevated,
  },
  backgroundPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bgColorPreview: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bgImagePreview: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.md,
    resizeMode: "cover",
  },
  bgPreviewLabel: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
});
