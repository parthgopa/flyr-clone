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

const renderLocalImg = (uri: string) => uri.startsWith("file://") ? uri : getFullUrl(uri);

export default function AdminModelsScreen({ navigation }: any) {
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modelId, setModelId] = useState("");
    const [name, setName] = useState("");
    const [subType, setSubType] = useState<"photoshoot" | "catalogue" | "branding">("photoshoot");
    const [imageUrl, setImageUrl] = useState("");
    const [order, setOrder] = useState("");

    // Dynamic arrays
    const [photos, setPhotos] = useState<any[]>([]); // For catalogue
    const [poses, setPoses] = useState<any[]>([]);   // For branding

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAdminContent("models");
            setModels(res);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load models");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetForm = () => {
        setEditingId(null);
        setModelId("");
        setName("");
        setSubType("photoshoot");
        setImageUrl("");
        setOrder(String(models.length + 1));
        setPhotos([]);
        setPoses([]);
    };

    const handleAdd = () => {
        resetForm();
        setModalVisible(true);
    };

    const handleEdit = (mod: any) => {
        resetForm();
        setEditingId(mod._id);
        setModelId(mod.model_id || "");
        setName(mod.name || "");
        setSubType(mod.sub_type || "photoshoot");
        setImageUrl(mod.image_url || "");
        setOrder(String(mod.order || 0));
        setPhotos(mod.photos || []);
        setPoses(mod.poses || []);
        setModalVisible(true);
    };

    const handleDelete = (mod: any) => {
        Alert.alert("Delete Model", `Are you sure you want to delete ${mod.name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteAdminContent("models", mod._id);
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
        if (!modelId || !name) {
            Alert.alert("Validation", "Model ID and Name are required.");
            return;
        }
        setSaving(true);
        try {
            const uploadedThumb = await processUpload(imageUrl);

            // Upload nested images if any
            let finalPhotos = [...photos];
            if (subType === "catalogue") {
                for (let i = 0; i < finalPhotos.length; i++) {
                    finalPhotos[i].image_url = await processUpload(finalPhotos[i].image_url);
                }
            }
            let finalPoses = [...poses];
            if (subType === "branding") {
                for (let i = 0; i < finalPoses.length; i++) {
                    finalPoses[i].image_url = await processUpload(finalPoses[i].image_url);
                }
            }

            const data = {
                model_id: modelId,
                name,
                sub_type: subType,
                image_url: uploadedThumb,
                order: parseInt(order) || 0,
                photos: subType === "catalogue" ? finalPhotos : [],
                poses: subType === "branding" ? finalPoses : [],
                before_image_url: subType === "branding" ? uploadedThumb : null, // keep same for simplicity
                after_image_url: subType === "branding" ? uploadedThumb : null,
            };

            if (editingId) {
                await updateAdminContent("models", editingId, data);
            } else {
                await createAdminContent("models", data);
            }

            setModalVisible(false);
            loadData();
        } catch (err) {
            Alert.alert("Error", "Failed to save model");
        } finally {
            setSaving(false);
        }
    };

    // Subtype tabs for editing
    const SubTypeSelector = () => (
        <View style={styles.subTypeRow}>
            {["photoshoot", "catalogue", "branding"].map(type => (
                <TouchableOpacity
                    key={type}
                    style={[styles.subTypeBtn, subType === type && styles.subTypeBtnActive]}
                    onPress={() => setSubType(type as any)}
                >
                    <AppText style={[styles.subTypeBtnText, subType === type && styles.subTypeBtnTextActive]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </AppText>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderModel = ({ item }: { item: any }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                        {item.image_url ? (
                            <Image source={{ uri: renderLocalImg(item.image_url) }} style={styles.thumbIcon} />
                        ) : (
                            <View style={styles.thumbPlaceholder}>
                                <Ionicons name="person" size={20} color={theme.colors.muted} />
                            </View>
                        )}
                        <View>
                            <AppText style={styles.cardTitle}>{item.name}</AppText>
                            <AppText style={styles.cardSubtitle}>{item.sub_type} • ID: {item.model_id}</AppText>
                        </View>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                            <Ionicons name="pencil" size={18} color={theme.colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.colors.error + "15" }]} onPress={() => handleDelete(item)}>
                            <Ionicons name="trash" size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {item.sub_type === "catalogue" && item.photos?.length > 0 && (
                    <AppText style={styles.cardDetail}>{item.photos.length} catalogue photos</AppText>
                )}
                {item.sub_type === "branding" && item.poses?.length > 0 && (
                    <AppText style={styles.cardDetail}>{item.poses.length} branding poses</AppText>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Manage Models" onBack={() => navigation.goBack()} />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
            ) : (
                <FlatList
                    data={models}
                    renderItem={renderModel}
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
                            <AppText style={styles.modalTitle}>{editingId ? "Edit Model" : "Add Model"}</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                            <AppText style={styles.formTitle}>Model Type</AppText>
                            <SubTypeSelector />

                            <AppText style={styles.formTitle}>Basic Info</AppText>
                            <TextInput style={styles.input} placeholder="Model ID (e.g. m1, indian-man)" value={modelId} onChangeText={setModelId} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Name (e.g. Indian Man)" value={name} onChangeText={setName} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Order (Number)" value={order} onChangeText={setOrder} keyboardType="numeric" placeholderTextColor={theme.colors.muted} />

                            <AppText style={styles.formTitle}>Thumbnail Image</AppText>
                            <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage(setImageUrl)}>
                                {imageUrl ? <Image source={{ uri: renderLocalImg(imageUrl) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                <AppText style={styles.uploadBoxLabel}>Thumbnail</AppText>
                            </TouchableOpacity>

                            {/* Catalogue Dynamic Array */}
                            {subType === "catalogue" && (
                                <View style={{ marginTop: 20 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <AppText style={styles.formTitle}>Catalogue Photos</AppText>
                                        <TouchableOpacity onPress={() => setPhotos([...photos, { id: Date.now().toString(), label: "New View", type: "model", image_url: "" }])}>
                                            <AppText style={{ color: theme.colors.accent }}>+ Add Photo</AppText>
                                        </TouchableOpacity>
                                    </View>
                                    {photos.map((p, idx) => (
                                        <View key={idx} style={styles.dynamicRow}>
                                            <TouchableOpacity style={styles.uploadBoxSmall} onPress={() => {
                                                handlePickImage((uri) => {
                                                    const newPhotos = [...photos]; newPhotos[idx].image_url = uri; setPhotos(newPhotos);
                                                });
                                            }}>
                                                {p.image_url ? <Image source={{ uri: renderLocalImg(p.image_url) }} style={styles.uploadImg} /> : <Ionicons name="image" size={16} color={theme.colors.muted} />}
                                            </TouchableOpacity>
                                            <View style={{ flex: 1, gap: 8 }}>
                                                <TextInput style={styles.inputSmall} placeholder="Label" value={p.label} onChangeText={(t) => { const n = [...photos]; n[idx].label = t; setPhotos(n); }} placeholderTextColor={theme.colors.muted} />
                                                <TextInput style={styles.inputSmall} placeholder="Type (model/studio)" value={p.type} onChangeText={(t) => { const n = [...photos]; n[idx].type = t; setPhotos(n); }} placeholderTextColor={theme.colors.muted} />
                                            </View>
                                            <TouchableOpacity onPress={() => { const n = [...photos]; n.splice(idx, 1); setPhotos(n); }}>
                                                <Ionicons name="trash" size={20} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Branding Dynamic Array */}
                            {subType === "branding" && (
                                <View style={{ marginTop: 20 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <AppText style={styles.formTitle}>Branding Poses</AppText>
                                        <TouchableOpacity onPress={() => setPoses([...poses, { id: Date.now().toString(), label: "New View", image_url: "" }])}>
                                            <AppText style={{ color: theme.colors.accent }}>+ Add Pose</AppText>
                                        </TouchableOpacity>
                                    </View>
                                    {poses.map((p, idx) => (
                                        <View key={idx} style={styles.dynamicRow}>
                                            <TouchableOpacity style={styles.uploadBoxSmall} onPress={() => {
                                                handlePickImage((uri) => {
                                                    const newPoses = [...poses]; newPoses[idx].image_url = uri; setPoses(newPoses);
                                                });
                                            }}>
                                                {p.image_url ? <Image source={{ uri: renderLocalImg(p.image_url) }} style={styles.uploadImg} /> : <Ionicons name="image" size={16} color={theme.colors.muted} />}
                                            </TouchableOpacity>
                                            <View style={{ flex: 1, justifyContent: "center" }}>
                                                <TextInput style={styles.inputSmall} placeholder="Label (e.g. Front View)" value={p.label} onChangeText={(t) => { const n = [...poses]; n[idx].label = t; setPoses(n); }} placeholderTextColor={theme.colors.muted} />
                                            </View>
                                            <TouchableOpacity onPress={() => { const n = [...poses]; n.splice(idx, 1); setPoses(n); }} style={{ justifyContent: "center" }}>
                                                <Ionicons name="trash" size={20} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <AppButton title="Save Model" onPress={handleSave} disabled={saving} style={{ marginVertical: theme.spacing.md }} />
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
        backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
        padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between" },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    thumbIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceElevated },
    thumbPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceElevated, justifyContent: "center", alignItems: "center" },
    cardTitle: { ...theme.typography.bodyMedium, fontWeight: "700" },
    cardSubtitle: { ...theme.typography.caption, color: theme.colors.secondary, textTransform: "capitalize" },
    cardDetail: { ...theme.typography.caption, color: theme.colors.muted, marginTop: 8 },
    cardActions: { flexDirection: "row", gap: 8 },
    iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.accentLight, justifyContent: "center", alignItems: "center" },

    fab: {
        position: "absolute", bottom: 30, right: 20, width: 56, height: 56,
        borderRadius: 28, backgroundColor: theme.colors.accent,
        justifyContent: "center", alignItems: "center", ...theme.shadows.glow,
    },

    modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: {
        backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl, padding: theme.spacing.screenPadding, height: "90%",
    },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
    modalTitle: { ...theme.typography.title, fontSize: 18 },
    formScroll: { flex: 1 },
    formTitle: { ...theme.typography.bodyMedium, fontWeight: "700", marginBottom: 8, marginTop: 12 },

    subTypeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    subTypeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center" },
    subTypeBtnActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    subTypeBtnText: { ...theme.typography.caption, color: theme.colors.primary },
    subTypeBtnTextActive: { color: theme.colors.white, fontWeight: "bold" },

    input: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, color: theme.colors.primary, marginBottom: 12 },
    inputSmall: { backgroundColor: theme.colors.surface, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, padding: 8, color: theme.colors.primary, fontSize: 12 },

    uploadBox: { width: 90, height: 90, borderRadius: 12, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center", overflow: "hidden" },
    uploadBoxSmall: { width: 60, height: 60, borderRadius: 8, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center", overflow: "hidden" },
    uploadImg: { width: "100%", height: "100%", position: "absolute", top: 0, left: 0 },
    uploadBoxLabel: { ...theme.typography.caption, fontSize: 10, color: theme.colors.primary, backgroundColor: "rgba(255,255,255,0.7)", paddingHorizontal: 4, borderRadius: 4, position: "absolute", bottom: 6 },

    dynamicRow: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12, padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }
});
