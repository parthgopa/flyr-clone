import { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import AppButton from "../components/ui/AppButton";
import { theme } from "../theme/theme";
import { brandingModels as localBrandingModels } from "../constants/brandingModels";
import { fetchBrandingModels, getFullUrl } from "../services/contentApi";

interface Props {
    navigation: any;
    route: any;
}

export default function BrandingMainModelSelectionScreen({ navigation, route }: Props) {
    const { categoryId, showcaseItem } = route.params;
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrandingModels()
            .then((data) => {
                const mapped = data.map((m) => ({
                    id: m.id,
                    name: m.name,
                    beforeImage: getFullUrl(m.before_image_url),
                    afterImage: getFullUrl(m.after_image_url),
                    poses: (m.poses || []).map((p: any) => ({
                        id: p.id,
                        image: getFullUrl(p.image_url),
                        label: p.label,
                    })),
                }));
                setModels(mapped);
            })
            .catch((err) => {
                console.warn("Failed to fetch branding models, using local fallback:", err.message);
                setModels(localBrandingModels as any[]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleContinue = () => {
        if (!selectedModelId) {
            Alert.alert("Selection Required", "Please select a model first.");
            return;
        }
        navigation.navigate("BrandingPoseSelection", {
            categoryId,
            modelId: selectedModelId,
            modelName: models.find((m) => m.id === selectedModelId)?.name,
            showcaseItem,
        });
    };

    const renderModel = ({ item }: { item: any }) => {
        const isSelected = selectedModelId === item.id;
        const imageSource = typeof item.beforeImage === "string"
            ? { uri: item.beforeImage }
            : item.beforeImage;
        return (
            <TouchableOpacity
                style={[styles.modelCard, isSelected && styles.modelCardSelected]}
                onPress={() => setSelectedModelId(item.id)}
                activeOpacity={0.85}
            >
                {/* Thumbnail image */}
                <View style={styles.modelImageWrapper}>
                    <Image source={imageSource} style={styles.modelImage} resizeMode="cover" />
                    {isSelected && (
                        <View style={styles.selectedOverlay}>
                            <Ionicons name="checkmark-circle" size={28} color={theme.colors.accent} />
                        </View>
                    )}
                </View>

                {/* Name row */}
                <View style={styles.modelFooter}>
                    <AppText style={[styles.modelName, isSelected && styles.modelNameSelected]}>
                        {item.name}
                    </AppText>
                    <View style={styles.poseChip}>
                        <AppText style={styles.poseCount}>{item.poses?.length || 0} poses</AppText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="Select Model" onBack={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerSection}>
                    <AppText style={styles.sectionTitle}>Choose a Model</AppText>
                    <AppText style={styles.sectionSubtitle}>
                        Select the model you want to use for your branded image
                    </AppText>
                </View>

                <FlatList
                    data={models}
                    renderItem={renderModel}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.grid}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={4}
                    windowSize={5}
                    initialNumToRender={4}
                />
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedModelId}
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
    headerSection: {
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
    },
    grid: {
        paddingBottom: theme.spacing.xl,
    },
    row: {
        justifyContent: "space-between",
        marginBottom: theme.spacing.md,
    },
    modelCard: {
        width: "48%",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colors.border,
        overflow: "hidden",
    },
    modelCardSelected: {
        borderColor: theme.colors.accent,
        borderWidth: 3,
    },
    modelImageWrapper: {
        width: "100%",
        aspectRatio: 0.8,
        position: "relative",
    },
    modelImage: {
        width: "100%",
        height: "100%",
    },
    selectedOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 14,
        padding: 1,
    },
    modelFooter: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    modelName: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        flex: 1,
        fontWeight: "700",
        fontSize: 12,
    },
    modelNameSelected: {
        color: theme.colors.accent,
    },
    poseChip: {
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    poseCount: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        fontSize: 10,
    },
    footer: {
        padding: theme.spacing.screenPadding,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
});
