import { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    RefreshControl,
    Modal,
    Dimensions,
    Linking,
    ToastAndroid,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system/next";
import * as MediaLibrary from "expo-media-library";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import { theme } from "../theme/theme";
import { backendURL } from "../services/api";
import { fetchMyGenerations, UserGeneration } from "../services/userApi";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function UserHistoryScreen({ navigation }: any) {
    const [generations, setGenerations] = useState<UserGeneration[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterCategory, setFilterCategory] = useState("all");

    // Image viewer
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [viewerImageUrl, setViewerImageUrl] = useState("");

    // Gallery permission
    const hasGalleryPermission = useRef(false);

    const loadData = useCallback(async () => {
        try {
            const data = await fetchMyGenerations(filterCategory);
            // console.log("data", data);
            setGenerations(data.generations);
            setCategories(data.categories);
        } catch (err) {
            console.error("History load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filterCategory]);

    useEffect(() => {
        loadData();
        // Request gallery permission once
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            hasGalleryPermission.current = status === "granted";
        })();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // ── Image actions ─────────────────────────────────────────────────────────
    const openImageViewer = (url: string) => {
        console.log('Opening image viewer with URL:', url);
        if (url && url.trim()) {
            setViewerImageUrl(url);
            setImageViewerVisible(true);
        } else {
            console.error('Invalid image URL');
            if (Platform.OS === 'android') {
                ToastAndroid.show('Cannot open image', ToastAndroid.SHORT);
            }
        }
    };

    const downloadImage = async (url: string) => {
        try {
            if (!hasGalleryPermission.current) {
                const { status } = await MediaLibrary.getPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permission Required", "Storage permission is needed to save images.");
                    return;
                }
                hasGalleryPermission.current = true;
            }

            const filename = url.split("/").pop() || `image_${Date.now()}.jpg`;
            const destPath = `${Paths.cache.uri}/${filename}`;
            const destFile = new File(destPath);

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

            // WhatsApp-style toast notification
            if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity(
                    '✓ Image saved to gallery',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM
                );
            } else {
                Alert.alert("✓ Downloaded", "Image saved to gallery.");
            }
        } catch (err) {
            console.error("Download error:", err);
            if (Platform.OS === 'android') {
                ToastAndroid.show('✗ Download failed', ToastAndroid.SHORT);
            } else {
                Alert.alert("Error", "Failed to download image.");
            }
        }
    };

    const openImageExternal = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open image."));
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="My Creations" onBack={() => navigation.goBack()} />

            <FlatList
                data={generations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={10}
                initialNumToRender={5}
                ListHeaderComponent={
                    <FlatList
                        data={["all", ...categories]}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.filterChip, filterCategory === item && styles.filterChipActive]}
                                onPress={() => setFilterCategory(item)}
                            >
                                <AppText style={[styles.filterChipText, filterCategory === item && styles.filterChipTextActive]}>
                                    {item === "all" ? `All (${generations.length})` : item}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="images-outline" size={48} color={theme.colors.muted} />
                        <AppText style={styles.emptyTitle}>No creations yet</AppText>
                        <AppText style={styles.emptySubtitle}>
                            Your generated images from the last 30 days will appear here
                        </AppText>
                    </View>
                }
                renderItem={({ item: g }) => (
                    <View style={styles.genCard}>
                        {/* Header */}
                        <View style={styles.genHeader}>
                            <View style={styles.genCategoryBadge}>
                                <AppText style={styles.genCategoryText}>{g.category}</AppText>
                            </View>
                            {g.sub_category ? (
                                <View style={[styles.genCategoryBadge, { backgroundColor: "#3B82F620" }]}>
                                    <AppText style={[styles.genCategoryText, { color: "#3B82F6" }]}>
                                        {g.sub_category}
                                    </AppText>
                                </View>
                            ) : null}
                            <View style={{ flex: 1 }} />
                            <AppText style={styles.genDate}>
                                {g.created_at ? new Date(g.created_at).toLocaleDateString("en-IN", {
                                    day: "2-digit", month: "short",
                                }) : "—"}
                            </AppText>
                        </View>

                        {/* Image thumbnails */}
                        {g.result_urls.length > 0 && (
                            <FlatList
                                data={g.result_urls}
                                keyExtractor={(url, idx) => `${g.id}-${idx}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.thumbScroll}
                                renderItem={({ item: url, index: idx }) => {
                                    const fullUrl = `${backendURL}/${url}`;
                                    return (
                                        <View style={styles.thumbContainer}>
                                            <TouchableOpacity onPress={() => openImageViewer(fullUrl)} activeOpacity={0.85}>
                                                <Image 
                                                    source={{ uri: fullUrl }} 
                                                    style={styles.thumb}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                            <View style={styles.thumbActions}>
                                                <TouchableOpacity style={styles.thumbBtn} onPress={() => downloadImage(fullUrl)}>
                                                    <Ionicons name="download-outline" size={12} color={theme.colors.accent} />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.thumbBtn} onPress={() => openImageExternal(fullUrl)}>
                                                    <Ionicons name="open-outline" size={12} color={theme.colors.accent} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        )}
                    </View>
                )}
            />

            {/* ═══════════════════════════════════════════════════════════════════
                 FULL-SCREEN IMAGE VIEWER
               ═══════════════════════════════════════════════════════════════════ */}
            <Modal
                visible={imageViewerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setImageViewerVisible(false)}
            >
                <View style={styles.viewerOverlay}>
                    <TouchableOpacity style={styles.viewerClose} onPress={() => setImageViewerVisible(false)}>
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>

                    {viewerImageUrl ? (
                        <Image 
                            source={{ uri: viewerImageUrl }} 
                            style={styles.viewerImage} 
                            resizeMode="contain"
                            onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
                        />
                    ) : (
                        <View style={styles.viewerImage}>
                            <AppText style={{ color: '#FFF' }}>Image not available</AppText>
                        </View>
                    )}

                    <View style={styles.viewerActions}>
                        <TouchableOpacity style={styles.viewerBtn} onPress={() => downloadImage(viewerImageUrl)}>
                            <Ionicons name="download-outline" size={22} color="#FFF" />
                            <AppText style={styles.viewerBtnText}>Download</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.viewerBtn} onPress={() => openImageExternal(viewerImageUrl)}>
                            <Ionicons name="open-outline" size={22} color="#FFF" />
                            <AppText style={styles.viewerBtnText}>Open</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { justifyContent: "center", alignItems: "center" },
    content: { padding: theme.spacing.screenPadding, paddingBottom: theme.spacing.xl },

    infoBanner: {
        flexDirection: "row", alignItems: "center", gap: theme.spacing.sm,
        backgroundColor: theme.colors.accentLight,
        paddingHorizontal: theme.spacing.md, paddingVertical: 10,
        borderRadius: theme.radius.md, marginBottom: theme.spacing.sm,
    },
    infoBannerText: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: "600", fontSize: 12 },

    filterScroll: { marginBottom: theme.spacing.md },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: theme.colors.surface, borderWidth: 1,
        borderColor: theme.colors.border, marginRight: theme.spacing.xs,
    },
    filterChipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    filterChipText: {
        ...theme.typography.caption, color: theme.colors.secondary,
        fontWeight: "600", fontSize: 11, textTransform: "capitalize",
    },
    filterChipTextActive: { color: theme.colors.white },

    genCard: {
        backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
        borderWidth: 1, borderColor: theme.colors.border,
        padding: theme.spacing.md, marginBottom: theme.spacing.md, gap: theme.spacing.xs,
    },
    genHeader: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
    genCategoryBadge: {
        backgroundColor: theme.colors.accentLight,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    genCategoryText: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: "700", fontSize: 10 },
    genDate: { ...theme.typography.caption, color: theme.colors.muted, fontSize: 10 },

    genMeta: {
        flexDirection: "row", alignItems: "center", gap: theme.spacing.sm,
        marginTop: 2,
    },
    genMetaText: { ...theme.typography.caption, color: theme.colors.secondary, fontSize: 11 },
    genStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    genComplete: { backgroundColor: theme.colors.success + "15" },
    genFailed: { backgroundColor: theme.colors.error + "15" },
    genStatusText: { ...theme.typography.caption, fontWeight: "600", fontSize: 9 },

    thumbScroll: { marginTop: theme.spacing.sm },
    thumbContainer: { marginRight: 10, alignItems: "center" },
    thumb: {
        width: 100, height: 100, borderRadius: 12,
        backgroundColor: theme.colors.surfaceElevated,
    },
    thumbActions: { flexDirection: "row", gap: 6, marginTop: 4 },
    thumbBtn: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center", alignItems: "center",
    },

    emptyState: {
        alignItems: "center", paddingVertical: theme.spacing.xl * 2, gap: theme.spacing.sm,
    },
    emptyTitle: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700" },
    emptySubtitle: { ...theme.typography.caption, color: theme.colors.muted, textAlign: "center" },

    // Image viewer
    viewerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" },
    viewerClose: {
        position: "absolute", top: 50, right: 20, zIndex: 10,
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center", alignItems: "center",
    },
    viewerImage: { width: SCREEN_W - 32, height: SCREEN_H * 0.65 },
    viewerActions: { flexDirection: "row", gap: theme.spacing.xl, position: "absolute", bottom: 60 },
    viewerBtn: { alignItems: "center", gap: 4 },
    viewerBtnText: { ...theme.typography.caption, color: "#FFF", fontSize: 11 },
});
