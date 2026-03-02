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

export default function AdminBackgroundsScreen({ navigation }: any) {
    const [backgrounds, setBackgrounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [bgId, setBgId] = useState("");
    const [label, setLabel] = useState("");
    const [color, setColor] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [order, setOrder] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAdminContent("backgrounds");
            setBackgrounds(res);
        } catch (err) {
            Alert.alert("Error", "Failed to load backgrounds");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAdd = () => {
        setEditingId(null);
        setBgId("");
        setLabel("");
        setColor("");
        setImageUrl("");
        setOrder(String(backgrounds.length + 1));
        setModalVisible(true);
    };

    const handleEdit = (mod: any) => {
        setEditingId(mod._id);
        setBgId(mod.bg_id || "");
        setLabel(mod.label || "");
        setColor(mod.color || "");
        setImageUrl(mod.image_url || "");
        setOrder(String(mod.order || 0));
        setModalVisible(true);
    };

    const handleDelete = (mod: any) => {
        Alert.alert("Delete Background", `Are you sure you want to delete ${mod.label}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteAdminContent("backgrounds", mod._id);
                        loadData();
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete item");
                    }
                },
            },
        ]);
    };

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
            setColor(""); // clear color if image is picked
        }
    };

    const processUpload = async (uri: string) => {
        if (!uri) return "";
        if (uri.startsWith("file://")) {
            try {
                const res = await uploadAdminContentImage(uri);
                return res.url;
            } catch (err) {
                return uri;
            }
        }
        return uri;
    };

    const handleSave = async () => {
        if (!bgId || !label) {
            Alert.alert("Validation", "Background ID and Label are required.");
            return;
        }
        setSaving(true);
        try {
            const uploadedImage = await processUpload(imageUrl);

            const data = {
                bg_id: bgId,
                label,
                color,
                image_url: uploadedImage,
                order: parseInt(order) || 0,
            };

            if (editingId) {
                await updateAdminContent("backgrounds", editingId, data);
            } else {
                await createAdminContent("backgrounds", data);
            }

            setModalVisible(false);
            loadData();
        } catch (err) {
            Alert.alert("Error", "Failed to save background");
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                    {item.image_url ? (
                        <Image source={{ uri: renderLocalImg(item.image_url) }} style={styles.thumbIcon} />
                    ) : item.color ? (
                        <View style={[styles.thumbIcon, { backgroundColor: item.color }]} />
                    ) : (
                        <View style={styles.thumbPlaceholder}>
                            <Ionicons name="color-palette" size={20} color={theme.colors.muted} />
                        </View>
                    )}
                    <View>
                        <AppText style={styles.cardTitle}>{item.label}</AppText>
                        <AppText style={styles.cardSubtitle}>ID: {item.bg_id}</AppText>
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
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Manage Backgrounds" onBack={() => navigation.goBack()} />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
            ) : (
                <FlatList
                    data={backgrounds}
                    renderItem={renderItem}
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
                            <AppText style={styles.modalTitle}>{editingId ? "Edit Background" : "Add Background"}</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                            <AppText style={styles.formTitle}>Basic Info</AppText>
                            <TextInput style={styles.input} placeholder="Background ID (e.g. bg-white)" value={bgId} onChangeText={setBgId} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Label (e.g. Pure White)" value={label} onChangeText={setLabel} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Order (Number)" value={order} onChangeText={setOrder} keyboardType="numeric" placeholderTextColor={theme.colors.muted} />

                            <AppText style={styles.formTitle}>Background Source</AppText>
                            <AppText style={{ ...theme.typography.caption, color: theme.colors.secondary, marginBottom: 8 }}>Provide EITHER a HEX Color OR an Image File</AppText>

                            <TextInput style={styles.input} placeholder="Color (e.g. #FFFFFF)" value={color} onChangeText={(t) => { setColor(t); setImageUrl(""); }} placeholderTextColor={theme.colors.muted} />
                            <AppText style={{ textAlign: "center", marginVertical: 8, color: theme.colors.muted }}>OR</AppText>

                            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
                                {imageUrl ? <Image source={{ uri: renderLocalImg(imageUrl) }} style={styles.uploadImg} /> : <Ionicons name="image" size={24} color={theme.colors.muted} />}
                                <AppText style={styles.uploadBoxLabel}>Upload Texture</AppText>
                            </TouchableOpacity>
                        </ScrollView>

                        <AppButton title="Save Background" onPress={handleSave} disabled={saving} style={{ marginVertical: theme.spacing.md }} />
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
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { flexDirection: "row", justifyContent: "space-between" },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    thumbIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.border, borderWidth: 1, borderColor: theme.colors.borderLight },
    thumbPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceElevated, justifyContent: "center", alignItems: "center" },
    cardTitle: { ...theme.typography.bodyMedium, fontWeight: "700" },
    cardSubtitle: { ...theme.typography.caption, color: theme.colors.secondary },
    cardActions: { flexDirection: "row", gap: 8 },
    iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.accentLight, justifyContent: "center", alignItems: "center" },
    fab: { position: "absolute", bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.accent, justifyContent: "center", alignItems: "center", ...theme.shadows.glow },
    modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.screenPadding, height: "85%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.md },
    modalTitle: { ...theme.typography.title, fontSize: 18 },
    formScroll: { flex: 1 },
    formTitle: { ...theme.typography.bodyMedium, fontWeight: "700", marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, color: theme.colors.primary, marginBottom: 12 },
    uploadBox: { width: "100%", height: 300, borderRadius: 12, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center", overflow: "hidden" },
    uploadImg: { width: "100%", height: "100%", position: "absolute", top: 0, left: 0, resizeMode: "cover" },
    uploadBoxLabel: { ...theme.typography.caption, color: theme.colors.primary, backgroundColor: "rgba(255,255,255,0.7)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, position: "absolute", bottom: 10 }
});
