import { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import AppButton from "../components/ui/AppButton";
import { theme } from "../theme/theme";
import {
    allBrandingBackgrounds as localBrandingBackgrounds,
    BrandingBackground,
} from "../constants/brandingBackgrounds";
import { fetchBrandingBackgrounds, getFullUrl } from "../services/contentApi";

interface Props {
    navigation: any;
    route: any;
}

export default function CatalogueBackgroundSelectionScreen({ navigation, route }: Props) {
    const { categoryId, selectedModels, modelName, showcaseItem } = route.params;

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

    const handleContinue = () => {
        const selectedBg = backgrounds.find((b: any) => b.id === selectedBgId);

        navigation.navigate("CatalogueUpload", {
            categoryId,
            selectedModels,
            modelName,
            showcaseItem,
            selectedBackground: selectedBg,
        });
    };

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

    return (
        <View style={styles.container}>
            <AppHeader title="Select Background" onBack={() => navigation.goBack()} />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerSection}>
                    <AppText style={styles.sectionTitle}>Choose Background</AppText>
                    <AppText style={styles.sectionSubtitle}>
                        Select a solid color or textured background for your catalogue images
                    </AppText>
                </View>

                <View style={styles.section}>
                    <ScrollView
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        style={styles.bgScroll}
                        nestedScrollEnabled
                    >
                        {backgrounds.map(renderBgItem)}
                    </ScrollView>
                </View>

                <View style={{ height: theme.spacing.xl }} />
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Continue to Upload"
                    onPress={handleContinue}
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
    section: {
        marginBottom: theme.spacing.lg,
    },
    bgScroll: {
        maxHeight: 400,
    },
    bgItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 2,
        borderColor: theme.colors.border,
        position: "relative",
    },
    bgItemSelected: {
        borderColor: theme.colors.accent,
        borderWidth: 3,
    },
    bgColorSwatch: {
        width: 50,
        height: 50,
        borderRadius: theme.radius.sm,
        marginRight: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    bgImageThumb: {
        width: 50,
        height: 50,
        borderRadius: theme.radius.sm,
        marginRight: theme.spacing.md,
        resizeMode: "cover",
    },
    bgLabel: {
        ...theme.typography.body,
        color: theme.colors.primary,
        flex: 1,
        fontWeight: "500",
    },
    bgLabelSelected: {
        color: theme.colors.accent,
        fontWeight: "700",
    },
    bgCheck: {
        marginLeft: theme.spacing.sm,
    },
    footer: {
        padding: theme.spacing.screenPadding,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
});
