import { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import { theme } from "../../theme/theme";
import { fetchUsers, updateUserStatus, AdminUser } from "../../services/adminApi";

export default function AdminUsersScreen({ navigation }: any) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUsers = useCallback(
        async (p = 1, s = search) => {
            try {
                const data = await fetchUsers(p, 20, s);
                setUsers(data.users);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                setPage(p);
            } catch (err) {
                console.error("Load users error:", err);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [search]
    );

    useEffect(() => {
        loadUsers();
    }, []);

    // Debounced live search — fires 300ms after user stops typing
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            loadUsers(1, search);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search]);

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers(1);
    };

    const toggleStatus = (u: AdminUser) => {
        const newStatus = u.status === "active" ? "suspended" : "active";
        Alert.alert(
            `${newStatus === "suspended" ? "Suspend" : "Activate"} User`,
            `Are you sure you want to ${newStatus === "suspended" ? "suspend" : "activate"} ${u.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: newStatus === "suspended" ? "destructive" : "default",
                    onPress: async () => {
                        try {
                            await updateUserStatus(u.id, newStatus);
                            loadUsers(page);
                        } catch (err) {
                            Alert.alert("Error", "Failed to update status");
                        }
                    },
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: AdminUser }) => {
        const isActive = item.status === "active";
        const isAdmin = item.role === "admin";
        return (
            <TouchableOpacity
                style={styles.userCard}
                onPress={() => navigation.navigate("AdminUserDetail", { userId: item.id })}
                activeOpacity={0.8}
            >
                <View style={styles.userRow}>
                    {/* Avatar circle */}
                    <View style={[styles.avatar, { backgroundColor: isAdmin ? theme.colors.accent + "20" : theme.colors.surfaceElevated }]}>
                        <AppText style={[styles.avatarText, isAdmin && { color: theme.colors.accent }]}>
                            {item.name.charAt(0).toUpperCase()}
                        </AppText>
                    </View>

                    {/* Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <AppText style={styles.userName} numberOfLines={1}>{item.name}</AppText>
                            {isAdmin && (
                                <View style={styles.adminBadge}>
                                    <AppText style={styles.adminBadgeText}>Admin</AppText>
                                </View>
                            )}
                        </View>
                        <AppText style={styles.userEmail} numberOfLines={1}>{item.email}</AppText>
                        <AppText style={styles.userMeta}>
                            {item.phone ? `📞 ${item.phone}  •  ` : ""}
                            Joined {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                        </AppText>
                    </View>

                    {/* Status toggle */}
                    {!isAdmin && (
                        <TouchableOpacity
                            style={[styles.statusBtn, isActive ? styles.statusActive : styles.statusSuspended]}
                            onPress={() => toggleStatus(item)}
                        >
                            <Ionicons
                                name={isActive ? "checkmark-circle" : "ban"}
                                size={14}
                                color={isActive ? theme.colors.success : theme.colors.error}
                            />
                            <AppText style={[styles.statusText, { color: isActive ? theme.colors.success : theme.colors.error }]}>
                                {isActive ? "Active" : "Suspended"}
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
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
            <AppHeader title="Manage Users" onBack={() => navigation.goBack()} />

            {/* Search */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={theme.colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    placeholderTextColor={theme.colors.muted}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                    autoCapitalize="none"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearch(""); loadUsers(1, ""); }}>
                        <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
                    </TouchableOpacity>
                )}
            </View>

            <AppText style={styles.resultCount}>{total} users found</AppText>

            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color={theme.colors.muted} />
                        <AppText style={styles.emptyText}>No users found</AppText>
                    </View>
                }
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                        disabled={page <= 1}
                        onPress={() => loadUsers(page - 1)}
                    >
                        <Ionicons name="chevron-back" size={18} color={page <= 1 ? theme.colors.muted : theme.colors.primary} />
                    </TouchableOpacity>
                    <AppText style={styles.pageText}>Page {page} of {totalPages}</AppText>
                    <TouchableOpacity
                        style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                        disabled={page >= totalPages}
                        onPress={() => loadUsers(page + 1)}
                    >
                        <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? theme.colors.muted : theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { justifyContent: "center", alignItems: "center" },

    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: theme.spacing.screenPadding,
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        height: 44,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.primary,
        padding: 0,
    },
    resultCount: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        marginHorizontal: theme.spacing.screenPadding,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    list: { padding: theme.spacing.screenPadding, paddingTop: theme.spacing.xs, gap: theme.spacing.sm },

    userCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
    },
    userRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: "center", alignItems: "center",
    },
    avatarText: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", fontSize: 16 },
    userInfo: { flex: 1, gap: 2 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
    userName: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", flex: 1 },
    adminBadge: {
        backgroundColor: theme.colors.accent + "18",
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    },
    adminBadgeText: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: "700", fontSize: 9 },
    userEmail: { ...theme.typography.caption, color: theme.colors.secondary },
    userMeta: { ...theme.typography.caption, color: theme.colors.muted, fontSize: 10 },

    statusBtn: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    statusActive: { backgroundColor: theme.colors.success + "15" },
    statusSuspended: { backgroundColor: theme.colors.error + "15" },
    statusText: { ...theme.typography.caption, fontWeight: "600", fontSize: 10 },

    emptyState: { alignItems: "center", paddingVertical: theme.spacing.xl, gap: theme.spacing.md },
    emptyText: { ...theme.typography.body, color: theme.colors.muted },

    pagination: {
        flexDirection: "row", justifyContent: "center", alignItems: "center",
        paddingVertical: theme.spacing.md, gap: theme.spacing.md,
        borderTopWidth: 1, borderColor: theme.colors.border,
    },
    pageBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: theme.colors.surface,
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: theme.colors.border,
    },
    pageBtnDisabled: { opacity: 0.4 },
    pageText: { ...theme.typography.caption, color: theme.colors.secondary },
});
