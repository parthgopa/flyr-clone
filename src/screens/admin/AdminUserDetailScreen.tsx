import { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    RefreshControl,
    Modal,
    Dimensions,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system/next";
import * as MediaLibrary from "expo-media-library";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import { theme } from "../../theme/theme";
import { backendURL } from "../../services/api";
import {
    fetchUserDetail,
    fetchUserGenerations,
    updateUserStatus,
    fetchCostSettings,
    UserDetail,
    GenerationItem,
    CostSettings,
} from "../../services/adminApi";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function AdminUserDetailScreen({ navigation, route }: any) {
    const { userId } = route.params;
    const [detail, setDetail] = useState<UserDetail | null>(null);
    const [generations, setGenerations] = useState<GenerationItem[]>([]);
    const [genTotal, setGenTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cost settings from DB
    const [costSettings, setCostSettings] = useState<CostSettings>({
        input_cost_per_million: 2,
        output_cost_per_million: 12,
        usd_to_inr: 83.5,
    });

    // Token popup
    const [tokenPopupVisible, setTokenPopupVisible] = useState(false);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterSubCategory, setFilterSubCategory] = useState<string>("all");

    // Image viewer
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [viewerImageUrl, setViewerImageUrl] = useState("");

    // Gallery permission — requested once on mount
    const hasGalleryPermission = useRef(false);

    const loadData = useCallback(async () => {
        try {
            const [d, g, settings] = await Promise.all([
                fetchUserDetail(userId),
                fetchUserGenerations(userId, 1, 100),
                fetchCostSettings(),
            ]);
            setDetail(d);
            setGenerations(g.generations);
            setGenTotal(g.total);
            setCostSettings(settings);
        } catch (err) {
            console.error("User detail error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();

        // Request gallery permission once when screen mounts
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            hasGalleryPermission.current = status === "granted";
        })();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const toggleStatus = () => {
        if (!detail) return;
        const u = detail.user;
        if (u.role === "admin") return;
        const newStatus = u.status === "active" ? "suspended" : "active";
        Alert.alert(
            `${newStatus === "suspended" ? "Suspend" : "Activate"} User`,
            `Are you sure?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: newStatus === "suspended" ? "destructive" : "default",
                    onPress: async () => {
                        try {
                            await updateUserStatus(userId, newStatus);
                            loadData();
                        } catch {
                            Alert.alert("Error", "Failed");
                        }
                    },
                },
            ]
        );
    };

    // ── Derived filter options ──────────────────────────────────────────────────
    const allCategories = Array.from(
        new Set(generations.map((g) => g.category).filter(Boolean))
    );
    const allSubCategories = Array.from(
        new Set(generations.map((g) => g.sub_category).filter(Boolean))
    );

    const filteredGenerations = generations.filter((g) => {
        if (filterCategory !== "all" && g.category !== filterCategory) return false;
        if (filterSubCategory !== "all" && g.sub_category !== filterSubCategory)
            return false;
        return true;
    });

    // ── Token cost helpers (from DB settings) ──────────────────────────────────
    const calcCostUSD = (inputTokens: number, outputTokens: number) => {
        const inputCost =
            (inputTokens / 1_000_000) * costSettings.input_cost_per_million;
        const outputCost =
            (outputTokens / 1_000_000) * costSettings.output_cost_per_million;
        return { inputCost, outputCost, totalCost: inputCost + outputCost };
    };

    const formatUSD = (n: number) => `$${n.toFixed(4)}`;
    const formatINR = (n: number) =>
        `₹${(n * costSettings.usd_to_inr).toFixed(2)}`;

    // ── Image actions ───────────────────────────────────────────────────────────
    const openImageViewer = (url: string) => {
        setViewerImageUrl(url);
        setImageViewerVisible(true);
    };

    const downloadImage = async (url: string) => {
        try {
            // Check if we already have permission (requested on mount)
            if (!hasGalleryPermission.current) {
                // Try once more in case user granted later via settings
                const { status } = await MediaLibrary.getPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert(
                        "Permission Required",
                        "Storage permission is needed to save images. Please enable it in your device settings."
                    );
                    return;
                }
                hasGalleryPermission.current = true;
            }

            // Use the new expo-file-system/next API
            // Paths.cache is a Directory object — use .uri to get the string path
            const filename = url.split("/").pop() || `image_${Date.now()}.jpg`;
            const destPath = `${Paths.cache.uri}/${filename}`;
            const destFile = new File(destPath);

            // Fetch the image as a blob and write it
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();

            await new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                    try {
                        const base64 = (reader.result as string).split(",")[1];
                        destFile.create();
                        destFile.write(base64, { encoding: "base64" });
                        await MediaLibrary.saveToLibraryAsync(destPath);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            Alert.alert("Downloaded", "Image saved to gallery.");
        } catch (err) {
            console.error("Download error:", err);
            Alert.alert("Error", "Failed to download image.");
        }
    };

    const openImageExternal = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open image."));
    };

    // ── Loading state ───────────────────────────────────────────────────────────
    if (loading || !detail) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    const u = detail.user;
    const gs = detail.generation_stats;
    const isActive = u.status === "active";
    const isAdmin = u.role === "admin";
    const costs = calcCostUSD(gs.total_input_tokens, gs.total_output_tokens);

    return (
        <View style={styles.container}>
            <AppHeader title="User Details" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* ── Profile Card ──────────────────────────────────────────── */}
                <View style={styles.profileCard}>
                    <View
                        style={[
                            styles.profileAvatar,
                            {
                                backgroundColor: isAdmin
                                    ? theme.colors.accent + "20"
                                    : theme.colors.surfaceElevated,
                            },
                        ]}
                    >
                        <AppText
                            style={[
                                styles.profileAvatarText,
                                isAdmin && { color: theme.colors.accent },
                            ]}
                        >
                            {u.name.charAt(0).toUpperCase()}
                        </AppText>
                    </View>
                    <View style={styles.profileInfo}>
                        <View style={styles.nameRow}>
                            <AppText style={styles.profileName}>{u.name}</AppText>
                            {isAdmin && (
                                <View style={styles.adminBadge}>
                                    <AppText style={styles.adminBadgeText}>Admin</AppText>
                                </View>
                            )}
                        </View>
                        <AppText style={styles.profileEmail}>{u.email}</AppText>
                        {u.phone ? (
                            <AppText style={styles.profileMeta}>📞 {u.phone}</AppText>
                        ) : null}
                        <AppText style={styles.profileMeta}>
                            Joined{" "}
                            {u.created_at
                                ? new Date(u.created_at).toLocaleDateString()
                                : "—"}
                        </AppText>
                    </View>
                </View>

                {/* Status Toggle */}
                {!isAdmin && (
                    <TouchableOpacity
                        style={[
                            styles.statusToggle,
                            isActive ? styles.statusActive : styles.statusSuspended,
                        ]}
                        onPress={toggleStatus}
                    >
                        <Ionicons
                            name={isActive ? "checkmark-circle" : "ban"}
                            size={18}
                            color={isActive ? theme.colors.success : theme.colors.error}
                        />
                        <AppText
                            style={[
                                styles.statusToggleText,
                                {
                                    color: isActive
                                        ? theme.colors.success
                                        : theme.colors.error,
                                },
                            ]}
                        >
                            {isActive
                                ? "Account Active — Tap to Suspend"
                                : "Account Suspended — Tap to Activate"}
                        </AppText>
                    </TouchableOpacity>
                )}

                {/* ── Generation Stats (simplified) ────────────────────────── */}
                <AppText style={styles.sectionTitle}>Generation Stats</AppText>
                <View style={styles.statsRow}>
                    <MiniStat label="Generations" value={gs.total_generations} />
                    <MiniStat label="Images" value={gs.total_images} />
                    <TouchableOpacity
                        style={styles.miniStat}
                        onPress={() => setTokenPopupVisible(true)}
                        activeOpacity={0.7}
                    >
                        <AppText style={styles.miniStatValue}>
                            {formatNumber(gs.total_tokens)}
                        </AppText>
                        <AppText style={styles.miniStatLabel}>Total Tokens</AppText>
                    </TouchableOpacity>
                </View>

                {/* ── Filters ──────────────────────────────────────────────── */}
                <AppText style={styles.sectionTitle}>
                    Generation History ({filteredGenerations.length}
                    {filteredGenerations.length !== genTotal
                        ? ` of ${genTotal}`
                        : ""}
                    )
                </AppText>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            filterCategory === "all" && styles.filterChipActive,
                        ]}
                        onPress={() => setFilterCategory("all")}
                    >
                        <AppText
                            style={[
                                styles.filterChipText,
                                filterCategory === "all" && styles.filterChipTextActive,
                            ]}
                        >
                            All Categories
                        </AppText>
                    </TouchableOpacity>
                    {allCategories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.filterChip,
                                filterCategory === cat && styles.filterChipActive,
                            ]}
                            onPress={() => setFilterCategory(cat)}
                        >
                            <AppText
                                style={[
                                    styles.filterChipText,
                                    filterCategory === cat && styles.filterChipTextActive,
                                ]}
                            >
                                {cat}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Sub-category Filter */}
                {allSubCategories.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                    >
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterSubCategory === "all" && styles.filterChipActive,
                            ]}
                            onPress={() => setFilterSubCategory("all")}
                        >
                            <AppText
                                style={[
                                    styles.filterChipText,
                                    filterSubCategory === "all" && styles.filterChipTextActive,
                                ]}
                            >
                                All Types
                            </AppText>
                        </TouchableOpacity>
                        {allSubCategories.map((sub) => (
                            <TouchableOpacity
                                key={sub}
                                style={[
                                    styles.filterChip,
                                    filterSubCategory === sub && styles.filterChipActive,
                                ]}
                                onPress={() => setFilterSubCategory(sub)}
                            >
                                <AppText
                                    style={[
                                        styles.filterChipText,
                                        filterSubCategory === sub && styles.filterChipTextActive,
                                    ]}
                                >
                                    {sub}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* ── Generation List ──────────────────────────────────────── */}
                {filteredGenerations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="images-outline"
                            size={36}
                            color={theme.colors.muted}
                        />
                        <AppText style={styles.emptyText}>No generations found</AppText>
                    </View>
                ) : (
                    filteredGenerations.map((g) => {
                        const gCosts = calcCostUSD(g.input_tokens, g.output_tokens);
                        return (
                            <View key={g.id} style={styles.genCard}>
                                {/* Header badges */}
                                <View style={styles.genHeader}>
                                    <View style={styles.genCategoryBadge}>
                                        <AppText style={styles.genCategoryText}>
                                            {g.category}
                                        </AppText>
                                    </View>
                                    {g.sub_category ? (
                                        <View
                                            style={[
                                                styles.genCategoryBadge,
                                                { backgroundColor: "#3B82F620" },
                                            ]}
                                        >
                                            <AppText
                                                style={[styles.genCategoryText, { color: "#3B82F6" }]}
                                            >
                                                {g.sub_category}
                                            </AppText>
                                        </View>
                                    ) : null}
                                    <View style={{ flex: 1 }} />
                                    <AppText style={styles.genDate}>
                                        {g.created_at
                                            ? new Date(g.created_at).toLocaleDateString()
                                            : "—"}
                                    </AppText>
                                </View>

                                {/* Footer */}
                                <View style={styles.genFooter}>
                                    <AppText style={styles.genMeta}>
                                        🖼 {g.total_images}
                                    </AppText>
                                    <AppText style={styles.genMeta}>
                                        🪙 {formatNumber(g.total_tokens)}
                                    </AppText>
                                    <AppText style={styles.genMeta}>
                                        {formatINR(gCosts.totalCost)}
                                    </AppText>
                                </View>

                                {/* Image thumbnails with actions */}
                                {g.result_urls.length > 0 && (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.thumbScroll}
                                    >
                                        {g.result_urls.map((url, idx) => {
                                            const fullUrl = `${backendURL}/${url}`;
                                            return (
                                                <View key={idx} style={styles.thumbContainer}>
                                                    <TouchableOpacity
                                                        onPress={() => openImageViewer(fullUrl)}
                                                        activeOpacity={0.85}
                                                    >
                                                        <Image
                                                            source={{ uri: fullUrl }}
                                                            style={styles.thumb}
                                                        />
                                                    </TouchableOpacity>
                                                    <View style={styles.thumbActions}>
                                                        <TouchableOpacity
                                                            style={styles.thumbBtn}
                                                            onPress={() => downloadImage(fullUrl)}
                                                        >
                                                            <Ionicons
                                                                name="download-outline"
                                                                size={12}
                                                                color={theme.colors.accent}
                                                            />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.thumbBtn}
                                                            onPress={() => openImageExternal(fullUrl)}
                                                        >
                                                            <Ionicons
                                                                name="open-outline"
                                                                size={12}
                                                                color={theme.colors.accent}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════════════════════
           TOKEN BREAKDOWN POPUP
         ═══════════════════════════════════════════════════════════════════════ */}
            <Modal
                visible={tokenPopupVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setTokenPopupVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setTokenPopupVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>Token Breakdown</AppText>
                            <TouchableOpacity
                                onPress={() => setTokenPopupVisible(false)}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={24}
                                    color={theme.colors.muted}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Tokens */}
                        <View style={styles.modalSection}>
                            <AppText style={styles.modalSectionTitle}>Tokens</AppText>
                            <View style={styles.modalRow}>
                                <AppText style={styles.modalLabel}>Input Tokens</AppText>
                                <AppText style={styles.modalValue}>
                                    {gs.total_input_tokens.toLocaleString()}
                                </AppText>
                            </View>
                            <View style={styles.modalRow}>
                                <AppText style={styles.modalLabel}>Output Tokens</AppText>
                                <AppText style={styles.modalValue}>
                                    {gs.total_output_tokens.toLocaleString()}
                                </AppText>
                            </View>
                            <View style={[styles.modalRow, styles.modalRowTotal]}>
                                <AppText style={styles.modalLabelBold}>Total Tokens</AppText>
                                <AppText style={styles.modalValueBold}>
                                    {gs.total_tokens.toLocaleString()}
                                </AppText>
                            </View>
                        </View>

                        {/* Cost in USD */}
                        <View style={styles.modalSection}>
                            <AppText style={styles.modalSectionTitle}>Cost (USD)</AppText>
                            <View style={styles.modalRow}>
                                <AppText style={styles.modalLabel}>
                                    Input (${costSettings.input_cost_per_million} / 1M)
                                </AppText>
                                <AppText style={styles.modalValue}>
                                    {formatUSD(costs.inputCost)}
                                </AppText>
                            </View>
                            <View style={styles.modalRow}>
                                <AppText style={styles.modalLabel}>
                                    Output (${costSettings.output_cost_per_million} / 1M)
                                </AppText>
                                <AppText style={styles.modalValue}>
                                    {formatUSD(costs.outputCost)}
                                </AppText>
                            </View>
                            <View style={[styles.modalRow, styles.modalRowTotal]}>
                                <AppText style={styles.modalLabelBold}>Total Cost</AppText>
                                <AppText style={styles.modalValueBold}>
                                    {formatUSD(costs.totalCost)}
                                </AppText>
                            </View>
                        </View>

                        {/* Cost in INR */}
                        <View style={styles.modalSection}>
                            <AppText style={styles.modalSectionTitle}>
                                Cost (INR) ≈ @₹{costSettings.usd_to_inr}/USD
                            </AppText>
                            <View style={styles.modalRow}>
                                <AppText style={styles.modalLabel}>Input</AppText>
                                <AppText style={styles.modalValue}>
                                    {formatINR(costs.inputCost)}
                                </AppText>
                            </View>
                            <View style={styles.modalRow}>
                                <AppText style={styles.modalLabel}>Output</AppText>
                                <AppText style={styles.modalValue}>
                                    {formatINR(costs.outputCost)}
                                </AppText>
                            </View>
                            <View style={[styles.modalRow, styles.modalRowTotal]}>
                                <AppText style={styles.modalLabelBold}>Total Cost</AppText>
                                <AppText
                                    style={[
                                        styles.modalValueBold,
                                        { color: theme.colors.accent },
                                    ]}
                                >
                                    {formatINR(costs.totalCost)}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ═══════════════════════════════════════════════════════════════════════
           FULL-SCREEN IMAGE VIEWER
         ═══════════════════════════════════════════════════════════════════════ */}
            <Modal
                visible={imageViewerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setImageViewerVisible(false)}
            >
                <View style={styles.viewerOverlay}>
                    {/* Close */}
                    <TouchableOpacity
                        style={styles.viewerClose}
                        onPress={() => setImageViewerVisible(false)}
                    >
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>

                    {/* Image */}
                    <Image
                        source={{ uri: viewerImageUrl }}
                        style={styles.viewerImage}
                        resizeMode="contain"
                    />

                    {/* Bottom actions — Download + Open only */}
                    <View style={styles.viewerActions}>
                        <TouchableOpacity
                            style={styles.viewerBtn}
                            onPress={() => downloadImage(viewerImageUrl)}
                        >
                            <Ionicons name="download-outline" size={22} color="#FFF" />
                            <AppText style={styles.viewerBtnText}>Download</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.viewerBtn}
                            onPress={() => openImageExternal(viewerImageUrl)}
                        >
                            <Ionicons name="open-outline" size={22} color="#FFF" />
                            <AppText style={styles.viewerBtnText}>Open</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.miniStat}>
            <AppText style={styles.miniStatValue}>{formatNumber(value)}</AppText>
            <AppText style={styles.miniStatLabel}>{label}</AppText>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { justifyContent: "center", alignItems: "center" },
    content: {
        padding: theme.spacing.screenPadding,
        paddingBottom: theme.spacing.xl,
    },

    // Profile
    profileCard: {
        flexDirection: "row",
        gap: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
    },
    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    profileAvatarText: {
        ...theme.typography.title,
        fontSize: 22,
        color: theme.colors.primary,
    },
    profileInfo: { flex: 1, gap: 2 },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
    },
    profileName: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 16,
    },
    adminBadge: {
        backgroundColor: theme.colors.accent + "18",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    adminBadgeText: {
        ...theme.typography.caption,
        color: theme.colors.accent,
        fontWeight: "700",
        fontSize: 9,
    },
    profileEmail: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
    },
    profileMeta: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        fontSize: 10,
    },

    // Status
    statusToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginTop: theme.spacing.md,
    },
    statusActive: { backgroundColor: theme.colors.success + "12" },
    statusSuspended: { backgroundColor: theme.colors.error + "12" },
    statusToggleText: {
        ...theme.typography.bodyMedium,
        fontWeight: "600",
        fontSize: 13,
    },

    // Section title
    sectionTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },

    // Stats
    statsRow: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    miniStat: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.sm,
        alignItems: "center",
    },
    miniStatValue: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 16,
    },
    miniStatLabel: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        fontSize: 10,
        marginTop: 2,
    },

    // Filters
    filterScroll: { marginBottom: theme.spacing.sm },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.xs,
    },
    filterChipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    filterChipText: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        fontWeight: "600",
        fontSize: 14,
        textTransform: "capitalize",
    },
    filterChipTextActive: { color: theme.colors.white },

    // Generation cards
    genCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    genHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
    },
    genCategoryBadge: {
        backgroundColor: theme.colors.accentLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    genCategoryText: {
        ...theme.typography.caption,
        color: theme.colors.accent,
        fontWeight: "700",
        fontSize: 14,
    },
    genDate: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        fontSize: 11.5,
    },
    genPrompt: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginTop: 2,
    },
    genFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        marginTop: theme.spacing.xs,
        flexWrap: "wrap",
    },
    genMeta: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        fontSize: 12.5,
    },
    genStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    genComplete: { backgroundColor: theme.colors.success + "15" },
    genFailed: { backgroundColor: theme.colors.error + "15" },
    genStatusText: {
        ...theme.typography.caption,
        fontWeight: "600",
        fontSize: 9,
    },

    // Thumbnails
    thumbScroll: { marginTop: theme.spacing.sm },
    thumbContainer: { marginRight: 10, alignItems: "center" },
    thumb: {
        width: 72,
        height: 72,
        borderRadius: 10,
        backgroundColor: theme.colors.surfaceElevated,
    },
    thumbActions: {
        flexDirection: "row",
        gap: 6,
        marginTop: 4,
    },
    thumbBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center",
        alignItems: "center",
    },

    // Empty
    emptyState: {
        alignItems: "center",
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    emptyText: { ...theme.typography.body, color: theme.colors.muted },

    // ── Token Popup Modal ──────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing.screenPadding,
    },
    modalContent: {
        width: "100%",
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        maxHeight: SCREEN_H * 0.75,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    modalTitle: {
        ...theme.typography.title,
        color: theme.colors.primary,
        fontSize: 18,
    },
    modalSection: {
        marginBottom: theme.spacing.md,
    },
    modalSectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        fontWeight: "700",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: theme.spacing.xs,
    },
    modalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
    },
    modalRowTotal: {
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        marginTop: 4,
        paddingTop: 8,
    },
    modalLabel: {
        ...theme.typography.body,
        color: theme.colors.secondary,
        fontSize: 13,
    },
    modalValue: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontSize: 13,
    },
    modalLabelBold: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 14,
    },
    modalValueBold: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 14,
    },

    // ── Image Viewer Modal ─────────────────────────────────────────────────────
    viewerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.92)",
        justifyContent: "center",
        alignItems: "center",
    },
    viewerClose: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    viewerImage: {
        width: SCREEN_W - 32,
        height: SCREEN_H * 0.65,
    },
    viewerActions: {
        flexDirection: "row",
        gap: theme.spacing.xl,
        position: "absolute",
        bottom: 60,
    },
    viewerBtn: { alignItems: "center", gap: 4 },
    viewerBtnText: {
        ...theme.typography.caption,
        color: "#FFF",
        fontSize: 11,
    },
});
