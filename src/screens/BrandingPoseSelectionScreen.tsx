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
import { getBrandingModelById } from "../constants/brandingModels";
import { fetchBrandingModels, getFullUrl } from "../services/contentApi";

interface Props {
    navigation: any;
    route: any;
}

export default function BrandingPoseSelectionScreen({ navigation, route }: Props) {
    const { categoryId, modelId, modelName, showcaseItem } = route.params;
    const [selectedPoseId, setSelectedPoseId] = useState<string | null>(null);
    const [poses, setPoses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrandingModels()
            .then((data) => {
                const model = data.find((m) => m.id === modelId);
                if (model && model.poses) {
                    const mapped = model.poses.map((p: any) => ({
                        id: p.id,
                        image: getFullUrl(p.image_url),
                        label: p.label,
                    }));
                    setPoses(mapped);
                }
            })
            .catch((err) => {
                console.warn("Failed to fetch poses, using local fallback:", err.message);
                const local = getBrandingModelById(modelId);
                if (local) setPoses(local.poses as any[]);
            })
            .finally(() => setLoading(false));
    }, [modelId]);

    const handleContinue = () => {
        if (!selectedPoseId) {
            Alert.alert("Pose Required", "Please select a pose to continue.");
            return;
        }
        const selectedPose = poses.find((p) => p.id === selectedPoseId);
        navigation.navigate("BrandingSettings", {
            categoryId,
            modelId,
            modelName,
            selectedPose,
            showcaseItem,
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    const renderPose = ({ item }: { item: any }) => {
        const isSelected = selectedPoseId === item.id;
        const imageSource = typeof item.image === "string" ? { uri: item.image } : item.image;
        return (
            <TouchableOpacity
                style={[styles.poseContainer, isSelected && styles.poseSelected]}
                onPress={() => setSelectedPoseId(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.imageWrapper}>
                    <Image source={imageSource} style={styles.poseImage} resizeMode="cover" />
                    {isSelected && (
                        <View style={styles.poseOverlayCheck}>
                            <Ionicons name="checkmark-circle" size={26} color={theme.colors.accent} />
                        </View>
                    )}
                </View>
                <AppText style={[styles.poseLabel, isSelected && styles.poseLabelSelected]}>
                    {item.label}
                </AppText>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title={`${modelName} — Select Pose`} onBack={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerSection}>
                    <AppText style={styles.sectionTitle}>Choose a Pose</AppText>
                    <AppText style={styles.sectionSubtitle}>
                        Pick the pose you want for your branded image
                    </AppText>
                </View>

                {poses.length > 0 ? (
                    <FlatList
                        data={poses}
                        renderItem={renderPose}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.grid}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="images-outline" size={48} color={theme.colors.muted} />
                        <AppText style={styles.emptyText}>No poses available for this model yet</AppText>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedPoseId}
                />
            </View>
        </View>
    );
}

const ITEM_SIZE_PERCENT = "30%";

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
        marginBottom: theme.spacing.sm,
    },
    poseContainer: {
        width: ITEM_SIZE_PERCENT as any,
        borderRadius: theme.radius.md,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    poseSelected: {
        borderColor: theme.colors.accent,
        borderWidth: 3,
    },
    imageWrapper: {
        aspectRatio: 0.75,
        position: "relative",
    },
    poseImage: {
        width: "100%",
        height: "100%",
    },
    poseOverlayCheck: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: theme.colors.background,
        borderRadius: 13,
        padding: 1,
    },
    poseLabel: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        textAlign: "center",
        paddingVertical: theme.spacing.xs,
        fontSize: 10,
        backgroundColor: theme.colors.surface,
    },
    poseLabelSelected: {
        color: theme.colors.accent,
        fontWeight: "600",
    },
    emptyState: {
        paddingVertical: theme.spacing.xl * 2,
        alignItems: "center",
        gap: theme.spacing.md,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.muted,
        textAlign: "center",
    },
    footer: {
        padding: theme.spacing.screenPadding,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
});
