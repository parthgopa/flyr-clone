import React from "react";
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppButton from "../../components/ui/AppButton";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get("window");

export default function ComingSoonAdsScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="videocam" size={80} color={theme.colors.accent} />
                        <View style={styles.sparkleDecoration}>
                            <Ionicons name="sparkles" size={24} color={theme.colors.accentSolid} />
                        </View>
                    </View>

                    <AppText style={styles.title}>AI Video Ads</AppText>
                    <AppText style={styles.subtitle}>
                        We're building something amazing! Soon you'll be able to generate professional video commercials with state-of-the-art AI.
                    </AppText>

                    <View style={styles.badgeContainer}>
                        <AppText style={styles.badgeText}>Coming Soon</AppText>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <AppButton
                        title="Back to Home"
                        onPress={() => navigation.goBack()}
                        style={styles.actionBtn}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: theme.spacing.screenPadding,
    },
    header: {
        height: 60,
        justifyContent: "center",
        marginTop: theme.spacing.safeTop,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: theme.spacing.md,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: theme.spacing.xl,
        position: "relative",
        borderWidth: 2,
        borderColor: `${theme.colors.accent}30`,
    },
    sparkleDecoration: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        padding: 2,
    },
    title: {
        ...theme.typography.hero,
        fontSize: 32,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
        textAlign: "center",
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.secondary,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    badgeContainer: {
        backgroundColor: `${theme.colors.accent}15`,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: `${theme.colors.accent}30`,
    },
    badgeText: {
        ...theme.typography.subtitle,
        color: theme.colors.accentSolid,
        margin: 0,
        fontSize: 14,
    },
    footer: {
        paddingBottom: theme.spacing.xl,
    },
    actionBtn: {
        width: "100%",
    }
});
