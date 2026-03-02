import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import AppButton from "../../components/ui/AppButton";
import { theme } from "../../theme/theme";
import {
    fetchAdminContent,
    createAdminContent,
    updateAdminContent,
    deleteAdminContent,
    uploadAdminContentImage,
} from "../../services/adminApi";
import { getFullUrl } from "../../services/contentApi";

const catLabels = ["Side View", "Sitting", "Product View", "Key Highlights", "Before"];

const renderLocalImg = (uri: string) => uri.startsWith("file://") ? uri : getFullUrl(uri);

export default function AdminCategoriesScreen({ navigation }: any) {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const togglePrompt = (id: string, type: string) => {
        const key = `${id}_${type}`;
        setExpandedPrompts(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState("");
    const [title, setTitle] = useState("");
    const [icon, setIcon] = useState("");
    const [order, setOrder] = useState("");

    // Prompt states
    const [shootPrompt, setShootPrompt] = useState("");
    const [cataloguePrompt, setCataloguePrompt] = useState("");
    const [brandingPrompt, setBrandingPrompt] = useState("");

    // Dynamic array states
    const [photoshoots, setPhotoshoots] = useState<any[]>([]);
    const [brandings, setBrandings] = useState<any[]>([]);
    const [catalogues, setCatalogues] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAdminContent("categories");
            setCategories(res);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetForm = () => {
        setEditingId(null);
        setCategoryId("");
        setTitle("");
        setIcon("diamond");
        setOrder(String(categories.length + 1));
        setShootPrompt("");
        setCataloguePrompt("");
        setBrandingPrompt("");
        setPhotoshoots([{ id: "", before_url: "", after_url: "" }]);
        setBrandings([{ id: "", before_url: "", after_url: "" }]);
        setCatalogues([{ id: "", thumbnails: ["", "", "", "", ""] }]);
    };

    const handleAdd = () => {
        resetForm();
        setModalVisible(true);
    };

    const handleEdit = (cat: any) => {
        resetForm();
        setEditingId(cat._id);
        setCategoryId(cat.category_id || "");
        setTitle(cat.title || "");
        setIcon(cat.icon || "diamond");
        setOrder(String(cat.order || 0));

        // Safely extract prompts
        const p = cat.prompts || {};
        setShootPrompt(p.shoot || "");
        setCataloguePrompt(p.catalogue || "");
        setBrandingPrompt(p.branding || "");

        const items = cat.showcase_items || {};

        if (items.photoshoot && items.photoshoot.length > 0) {
            setPhotoshoots(items.photoshoot.map((p: any) => ({ ...p })));
        } else {
            setPhotoshoots([]);
        }

        if (items.branding && items.branding.length > 0) {
            setBrandings(items.branding.map((b: any) => ({ ...b })));
        } else {
            setBrandings([]);
        }

        if (items.catalogue && items.catalogue.length > 0) {
            setCatalogues(items.catalogue.map((c: any) => {
                const thumbs = c.thumbnails || [];
                const newCatImgs = ["", "", "", "", ""];
                for (let i = 0; i < 5; i++) {
                    if (thumbs[i]) newCatImgs[i] = thumbs[i].image_url || "";
                }
                return { id: c.id || "", thumbnails: newCatImgs };
            }));
        } else {
            setCatalogues([]);
        }

        setModalVisible(true);
    };

    const handleDelete = (cat: any) => {
        Alert.alert("Delete Category", `Are you sure you want to delete ${cat.title}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteAdminContent("categories", cat._id);
                        loadData();
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete item");
                    }
                },
            },
        ]);
    };

    const handlePickImage = async (setter: (uri: string) => void) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled) {
            setter(result.assets[0].uri);
        }
    };

    const processUpload = async (uri: string) => {
        if (!uri) return "";
        if (uri.startsWith("file://")) {
            try {
                const res = await uploadAdminContentImage(uri);
                return res.url;
            } catch (err) {
                console.error("Upload failed", err);
                return uri;
            }
        }
        return uri;
    };

    const handleSave = async () => {
        if (!categoryId || !title) {
            Alert.alert("Validation", "Category ID and Title are required.");
            return;
        }
        setSaving(true);
        try {
            const finalPhotoshoots = await Promise.all(photoshoots.map(async (ps, i) => ({
                id: ps.id || `${categoryId}_ps${i + 1}`,
                before_url: await processUpload(ps.before_url),
                after_url: await processUpload(ps.after_url),
            })));

            const finalBrandings = await Promise.all(brandings.map(async (br, i) => ({
                id: br.id || `${categoryId}_br${i + 1}`,
                before_url: await processUpload(br.before_url),
                after_url: await processUpload(br.after_url),
            })));

            const finalCatalogues = await Promise.all(catalogues.map(async (cat, i) => {
                const uploadedThumbs = await Promise.all(cat.thumbnails.map((img: string) => processUpload(img)));
                return {
                    id: cat.id || `${categoryId}_cat${i + 1}`,
                    thumbnails: uploadedThumbs.map((img, idx) => ({
                        label: catLabels[idx],
                        image_url: img
                    }))
                };
            }));

            const data = {
                category_id: categoryId,
                title: title,
                icon: icon,
                order: parseInt(order) || 0,
                subcategories: ["photoshoot", "catalogue", "branding"],
                prompts: {
                    shoot: shootPrompt,
                    catalogue: cataloguePrompt,
                    branding: brandingPrompt
                },
                showcase_items: {
                    photoshoot: finalPhotoshoots,
                    branding: finalBrandings,
                    catalogue: finalCatalogues
                }
            };

            if (editingId) {
                await updateAdminContent("categories", editingId, data);
            } else {
                await createAdminContent("categories", data);
            }

            setModalVisible(false);
            loadData();
        } catch (err) {
            Alert.alert("Error", "Failed to save category");
        } finally {
            setSaving(false);
        }
    };

    const renderImageCard = (url: string, label: string) => {
        if (!url) {
            return (
                <View style={styles.imageBoxEmpty}>
                    <Ionicons name="image-outline" size={24} color={theme.colors.muted} />
                    <AppText style={styles.imageBoxLabel} numberOfLines={1}>{label}</AppText>
                </View>
            );
        }
        return (
            <View style={styles.imageBox}>
                <Image source={{ uri: renderLocalImg(url) }} style={styles.showcaseImg} />
                <AppText style={styles.imageBoxLabel} numberOfLines={1}>{label}</AppText>
            </View>
        );
    };

    const renderCategory = ({ item }: { item: any }) => {
        const items = item.showcase_items || {};
        const isExpanded = expandedIds.has(item._id);

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={[styles.cardHeader, !isExpanded && { marginBottom: 0 }]}
                    onPress={() => toggleExpand(item._id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.titleRow, { flex: 1 }]}>
                        <View style={styles.iconCircle}>
                            <Ionicons name={(item.icon as any) || "grid"} size={20} color={theme.colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppText style={styles.cardTitle}>{item.title}</AppText>
                            <AppText style={styles.cardSubtitle}>ID: {item.category_id} • Order: {item.order}</AppText>
                        </View>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                            <Ionicons name="pencil" size={18} color={theme.colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.colors.error + "15" }]} onPress={() => handleDelete(item)}>
                            <Ionicons name="trash" size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                        <View style={[styles.iconBtn, { backgroundColor: "transparent", width: 24 }]}>
                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={22} color={theme.colors.secondary} />
                        </View>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View>
                        {/* Photoshoot section */}
                        {items.photoshoot && items.photoshoot.length > 0 && (
                            <View style={styles.showcaseSection}>
                                <AppText style={styles.sectionTitleSmall}>Photoshoot ({items.photoshoot.length})</AppText>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                                    {items.photoshoot.map((ps: any, i: number) => (
                                        <View key={i} style={styles.imgRow}>
                                            {renderImageCard(ps.before_url, `[P${i + 1}] Before`)}
                                            {renderImageCard(ps.after_url, `[P${i + 1}] After`)}
                                            <View style={styles.divider} />
                                        </View>
                                    ))}
                                </ScrollView>
                                {item.prompts?.shoot && (
                                    <TouchableOpacity
                                        style={styles.promptPreviewBox}
                                        onPress={() => togglePrompt(item._id, "shoot")}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: expandedPrompts.has(`${item._id}_shoot`) ? 4 : 0 }}>
                                            <AppText style={[styles.sectionTitleSmall, { marginBottom: 0 }]}>Shoot Prompt</AppText>
                                            <Ionicons name={expandedPrompts.has(`${item._id}_shoot`) ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.secondary} />
                                        </View>
                                        <AppText
                                            style={styles.promptPreviewText}
                                            numberOfLines={expandedPrompts.has(`${item._id}_shoot`) ? undefined : 2}
                                        >
                                            {item.prompts.shoot}
                                        </AppText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Catalogue section */}
                        {items.catalogue && items.catalogue.length > 0 && (
                            <View style={styles.showcaseSection}>
                                <AppText style={styles.sectionTitleSmall}>Catalogue ({items.catalogue.length} groups)</AppText>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                                    {items.catalogue.map((cr: any, i: number) => (
                                        <View key={i} style={styles.imgRow}>
                                            {cr.thumbnails?.map((thumb: any, idx: number) => (
                                                <View key={idx}>
                                                    {renderImageCard(thumb.image_url, thumb.label || `T${idx + 1}`)}
                                                </View>
                                            ))}
                                            <View style={styles.divider} />
                                        </View>
                                    ))}
                                </ScrollView>
                                {item.prompts?.catalogue && (
                                    <TouchableOpacity
                                        style={styles.promptPreviewBox}
                                        onPress={() => togglePrompt(item._id, "catalogue")}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: expandedPrompts.has(`${item._id}_catalogue`) ? 4 : 0 }}>
                                            <AppText style={[styles.sectionTitleSmall, { marginBottom: 0 }]}>Catalogue Prompt</AppText>
                                            <Ionicons name={expandedPrompts.has(`${item._id}_catalogue`) ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.secondary} />
                                        </View>
                                        <AppText
                                            style={styles.promptPreviewText}
                                            numberOfLines={expandedPrompts.has(`${item._id}_catalogue`) ? undefined : 2}
                                        >
                                            {item.prompts.catalogue}
                                        </AppText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}


                        {/* Branding section */}
                        {items.branding && items.branding.length > 0 && (
                            <View style={styles.showcaseSection}>
                                <AppText style={styles.sectionTitleSmall}>Branding ({items.branding.length})</AppText>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                                    {items.branding.map((br: any, i: number) => (
                                        <View key={i} style={styles.imgRow}>
                                            {renderImageCard(br.before_url, `[B${i + 1}] Before`)}
                                            {renderImageCard(br.after_url, `[B${i + 1}] After`)}
                                            <View style={styles.divider} />
                                        </View>
                                    ))}
                                </ScrollView>
                                {item.prompts?.branding && (
                                    <TouchableOpacity
                                        style={styles.promptPreviewBox}
                                        onPress={() => togglePrompt(item._id, "branding")}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: expandedPrompts.has(`${item._id}_branding`) ? 4 : 0 }}>
                                            <AppText style={[styles.sectionTitleSmall, { marginBottom: 0 }]}>Branding Prompt</AppText>
                                            <Ionicons name={expandedPrompts.has(`${item._id}_branding`) ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.secondary} />
                                        </View>
                                        <AppText
                                            style={styles.promptPreviewText}
                                            numberOfLines={expandedPrompts.has(`${item._id}_branding`) ? undefined : 2}
                                        >
                                            {item.prompts.branding}
                                        </AppText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Manage Categories" onBack={() => navigation.goBack()} />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={handleAdd}>
                <Ionicons name="add" size={28} color={theme.colors.white} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>{editingId ? "Edit Category" : "Add Category"}</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                            {/* Basic Info */}
                            <AppText style={styles.formTitle}>Basic Info</AppText>
                            <TextInput style={styles.input} placeholder="Category ID (e.g. jewelry)" value={categoryId} onChangeText={setCategoryId} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Title (e.g. Jewelry)" value={title} onChangeText={setTitle} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Ionicons Icon Name (e.g. diamond)" value={icon} onChangeText={setIcon} placeholderTextColor={theme.colors.muted} autoCapitalize="none" />
                            <TextInput style={styles.input} placeholder="Order (Number)" value={order} onChangeText={setOrder} keyboardType="numeric" placeholderTextColor={theme.colors.muted} />

                            {/* Prompts */}
                            <AppText style={styles.formTitle}>Custom Prompts</AppText>
                            <AppText style={styles.formTitle}> Photo Shoot </AppText>
                            <TextInput style={styles.inputMulti} placeholder="Shoot Prompt (Photoshoot)" value={shootPrompt} onChangeText={setShootPrompt} placeholderTextColor={theme.colors.muted} multiline />
                            <AppText style={styles.formTitle}> Catalogue </AppText>
                            <TextInput style={styles.inputMulti} placeholder="Catalogue Prompt (Variables: {model_pose})" value={cataloguePrompt} onChangeText={setCataloguePrompt} placeholderTextColor={theme.colors.muted} multiline />
                            <AppText style={styles.formTitle}> Branding </AppText>
                            <TextInput style={styles.inputMulti} placeholder="Branding Prompt (Style details)" value={brandingPrompt} onChangeText={setBrandingPrompt} placeholderTextColor={theme.colors.muted} multiline />

                            {/* Photoshoot Items */}
                            <View style={styles.arrayHeader}>
                                <AppText style={styles.formTitle}>Photoshoot Items</AppText>
                                <TouchableOpacity onPress={() => setPhotoshoots([...photoshoots, { id: "", before_url: "", after_url: "" }])}>
                                    <AppText style={{ color: theme.colors.accent, fontWeight: "600" }}>+ Add Photoshoot</AppText>
                                </TouchableOpacity>
                            </View>
                            {photoshoots.map((ps, idx) => (
                                <View key={idx} style={styles.dynamicBlock}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                        <AppText style={{ ...theme.typography.caption, fontWeight: "bold" }}>Item {idx + 1}</AppText>
                                        <TouchableOpacity onPress={() => { const p = [...photoshoots]; p.splice(idx, 1); setPhotoshoots(p); }}>
                                            <Ionicons name="trash" size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput style={styles.inputSmall} placeholder="Item ID (e.g. ps1)" value={ps.id} onChangeText={(t) => { const p = [...photoshoots]; p[idx].id = t; setPhotoshoots(p); }} placeholderTextColor={theme.colors.muted} />
                                    <View style={styles.imgRowForm}>
                                        <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage((uri) => { const p = [...photoshoots]; p[idx].before_url = uri; setPhotoshoots(p); })}>
                                            {ps.before_url ? <Image source={{ uri: renderLocalImg(ps.before_url) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                            <AppText style={styles.uploadBoxLabel}>Before</AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage((uri) => { const p = [...photoshoots]; p[idx].after_url = uri; setPhotoshoots(p); })}>
                                            {ps.after_url ? <Image source={{ uri: renderLocalImg(ps.after_url) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                            <AppText style={styles.uploadBoxLabel}>After</AppText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            {/* Branding Items */}
                            <View style={styles.arrayHeader}>
                                <AppText style={styles.formTitle}>Branding Items</AppText>
                                <TouchableOpacity onPress={() => setBrandings([...brandings, { id: "", before_url: "", after_url: "" }])}>
                                    <AppText style={{ color: theme.colors.accent, fontWeight: "600" }}>+ Add Branding</AppText>
                                </TouchableOpacity>
                            </View>
                            {brandings.map((br, idx) => (
                                <View key={idx} style={styles.dynamicBlock}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                        <AppText style={{ ...theme.typography.caption, fontWeight: "bold" }}>Item {idx + 1}</AppText>
                                        <TouchableOpacity onPress={() => { const b = [...brandings]; b.splice(idx, 1); setBrandings(b); }}>
                                            <Ionicons name="trash" size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput style={styles.inputSmall} placeholder="Item ID (e.g. br1)" value={br.id} onChangeText={(t) => { const b = [...brandings]; b[idx].id = t; setBrandings(b); }} placeholderTextColor={theme.colors.muted} />
                                    <View style={styles.imgRowForm}>
                                        <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage((uri) => { const b = [...brandings]; b[idx].before_url = uri; setBrandings(b); })}>
                                            {br.before_url ? <Image source={{ uri: renderLocalImg(br.before_url) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                            <AppText style={styles.uploadBoxLabel}>Before</AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage((uri) => { const b = [...brandings]; b[idx].after_url = uri; setBrandings(b); })}>
                                            {br.after_url ? <Image source={{ uri: renderLocalImg(br.after_url) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                            <AppText style={styles.uploadBoxLabel}>After</AppText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            {/* Catalogue Items */}
                            <View style={styles.arrayHeader}>
                                <AppText style={styles.formTitle}>Catalogue Sets (5 Thumbs)</AppText>
                                <TouchableOpacity onPress={() => setCatalogues([...catalogues, { id: "", thumbnails: ["", "", "", "", ""] }])}>
                                    <AppText style={{ color: theme.colors.accent, fontWeight: "600" }}>+ Add Catalogue Set</AppText>
                                </TouchableOpacity>
                            </View>
                            {catalogues.map((cat, idx) => (
                                <View key={idx} style={styles.dynamicBlock}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                        <AppText style={{ ...theme.typography.caption, fontWeight: "bold" }}>Set {idx + 1}</AppText>
                                        <TouchableOpacity onPress={() => { const c = [...catalogues]; c.splice(idx, 1); setCatalogues(c); }}>
                                            <Ionicons name="trash" size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput style={styles.inputSmall} placeholder="Set ID (e.g. cat1)" value={cat.id} onChangeText={(t) => { const c = [...catalogues]; c[idx].id = t; setCatalogues(c); }} placeholderTextColor={theme.colors.muted} />
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 10 }}>
                                        {cat.thumbnails.map((img: string, tIdx: number) => (
                                            <TouchableOpacity key={tIdx} style={styles.uploadBox} onPress={() => {
                                                handlePickImage((uri) => {
                                                    const c = [...catalogues];
                                                    c[idx].thumbnails[tIdx] = uri;
                                                    setCatalogues(c);
                                                });
                                            }}>
                                                {img ? <Image source={{ uri: renderLocalImg(img) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                                <AppText style={styles.uploadBoxLabel}>{catLabels[tIdx]}</AppText>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            ))}

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <AppButton
                            title="Save Category"
                            onPress={handleSave}
                            disabled={saving}
                            style={{ marginVertical: theme.spacing.md }}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    listContent: { padding: theme.spacing.screenPadding, paddingBottom: 100, gap: theme.spacing.md },

    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.md },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center", alignItems: "center",
    },
    cardTitle: { ...theme.typography.bodyMedium, fontWeight: "700" },
    cardSubtitle: { ...theme.typography.caption, color: theme.colors.secondary },
    cardActions: { flexDirection: "row", gap: 8 },
    iconBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center", alignItems: "center",
    },

    showcaseSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
    sectionTitleSmall: { ...theme.typography.caption, color: theme.colors.secondary, fontWeight: "600", marginBottom: 8 },
    imgRow: { flexDirection: "row", gap: 8 },
    imgRowForm: { flexDirection: "row", gap: 12 },
    imageBox: {
        width: 70, height: 90,
        borderRadius: 8, overflow: "hidden",
        backgroundColor: theme.colors.background,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    imageBoxEmpty: {
        width: 70, height: 90,
        borderRadius: 8, backgroundColor: theme.colors.surfaceElevated,
        borderWidth: 1, borderColor: theme.colors.border, borderStyle: "dashed",
        justifyContent: "center", alignItems: "center",
        padding: 4,
    },
    showcaseImg: { width: "100%", height: 70, resizeMode: "cover" },
    imageBoxLabel: { ...theme.typography.caption, fontSize: 9, textAlign: "center", marginTop: 4, color: theme.colors.secondary, paddingHorizontal: 2 },

    promptPreviewBox: {
        marginTop: 8, padding: 8, backgroundColor: theme.colors.surfaceElevated,
        borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border
    },
    promptPreviewText: {
        ...theme.typography.caption, color: theme.colors.secondary,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", fontSize: 10
    },

    divider: { width: 1, backgroundColor: theme.colors.border, height: "100%", marginHorizontal: 4 },

    fab: {
        position: "absolute", bottom: 30, right: 20, width: 56, height: 56,
        borderRadius: 28, backgroundColor: theme.colors.accent,
        justifyContent: "center", alignItems: "center", ...theme.shadows.glow,
    },

    modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl,
        padding: theme.spacing.screenPadding, height: "90%",
    },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
    modalTitle: { ...theme.typography.title, fontSize: 18 },
    formScroll: { flex: 1 },
    formTitle: { ...theme.typography.bodyMedium, fontWeight: "700" },

    arrayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12 },
    dynamicBlock: { backgroundColor: theme.colors.surfaceElevated, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border },

    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1, borderColor: theme.colors.border,
        padding: theme.spacing.md,
        color: theme.colors.primary,
        marginBottom: 12,
    },
    inputMulti: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1, borderColor: theme.colors.border,
        padding: theme.spacing.md,
        color: theme.colors.primary,
        marginBottom: 12,
        height: 200, textAlignVertical: "top"
    },
    inputArea: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1, borderColor: theme.colors.border,
        padding: theme.spacing.md,
        color: theme.colors.primary,
        marginBottom: 12,
        height: 80, textAlignVertical: "top"
    },
    inputSmall: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.sm,
        borderWidth: 1, borderColor: theme.colors.border,
        padding: 8, color: theme.colors.primary,
        marginBottom: 12, fontSize: 13,
    },

    uploadBox: {
        width: 80, height: 100,
        borderRadius: 8, backgroundColor: theme.colors.surfaceElevated,
        borderWidth: 1, borderColor: theme.colors.border, borderStyle: "dashed",
        justifyContent: "center", alignItems: "center",
        overflow: "hidden"
    },
    uploadImg: { width: "100%", height: "100%", position: "absolute", top: 0, left: 0 },
    uploadBoxLabel: {
        ...theme.typography.caption, fontSize: 9,
        color: theme.colors.primary, backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 4, borderRadius: 4, position: "absolute", bottom: 6
    }
});
