import { View, FlatList, StyleSheet, Alert, Image, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";

import ModelCard from "../components/ModelCard";
import UploadModelCard from "../components/UploadModelCard";
import AppButton from "../components/ui/AppButton";
import AppHeader from "../components/ui/AppHeader";

import { models as localModels } from "../constants/models";
import { fetchPhotoshootModels, getFullUrl } from "../services/contentApi";
import { theme } from "../theme/theme";
import AppText from "../components/ui/AppText";

export default function ModelSelectionScreen({ navigation, route }: any) {
  const { categoryId } = route.params;

  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [customModelImage, setCustomModelImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotoshootModels()
      .then((data) => {
        const mapped = data.map((m) => ({
          id: m.id,
          name: m.name,
          image: getFullUrl(m.image_url),
        }));
        setModels(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch models, using local fallback:", err.message);
        setModels(localModels as any[]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- PICK CUSTOM MODEL ---------------- */

  const pickCustomModel = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setCustomModelImage(result.assets[0].uri);
      setSelectedModel({
        id: "custom",
        name: "Custom Model",
      });
    }
  };

  /* ---------------- CONTINUE ---------------- */

  const handleContinue = () => {
    if (!selectedModel) {
      Alert.alert("Select model", "Please select a model to continue.");
      return;
    }

    navigation.navigate("Upload", {
      categoryId,
      model: selectedModel,
      customModelImage,
    });
  };

  /* ---------------- DATA WITH EXTRA CARD ---------------- */

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const modelData = [...models, { id: "custom_upload" }] as any[];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Select Model"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={modelData}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.id === "custom_upload") {
            return (
              <UploadModelCard
                selected={selectedModel?.id === "custom"}
                onPress={pickCustomModel}
              />
            );
          }

          return (
            <ModelCard
              image={item.image}
              name={item.name}
              selected={selectedModel?.id === item.id}
              onPress={() => {
                setSelectedModel(item);
                setCustomModelImage(null);
              }}
            />
          );
        }}
      />

      {customModelImage && (
        <View style={styles.customModelPreview}>
          <AppText style={styles.previewLabel}>Your uploaded photo</AppText>
          <Image source={{ uri: customModelImage }} style={styles.customModelImage} />
        </View>
      )}

      <View style={styles.footer}>
        <AppButton title="Continue" onPress={handleContinue} />
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
  list: {
    padding: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.md,
  },
  row: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  customModelPreview: {
    marginHorizontal: theme.spacing.screenPadding,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  previewLabel: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
    fontWeight: "600",
  },
  customModelImage: {
    width: "100%",
    height: 140,
    borderRadius: theme.radius.md,
    resizeMode: "contain",
    backgroundColor: theme.colors.surfaceElevated,
  },
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
});
