import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Pressable,
} from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./ui/AppText";
import { theme } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.75;

interface SidebarDrawerProps {
    visible: boolean;
    onClose: () => void;
    onNavigate: (screen: string) => void;
}

export default function SidebarDrawer({ visible, onClose, onNavigate }: SidebarDrawerProps) {
    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { user, logout } = useAuth();

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const handleNav = (screen: string) => {
        onClose();
        setTimeout(() => onNavigate(screen), 200);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
            </Animated.View>

            {/* Drawer */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                {/* User info */}
                <View style={styles.userSection}>
                    <View style={styles.avatarCircle}>
                        <AppText style={styles.avatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AppText>
                    </View>
                    <AppText style={styles.userName} numberOfLines={1}>{user?.name ?? "User"}</AppText>
                    <AppText style={styles.userEmail} numberOfLines={1}>{user?.email ?? ""}</AppText>
                </View>

                <View style={styles.divider} />

                {/* Menu items */}
                <View style={styles.menuSection}>
                    <MenuItem
                        icon="person-outline"
                        label="My Profile"
                        onPress={() => handleNav("UserProfile")}
                    />
                    <MenuItem
                        icon="images-outline"
                        label="My Creations"
                        onPress={() => handleNav("UserHistory")}
                    />
                </View>

                <View style={{ flex: 1 }} />

                {/* Logout */}
                <View style={styles.bottomSection}>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.logoutRow} onPress={logout} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                        <AppText style={styles.logoutText}>Log Out</AppText>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

function MenuItem({
    icon,
    label,
    onPress,
    badge,
}: {
    icon: string;
    label: string;
    onPress: () => void;
    badge?: string;
}) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconWrap}>
                <Ionicons name={icon as any} size={20} color={theme.colors.accent} />
            </View>
            <AppText style={styles.menuLabel}>{label}</AppText>
            {badge && (
                <View style={styles.badge}>
                    <AppText style={styles.badgeText}>{badge}</AppText>
                </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    drawer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: DRAWER_WIDTH,
        backgroundColor: theme.colors.background,
        paddingTop: theme.spacing.safeTop + 10,
        paddingBottom: theme.spacing.xl,
    },

    userSection: {
        alignItems: "center",
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: theme.spacing.sm,
    },
    avatarText: {
        ...theme.typography.title,
        fontSize: 24,
        color: theme.colors.accent,
    },
    userName: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "700",
        fontSize: 16,
    },
    userEmail: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginTop: 2,
    },

    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.md,
    },

    menuSection: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.md,
        gap: theme.spacing.md,
    },
    menuIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center",
        alignItems: "center",
    },
    menuLabel: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: "600",
        fontSize: 14,
        flex: 1,
    },
    badge: {
        backgroundColor: theme.colors.accent + "18",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        ...theme.typography.caption,
        color: theme.colors.accent,
        fontWeight: "700",
        fontSize: 9,
    },

    bottomSection: {
        paddingHorizontal: theme.spacing.sm,
    },
    logoutRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        paddingVertical: 14,
        paddingHorizontal: theme.spacing.md,
    },
    logoutText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.error,
        fontWeight: "600",
    },
});
