import { useState, useEffect, useCallback } from "react";
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

const COLLECTIONS = [
    { id: "categories", label: "Categories" },
    { id: "models", label: "Models" },
    { id: "backgrounds", label: "Backgrounds" },
    { id: "prompts", label: "Prompts" },
];

export default function AdminContentScreen({ navigation }: any) {
    const [selectedTab, setSelectedTab] = useState(COLLECTIONS[0].id);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [jsonInput, setJsonInput] = useState("");
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async (collection: string) => {
        setLoading(true);
        try {
            const res = await fetchAdminContent(collection);
            setData(res);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load content");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(selectedTab);
    }, [selectedTab, loadData]);

    const handleTabChange = (tabId: string) => {
        setSelectedTab(tabId);
    };

    const handleAdd = () => {
        setEditingItem(null);
        // Provide a basic template based on collection
        const template = { id: "", name: "" };
        setJsonInput(JSON.stringify(template, null, 2));
        setModalVisible(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        // Remove _id from display as we use id string mostly, but wait, mongodb gave it back as _id
        const itemCopy = { ...item };
        setJsonInput(JSON.stringify(itemCopy, null, 2));
        setModalVisible(true);
    };

    const handleDelete = (item: any) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAdminContent(selectedTab, item._id);
                            loadData(selectedTab);
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete item");
                        }
                    },
                },
            ]
        );
    };

    const handleSave = async () => {
        let parsedData: any;
        try {
            parsedData = JSON.parse(jsonInput);
        } catch (err) {
            Alert.alert("Invalid JSON", "Please fix errors in JSON formatting.");
            return;
        }

        setSaving(true);
        try {
            if (editingItem) {
                await updateAdminContent(selectedTab, editingItem._id, parsedData);
            } else {
                await createAdminContent(selectedTab, parsedData);
            }
            setModalVisible(false);
            loadData(selectedTab);
        } catch (err) {
            Alert.alert("Error", "Failed to save item");
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const title = item.name || item.label || item.id || item.category || "Unnamed Item";
        const subtitle = item.sub_type || item.type || item.sub_category || `ID: ${item.id}`;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleWrap}>
                        <AppText style={styles.cardTitle}>{title}</AppText>
                        <AppText style={styles.cardSubtitle}>{subtitle}</AppText>
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
                <AppText style={styles.cardPreview} numberOfLines={2}>
                    {JSON.stringify(item).substring(0, 100)}...
                </AppText>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Content Management" onBack={() => navigation.goBack()} />

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {COLLECTIONS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
                        onPress={() => handleTabChange(tab.id)}
                    >
                        <AppText style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
                            {tab.label}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <AppText style={{ color: theme.colors.muted }}>No items found.</AppText>
                        </View>
                    }
                />
            )}

            {/* Add Button */}
            <TouchableOpacity style={styles.fab} onPress={handleAdd}>
                <Ionicons name="add" size={28} color={theme.colors.white} />
            </TouchableOpacity>

            {/* Editor Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>
                                {editingItem ? "Edit Item" : "Add Item"}
                            </AppText>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <AppText style={styles.modalCaption}>
                            Edit the fields in JSON format below.
                        </AppText>

                        <TextInput
                            style={styles.jsonInput}
                            multiline
                            textAlignVertical="top"
                            value={jsonInput}
                            onChangeText={setJsonInput}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <AppButton
                            title="Save Content"
                            onPress={handleSave}
                            disabled={saving}
                            style={{ marginTop: theme.spacing.md }}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: theme.spacing.screenPadding,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceElevated,
    },
    tabActive: {
        backgroundColor: theme.colors.accent,
    },
    tabText: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        fontWeight: "600",
    },
    tabTextActive: {
        color: theme.colors.white,
    },
    listContent: {
        padding: theme.spacing.screenPadding,
        paddingBottom: 100, // space for fab
        gap: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: theme.spacing.xs,
    },
    cardTitleWrap: {
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
    },
    cardSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.accent,
        marginTop: 2,
    },
    cardActions: {
        flexDirection: "row",
        gap: 8,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center",
        alignItems: "center",
    },
    cardPreview: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        marginTop: theme.spacing.xs,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        fontSize: 10,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.accent,
        justifyContent: "center",
        alignItems: "center",
        ...theme.shadows.glow,
    },
    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: theme.spacing.screenPadding,
        height: "85%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.sm,
    },
    modalTitle: {
        ...theme.typography.title,
        fontSize: 18,
    },
    modalCaption: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.md,
    },
    jsonInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        color: theme.colors.primary,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        fontSize: 12,
    },
});
