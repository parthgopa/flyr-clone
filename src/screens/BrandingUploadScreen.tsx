import { View, Image, StyleSheet, Alert, ScrollView } from "react-native";
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
import { startBrandingGenerationJob } from "../services/api";

interface Props {
    navigation: any;
    route: any;
}

export default function BrandingUploadScreen({ navigation, route }: Props) {
    const { categoryId, modelId, modelName, selectedPose, brandingSettings, showcaseItem } = route.params;

    const [productImage, setProductImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [creditsInfo, setCreditsInfo] = useState({ needed: 0, current: 0 });

    // Pre-select showcase image if available
    useEffect(() => {
        if (showcaseItem?.before_url && !productImage) {
            // Use the 'before' image from showcase as default product image
            setProductImage(showcaseItem.before_url);
        }
    }, [showcaseItem]);

    /* ── Image Pickers ───────────────────────────────────────────────────────── */

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
        const result = await ImagePicker.launchCameraAsync({ quality: 1 });
        if (!result.canceled) {
            setProductImage(result.assets[0].uri);
        }
    };

    /* ── Generate ────────────────────────────────────────────────────────────── */

    const handleGenerate = async () => {
        if (!productImage) {
            Alert.alert("Upload Image", "Please upload a product image first.");
            return;
        }

        try {
            setLoading(true);

            // Convert product image to base64
            const productBase64 = await imageUriToBase64(productImage);

            // Convert pose (model reference) image to base64
            let poseBase64: string | null = null;
            if (selectedPose?.image) {
                const [asset] = await Asset.loadAsync(selectedPose.image);
                if (asset.localUri) {
                    poseBase64 = await imageUriToBase64(asset.localUri);
                }
            }

            if (!poseBase64) {
                Alert.alert("Error", "Could not load pose image.");
                setLoading(false);
                return;
            }

            // Convert logo to base64 if present
            let logoBase64: string | null = null;
            if (brandingSettings?.logoUri) {
                logoBase64 = await imageUriToBase64(brandingSettings.logoUri);
            }

            const payload = {
                categoryId,
                modelId,
                poseImage: poseBase64,
                productImage: productBase64,
                logoImage: logoBase64,
                businessName: brandingSettings?.businessName ?? "",
                phoneNumber: brandingSettings?.phoneNumber ?? "",
                address: brandingSettings?.address ?? "",
                webUrl: brandingSettings?.webUrl ?? "",
                backgroundColor: brandingSettings?.background?.color ?? null,
                backgroundLabel: brandingSettings?.background?.label ?? "White",
                aspectRatio: brandingSettings?.aspectRatio?.id ?? "4:5",
                aspectRatioDescription: brandingSettings?.aspectRatio?.description ?? "Frame",
            };

            const res = await startBrandingGenerationJob(payload);

            navigation.navigate("BrandingResult", {
                jobId: res.jobId,
                totalImages: res.totalImages,
                scenarios: res.scenarios,
                productImage,
            });
        } catch (err: any) {
            console.error("Branding generate error:", err);
            
            // Check if error is 402 - insufficient credits
            if (err.response?.status === 402) {
                const errorData = err.response.data;
                setCreditsInfo({
                    needed: errorData.credits_needed || 0,
                    current: errorData.current_credits || 0,
                });
                setShowCreditsModal(true);
            } else {
                Alert.alert("Error", "Failed to generate branding image. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    /* ── UI ──────────────────────────────────────────────────────────────────── */

    const { brandingSettings: bs } = route.params;

    return (
        <View style={styles.container}>
            <AppHeader title="Upload Product" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Settings Summary */}
                <View style={styles.summaryCard}>
                    <AppText style={styles.summaryTitle}>Branding Summary</AppText>
                    <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Model:</AppText>
                        <AppText style={styles.summaryValue}>{modelName}</AppText>
                    </View>
                    <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Pose:</AppText>
                        <AppText style={styles.summaryValue}>{selectedPose?.label}</AppText>
                    </View>
                    <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Business:</AppText>
                        <AppText style={styles.summaryValue}>{bs?.businessName}</AppText>
                    </View>
                    <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Background:</AppText>
                        <View style={styles.summaryBgRow}>
                            {bs?.background?.color && (
                                <View
                                    style={[
                                        styles.summaryColorDot,
                                        { backgroundColor: bs.background.color },
                                    ]}
                                />
                            )}
                            <AppText style={styles.summaryValue}>{bs?.background?.label}</AppText>
                        </View>
                    </View>
                    <View style={styles.summaryRow}>
                        <AppText style={styles.summaryLabel}>Aspect Ratio:</AppText>
                        <AppText style={styles.summaryValue}>
                            {bs?.aspectRatio?.label} — {bs?.aspectRatio?.description}
                        </AppText>
                    </View>
                </View>

                {/* Pose Preview (small) */}
                {selectedPose?.image && (
                    <View style={styles.section}>
                        <AppText style={styles.label}>Selected Pose</AppText>
                        <View style={styles.posePreviewCard}>
                            <Image source={selectedPose.image} style={styles.posePreview} resizeMode="contain" />
                            <AppText style={styles.poseLabel}>{selectedPose.label}</AppText>
                        </View>
                    </View>
                )}

                {/* Product Upload */}
                <View style={styles.section}>
                    <AppText style={styles.label}>Product Image *</AppText>
                    <UploadDropzone onPick={pickFromGallery} onCamera={pickFromCamera} />
                </View>

                {/* Product Preview */}
                {productImage && (
                    <View style={styles.section}>
                        <AppText style={styles.label}>Product Preview</AppText>
                        <View style={styles.previewCard}>
                            <Image
                                source={{ uri: productImage }}
                                style={styles.productPreview}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title={loading ? "Generating..." : "Generate Branded Image"}
                    onPress={handleGenerate}
                    disabled={loading || !productImage}
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
                generationType="branded"
            />
        </View>
    );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

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
    summaryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm,
    },
    summaryTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        marginBottom: theme.spacing.xs,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
    },
    summaryLabel: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        width: 90,
    },
    summaryValue: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        flex: 1,
        fontWeight: "500",
    },
    summaryBgRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    summaryColorDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    section: {
        gap: theme.spacing.sm,
    },
    label: {
        ...theme.typography.bodyMedium,
        color: theme.colors.secondary,
        fontWeight: "600",
    },
    posePreviewCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: "hidden",
        alignItems: "center",
    },
    posePreview: {
        width: "100%",
        height: 180,
        backgroundColor: theme.colors.surfaceElevated,
    },
    poseLabel: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        paddingVertical: theme.spacing.xs,
    },
    previewCard: {
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    productPreview: {
        width: "100%",
        height: 220,
        resizeMode: "contain",
        backgroundColor: theme.colors.surfaceElevated,
    },
    footer: {
        paddingHorizontal: theme.spacing.screenPadding,
        paddingBottom: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
    },
});
