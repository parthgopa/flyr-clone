import { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/ui/AppText";
import AppHeader from "../components/ui/AppHeader";
import { theme } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import { fetchMyProfile, UserProfile } from "../services/userApi";

export default function UserProfileScreen({ navigation }: any) {
    const { logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            const data = await fetchMyProfile();
            setProfile(data);
        } catch (err) {
            console.error("Profile load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
    };

    if (loading || !profile) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader title="My Profile" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Avatar Card */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarCircle}>
                        <AppText style={styles.avatarText}>
                            {profile.name.charAt(0).toUpperCase()}
                        </AppText>
                    </View>
                    <AppText style={styles.userName}>{profile.name}</AppText>
                    <AppText style={styles.userEmail}>{profile.email}</AppText>
                    <View style={[styles.statusBadge, profile.status === "active" ? styles.statusActive : styles.statusSuspended]}>
                        <View style={[styles.statusDot, { backgroundColor: profile.status === "active" ? theme.colors.success : theme.colors.error }]} />
                        <AppText style={[styles.statusText, { color: profile.status === "active" ? theme.colors.success : theme.colors.error }]}>
                            {profile.status === "active" ? "Active" : "Suspended"}
                        </AppText>
                    </View>
                </View>

                {/* Info Rows */}
                <AppText style={styles.sectionTitle}>Account Details</AppText>
                <View style={styles.infoCard}>
                    <InfoRow icon="person-outline" label="Full Name" value={profile.name} />
                    <View style={styles.divider} />
                    <InfoRow icon="mail-outline" label="Email" value={profile.email} />
                    {profile.phone ? (
                        <>
                            <View style={styles.divider} />
                            <InfoRow icon="call-outline" label="Phone" value={profile.phone} />
                        </>
                    ) : null}
                    <View style={styles.divider} />
                    <InfoRow
                        icon="calendar-outline"
                        label="Member Since"
                        value={profile.created_at
                            ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "long", year: "numeric",
                            })
                            : "—"}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
                    <AppText style={styles.logoutText}>Log Out</AppText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
                <Ionicons name={icon as any} size={18} color={theme.colors.accent} />
                <AppText style={styles.infoLabel}>{label}</AppText>
            </View>
            <AppText style={styles.infoValue} numberOfLines={1}>{value}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { justifyContent: "center", alignItems: "center" },
    content: { padding: theme.spacing.screenPadding, paddingBottom: theme.spacing.xl },

    avatarCard: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1, borderColor: theme.colors.border,
        paddingVertical: theme.spacing.lg,
        gap: 4,
    },
    avatarCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center", alignItems: "center",
        marginBottom: theme.spacing.sm,
    },
    avatarText: { ...theme.typography.title, fontSize: 28, color: theme.colors.accent },
    userName: { ...theme.typography.title, color: theme.colors.primary, fontSize: 20 },
    userEmail: { ...theme.typography.caption, color: theme.colors.secondary },
    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
        marginTop: theme.spacing.xs,
    },
    statusActive: { backgroundColor: theme.colors.success + "12" },
    statusSuspended: { backgroundColor: theme.colors.error + "12" },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { ...theme.typography.caption, fontWeight: "600", fontSize: 11 },

    sectionTitle: {
        ...theme.typography.bodyMedium, color: theme.colors.primary,
        fontWeight: "700", marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm,
    },

    infoCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1, borderColor: theme.colors.border,
        padding: theme.spacing.md,
    },
    infoRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: 10,
    },
    infoRowLeft: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
    infoLabel: { ...theme.typography.body, color: theme.colors.secondary, fontSize: 13 },
    infoValue: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "600", fontSize: 13, flex: 1, textAlign: "right" },
    divider: { height: 1, backgroundColor: theme.colors.border },

    logoutBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: theme.spacing.sm,
        marginTop: theme.spacing.xl,
        backgroundColor: theme.colors.error + "10",
        paddingVertical: 14, borderRadius: theme.radius.md,
    },
    logoutText: { ...theme.typography.bodyMedium, color: theme.colors.error, fontWeight: "700" },
});
