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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import AppButton from "../../components/ui/AppButton";
import { theme } from "../../theme/theme";
import {
    fetchAdminContent,
    createAdminContent,
    updateAdminContent,
    deleteAdminContent,
} from "../../services/adminApi";

export default function AdminPromptsScreen({ navigation }: any) {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [promptId, setPromptId] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [order, setOrder] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAdminContent("prompts");
            // Transform the database keys to match your UI keys
            const mappedData = res.map((item: any) => ({
                ...item,
                id: item.name,           // Map 'name' from DB to 'id' for UI
                system_prompt: item.content, // Map 'content' from DB to 'system_prompt'
            }));
            console.log(mappedData);
            setPrompts(mappedData);
        } catch (err) {
            Alert.alert("Error", "Failed to load prompts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAdd = () => {
        setEditingId(null);
        setPromptId("");
        setSystemPrompt("");
        setOrder(String(prompts.length + 1));
        setModalVisible(true);
    };

    const handleEdit = (mod: any) => {
        setEditingId(mod._id);
        setPromptId(mod.id || "");
        setSystemPrompt(mod.system_prompt || "");
        setOrder(String(mod.order || 0));
        setModalVisible(true);
    };

    const handleDelete = (mod: any) => {
        Alert.alert("Delete Prompt", `Are you sure you want to delete ${mod.id}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteAdminContent("prompts", mod._id);
                        loadData();
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete item");
                    }
                },
            },
        ]);
    };

    const handleSave = async () => {
        if (!promptId || !systemPrompt) {
            Alert.alert("Validation", "Prompt ID and System Prompt are required.");
            return;
        }
        setSaving(true);
        try {
            const data = {
                id: promptId,
                system_prompt: systemPrompt,
                order: parseInt(order) || 0,
            };

            if (editingId) {
                await updateAdminContent("prompts", editingId, data);
            } else {
                await createAdminContent("prompts", data);
            }

            setModalVisible(false);
            loadData();
        } catch (err) {
            Alert.alert("Error", "Failed to save prompt");
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isExpanded = expandedIds.has(item._id);

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(item._id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.titleRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppText style={styles.cardTitle}>{item.id}</AppText>
                            <AppText style={styles.cardSubtitle} numberOfLines={isExpanded ? undefined : 2}>
                                {item.system_prompt}
                            </AppText>
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
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Manage Prompts" onBack={() => navigation.goBack()} />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
            ) : (
                <FlatList
                    data={prompts}
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
                            <AppText style={styles.modalTitle}>{editingId ? "Edit Prompt" : "Add Prompt"}</AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                            <AppText style={styles.formTitle}>Prompt Info</AppText>
                            <TextInput style={styles.input} placeholder="Prompt ID (e.g. fashion_shoot)" value={promptId} onChangeText={setPromptId} placeholderTextColor={theme.colors.muted} />
                            <TextInput style={styles.input} placeholder="Order (Number)" value={order} onChangeText={setOrder} keyboardType="numeric" placeholderTextColor={theme.colors.muted} />

                            <AppText style={styles.formTitle}>System Prompt Text</AppText>
                            <TextInput
                                style={[styles.input, { height: 200, textAlignVertical: "top" }]}
                                placeholder="Enter the system prompt instructions here..."
                                value={systemPrompt}
                                onChangeText={setSystemPrompt}
                                placeholderTextColor={theme.colors.muted}
                                multiline
                            />
                        </ScrollView>

                        <AppButton title="Save Prompt" onPress={handleSave} disabled={saving} style={{ marginVertical: theme.spacing.md }} />
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
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    titleRow: { flexDirection: "row", gap: 12, flex: 1, paddingRight: 8 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.accentLight, justifyContent: "center", alignItems: "center" },
    cardTitle: { ...theme.typography.bodyMedium, fontWeight: "700" },
    cardSubtitle: { ...theme.typography.caption, color: theme.colors.secondary, marginTop: 4, lineHeight: 16 },
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
});
