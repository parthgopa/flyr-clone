import { View, Image, StyleSheet, Alert, ScrollView, FlatList } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Asset } from "expo-asset";
import { imageUriToBase64 } from "../utils/imageToBase64";

import AppButton from "../components/ui/AppButton";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import UploadDropzone from "../components/UploadDropzone";

import { theme } from "../theme/theme";
import { startCatalogueGenerationJob } from "../services/api";

export default function CatalogueUploadScreen({ navigation, route }: any) {
  const { categoryId, selectedModels, modelName } = route.params;

  const [productImage, setProductImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      };

      const res = await startCatalogueGenerationJob(payload);

      // Navigate to CatalogueResult screen
      navigation.navigate("CatalogueResult", {
        jobId: res.jobId,
        totalImages: res.totalImages,
        scenarios: res.scenarios,
        productImage,
      });
    } catch (err) {
      console.log("Generate error:", err);
      Alert.alert("Error", "Failed to generate catalogue images");
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
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
});
