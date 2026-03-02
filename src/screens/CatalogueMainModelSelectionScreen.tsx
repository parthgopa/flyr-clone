import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import AppButton from "../components/ui/AppButton";
import { theme } from "../theme/theme";
import { models as localModels } from "../constants/models";
import { catalogueModels as localCatalogueModels } from "../constants/catalogueModels";
import { fetchCatalogueModels, getFullUrl } from "../services/contentApi";

interface Props {
  navigation: any;
  route: any;
}

export default function CatalogueMainModelSelectionScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogueModels()
      .then((data) => {
        const mapped = data.map((m) => ({
          id: m.id,
          name: m.name,
          image: getFullUrl(m.image_url),
          hasPhotos: m.photos && m.photos.length > 0,
        }));
        setAvailableModels(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch catalogue models, using local fallback:", err.message);
        // Fallback: use local models filtered by catalogue availability
        const nameToIdMap: { [key: string]: string } = {
          "Indian Man": "indian-man",
          "Indian Woman": "indian-woman",
          "Indian Boy": "indian-boy",
          "Indian Girl": "indian-girl",
          "International Man": "international-man",
        };
        const fallback = (localModels as any[])
          .filter((m: any) => {
            const catId = nameToIdMap[m.name];
            return localCatalogueModels.some((cm: any) => cm.id === catId);
          })
          .map((m: any) => ({
            id: m.id,
            name: m.name,
            image: m.image,
            hasPhotos: true,
          }));
        setAvailableModels(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleContinue = () => {
    if (!selectedModel) {
      Alert.alert("Selection Required", "Please select a model first.");
      return;
    }

    const selectedModelData = availableModels.find(m => m.id === selectedModel);

    navigation.navigate("CataloguePhotoSelection", {
      categoryId,
      modelId: selectedModel,
      modelName: selectedModelData?.name,
    });
  };

  const renderModel = ({ item }: { item: any }) => {
    const imageSource = typeof item.image === "string" ? { uri: item.image } : item.image;
    return (
      <TouchableOpacity
        style={[
          styles.modelContainer,
          selectedModel === item.id && styles.modelSelected,
        ]}
        onPress={() => handleModelSelect(item.id)}
      >
        <Image source={imageSource} style={styles.modelImage} />
        <View style={styles.modelInfo}>
          <AppText style={styles.modelName}>{item.name}</AppText>
          <AppText style={styles.modelStatus}>
            {item.hasPhotos ? "Photos Available" : "Coming Soon"}
          </AppText>
        </View>
        {selectedModel === item.id && (
          <View style={styles.selectionOverlay}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Select Model" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Choose a Model</AppText>
          <AppText style={styles.sectionSubtitle}>
            Select a model to view their available photos
          </AppText>

          <FlatList
            data={availableModels}
            renderItem={renderModel}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.modelList}
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <AppButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedModel}
        />
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
  },
  modelList: {
    gap: theme.spacing.md,
  },
  modelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: "relative",
  },
  modelSelected: {
    borderColor: theme.colors.accent,
    borderWidth: 3,
  },
  modelImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    resizeMode: "cover",
    marginRight: theme.spacing.md,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    ...theme.typography.title,
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  modelStatus: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    fontStyle: "italic",
  },
  selectionOverlay: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 2,
  },
  footer: {
    padding: theme.spacing.screenPadding,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});
