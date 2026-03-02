import { useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import AppButton from "../components/ui/AppButton";
import { theme } from "../theme/theme";
import {
    allBrandingBackgrounds as localBrandingBackgrounds,
    BrandingBackground,
} from "../constants/brandingBackgrounds";
import { fetchBrandingBackgrounds, getFullUrl } from "../services/contentApi";

// ─── Aspect Ratio options ─────────────────────────────────────────────────────
export interface AspectRatioOption {
    id: string;
    label: string;
    description: string;
    /** width : height */
    ratio: [number, number];
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
    { id: "4:5", label: "4:5", description: "Frame (Portrait)", ratio: [4, 5] },
    { id: "1:1", label: "1:1", description: "Blinkit / Meesho / Flipkart", ratio: [1, 1] },
    { id: "9:16", label: "9:16", description: "Instagram Reels / Stories", ratio: [9, 16] },
    { id: "16:9", label: "16:9", description: "YouTube / Banner", ratio: [16, 9] },
    { id: "3:4", label: "3:4", description: "Amazon / Myntra Listing", ratio: [3, 4] },
    { id: "2:3", label: "2:3", description: "Pinterest / Print", ratio: [2, 3] },
    { id: "5:4", label: "5:4", description: "Facebook Ad", ratio: [5, 4] },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    navigation: any;
    route: any;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BrandingSettingsScreen({ navigation, route }: Props) {
    const { categoryId, modelId, modelName, selectedPose } = route.params;

    // Business details
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [businessName, setBusinessName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [webUrl, setWebUrl] = useState("");

    // Background selection
    const [backgrounds, setBackgrounds] = useState<any[]>(localBrandingBackgrounds);
    const [selectedBgId, setSelectedBgId] = useState<string>(localBrandingBackgrounds[0]?.id || "");

    useEffect(() => {
        fetchBrandingBackgrounds()
            .then((data) => {
                const mapped = data.map((bg) => ({
                    id: bg.id,
                    type: bg.type,
                    label: bg.label,
                    color: bg.color,
                    image: bg.image_url ? { uri: getFullUrl(bg.image_url) } : undefined,
                }));
                setBackgrounds(mapped);
                if (mapped.length > 0) setSelectedBgId(mapped[0].id);
            })
            .catch(() => {
                // keep local fallback
            });
    }, []);

    // Aspect ratio selection
    const [selectedRatioId, setSelectedRatioId] = useState<string>(ASPECT_RATIOS[0].id);

    const pickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) {
            setLogoUri(result.assets[0].uri);
        }
    };

    const handleSaveAndContinue = () => {
        if (!businessName.trim()) {
            Alert.alert("Business Name Required", "Please enter your business name.");
            return;
        }
        if (!logoUri) {
            Alert.alert("Logo Required", "Please upload your business logo.");
            return;
        }

        const selectedBg = backgrounds.find((b: any) => b.id === selectedBgId);
        const selectedRatio = ASPECT_RATIOS.find((r) => r.id === selectedRatioId);

        navigation.navigate("BrandingUpload", {
            categoryId,
            modelId,
            modelName,
            selectedPose,
            brandingSettings: {
                logoUri,
                businessName: businessName.trim(),
                phoneNumber: phoneNumber.trim(),
                address: address.trim(),
                webUrl: webUrl.trim(),
                background: selectedBg,
                aspectRatio: selectedRatio,
            },
        });
    };

    // ─── Render helpers ──────────────────────────────────────────────────────────

    const renderBgItem = (bg: BrandingBackground) => {
        const isSelected = selectedBgId === bg.id;
        return (
            <TouchableOpacity
                key={bg.id}
                style={[styles.bgItem, isSelected && styles.bgItemSelected]}
                onPress={() => setSelectedBgId(bg.id)}
                activeOpacity={0.8}
            >
                {bg.type === "color" ? (
                    <View style={[styles.bgColorSwatch, { backgroundColor: bg.color }]} />
                ) : (
                    <Image source={bg.image} style={styles.bgImageThumb} />
                )}
                <AppText style={[styles.bgLabel, isSelected && styles.bgLabelSelected]}>
                    {bg.label}
                </AppText>
                {isSelected && (
                    <View style={styles.bgCheck}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderRatioItem = (ratio: AspectRatioOption) => {
        const isSelected = selectedRatioId === ratio.id;
        const [w, h] = ratio.ratio;
        const previewW = 40;
        const previewH = Math.round((previewW * h) / w);
        return (
            <TouchableOpacity
                key={ratio.id}
                style={[styles.ratioItem, isSelected && styles.ratioItemSelected]}
                onPress={() => setSelectedRatioId(ratio.id)}
                activeOpacity={0.8}
            >
                {/* Mini frame preview */}
                <View
                    style={[
                        styles.ratioPreview,
                        { width: previewW, height: Math.min(previewH, 60) },
                        isSelected && styles.ratioPreviewSelected,
                    ]}
                />
                <AppText style={[styles.ratioLabel, isSelected && styles.ratioLabelSelected]}>
                    {ratio.label}
                </AppText>
                <AppText style={styles.ratioDesc} numberOfLines={1}>
                    {ratio.description}
                </AppText>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <AppHeader title="Brand Settings" onBack={() => navigation.goBack()} />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Logo ───────────────────────────────────────────────────── */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Business Logo *</AppText>
                    <TouchableOpacity style={styles.logoPicker} onPress={pickLogo} activeOpacity={0.8}>
                        {logoUri ? (
                            <Image source={{ uri: logoUri }} style={styles.logoPreview} resizeMode="contain" />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="image-outline" size={32} color={theme.colors.muted} />
                                <AppText style={styles.logoPlaceholderText}>Tap to upload logo</AppText>
                            </View>
                        )}
                    </TouchableOpacity>
                    {logoUri && (
                        <TouchableOpacity style={styles.changeLogo} onPress={pickLogo}>
                            <Ionicons name="refresh" size={14} color={theme.colors.accent} />
                            <AppText style={styles.changeLogoText}>Change Logo</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Business Details ─────────────────────────────────────── */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Business Name *</AppText>
                    <TextInput
                        style={styles.input}
                        value={businessName}
                        onChangeText={setBusinessName}
                        placeholder="e.g. Sharma Jewellers"
                        placeholderTextColor={theme.colors.muted}
                    />
                </View>

                {/* Optional fields */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>
                        Optional Details
                        <AppText style={styles.optionalTag}> (optional)</AppText>
                    </AppText>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputRow}>
                            <Ionicons name="call-outline" size={16} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.inputInline}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Phone Number"
                                placeholderTextColor={theme.colors.muted}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputRow}>
                            <Ionicons name="location-outline" size={16} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.inputInline}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Address"
                                placeholderTextColor={theme.colors.muted}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputRow}>
                            <Ionicons name="globe-outline" size={16} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.inputInline}
                                value={webUrl}
                                onChangeText={setWebUrl}
                                placeholder="Website URL"
                                placeholderTextColor={theme.colors.muted}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                {/* ── Background Selection (vertical scroll strip) ─────────── */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Background</AppText>
                    <AppText style={styles.sectionSubtitle}>
                        Choose a solid color or textured background
                    </AppText>
                    <ScrollView
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        style={styles.bgScroll}
                        nestedScrollEnabled
                    >
                        {backgrounds.map(renderBgItem)}
                    </ScrollView>
                </View>

                {/* ── Aspect Ratio (vertical scroll) ───────────────────────── */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Aspect Ratio</AppText>
                    <AppText style={styles.sectionSubtitle}>
                        Select the output format for your platform
                    </AppText>
                    <ScrollView
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        style={styles.ratioScroll}
                        nestedScrollEnabled
                    >
                        {ASPECT_RATIOS.map(renderRatioItem)}
                    </ScrollView>
                </View>

                <View style={{ height: theme.spacing.xl }} />
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Save & Upload Product"
                    onPress={handleSaveAndContinue}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.sm,
    },
    optionalTag: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        fontWeight: "400",
    },

    // ── Logo ───────────────────────────────────────────────────────────────────
    logoPicker: {
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: "dashed",
        overflow: "hidden",
        backgroundColor: theme.colors.surface,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    logoPreview: {
        width: "100%",
        height: "100%",
    },
    logoPlaceholder: {
        alignItems: "center",
        gap: theme.spacing.xs,
    },
    logoPlaceholderText: {
        ...theme.typography.caption,
        color: theme.colors.muted,
    },
    changeLogo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: theme.spacing.xs,
        alignSelf: "flex-end",
    },
    changeLogoText: {
        ...theme.typography.caption,
        color: theme.colors.accent,
        fontWeight: "600",
    },

    // ── Inputs ─────────────────────────────────────────────────────────────────
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        ...theme.typography.body,
        color: theme.colors.primary,
    },
    inputGroup: {
        marginTop: theme.spacing.sm,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    inputIcon: {
        marginTop: 2,
    },
    inputInline: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.primary,
        padding: 0,
        margin: 0,
    },

    // ── Background Items (vertical list) ──────────────────────────────────────
    bgScroll: {
        maxHeight: 300,
    },
    bgItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
        borderRadius: theme.radius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        position: "relative",
    },
    bgItemSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: `${theme.colors.accent}0D`,
    },
    bgColorSwatch: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    bgImageThumb: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.sm,
        resizeMode: "cover",
    },
    bgLabel: {
        ...theme.typography.body,
        color: theme.colors.primary,
        flex: 1,
    },
    bgLabelSelected: {
        color: theme.colors.accent,
        fontWeight: "600",
    },
    bgCheck: {
        position: "absolute",
        right: theme.spacing.md,
    },

    // ── Aspect Ratio Items ─────────────────────────────────────────────────────
    ratioScroll: {
        maxHeight: 320,
    },
    ratioItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
        borderRadius: theme.radius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    ratioItemSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: `${theme.colors.accent}0D`,
    },
    ratioPreview: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 4,
        backgroundColor: theme.colors.surfaceElevated,
    },
    ratioPreviewSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: `${theme.colors.accent}20`,
    },
    ratioLabel: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        width: 44,
    },
    ratioLabelSelected: {
        color: theme.colors.accent,
    },
    ratioDesc: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        flex: 1,
    },

    // ── Footer ─────────────────────────────────────────────────────────────────
    footer: {
        padding: theme.spacing.screenPadding,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
});
