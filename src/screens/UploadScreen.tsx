import { View, Image, StyleSheet, Alert, ScrollView } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Asset } from "expo-asset";
import { imageUriToBase64 } from "../utils/imageToBase64";


import AppButton from "../components/ui/AppButton";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import UploadDropzone from "../components/UploadDropzone";
import InsufficientCreditsModal from "../components/InsufficientCreditsModal";

import { theme } from "../theme/theme";
import { startGenerationJob } from "../services/api";

export default function UploadScreen({ navigation, route }: any) {
  const { categoryId, model, customModelImage } = route.params;
  // console.log("category id:", categoryId);
  console.log("model:", model);
  // console.log("custom model image:", customModelImage);

  const [productImage, setProductImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState({ needed: 0, current: 0 });

  /* ---------------- IMAGE PICKERS ---------------- */

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      // console.log("Picked product image:", result.assets[0].uri);
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
      // console.log("Captured product image:", result.assets[0].uri);
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

      // Resolve model image to base64 — either custom upload or pre-built asset
      let modelBase64: string | null = null;

      if (customModelImage) {
        // User uploaded their own photo
        modelBase64 = await imageUriToBase64(customModelImage);
      } else if (model?.image) {
        // Check if model.image is a URL string or require() asset
        if (typeof model.image === 'string') {
          // It's a URL - convert directly to base64
          modelBase64 = await imageUriToBase64(model.image);
        } else {
          // Pre-built model: resolve bundled require() asset to a local URI, then base64
          const [asset] = await Asset.loadAsync(model.image);
          if (asset.localUri) {
            modelBase64 = await imageUriToBase64(asset.localUri);
          }
        }
      }

      if (!modelBase64) {
        Alert.alert("Error", "Could not load model image.");
        setLoading(false);
        return;
      }

      const payload = {
        categoryId,
        modelImage: modelBase64,
        productImage: productBase64,
      };
      // console.log("Payload keys:", Object.keys(payload));

      const res = await startGenerationJob(payload);
      console.log("Job started:", res.jobId, "totalImages:", res.totalImages);

      // Navigate immediately — ResultScreen will poll for images
      navigation.navigate("Result", {
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
        const errorMessage = err.message || "Failed to generate image";
        Alert.alert("Error", errorMessage);
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
        {/* MODEL PREVIEW */}
        <View style={styles.section}>
          <AppText style={styles.label}>Selected Model</AppText>
          <View style={styles.modelCard}>
            {customModelImage ? (
              <Image
                source={{ uri: customModelImage }}
                style={styles.modelImage}
              />
            ) : (
              <Image 
                source={typeof model.image === 'string' ? { uri: model.image } : model.image} 
                style={styles.modelImage} 
              />
            )}
          </View>
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
          title={loading ? "Generating..." : "Generate Result"}
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
        generationType="photos"
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
  modelCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modelImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    backgroundColor: theme.colors.surfaceElevated,
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
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
});
