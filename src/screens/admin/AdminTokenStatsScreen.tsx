import { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/ui/AppText";
import AppHeader from "../../components/ui/AppHeader";
import { theme } from "../../theme/theme";
import {
    fetchTokenStats,
    fetchCostSettings,
    TokenStats,
    CostSettings,
} from "../../services/adminApi";

// ─── Filter definitions ──────────────────────────────────────────────────────
type FilterId =
    | "all"
    | "month"
    | "previous_month"
    | "last_3_months"
    | "last_6_months"
    | "year"
    | "custom";

interface FilterOption {
    id: FilterId;
    label: string;
    icon: string;
    description: string;
}

const FILTER_OPTIONS: FilterOption[] = [
    { id: "all", label: "All Time", icon: "infinite-outline", description: "Since the beginning" },
    { id: "month", label: "Current Month", icon: "calendar-outline", description: "This month so far" },
    { id: "previous_month", label: "Previous Month", icon: "calendar-clear-outline", description: "Last completed month" },
    { id: "last_3_months", label: "Last 3 Months", icon: "time-outline", description: "Past 90 days" },
    { id: "last_6_months", label: "Last 6 Months", icon: "hourglass-outline", description: "Past 180 days" },
    { id: "year", label: "This Year", icon: "today-outline", description: "January till now" },
    { id: "custom", label: "Custom Range", icon: "options-outline", description: "Pick start & end dates" },
];

function getFilterLabel(id: FilterId): string {
    return FILTER_OPTIONS.find((f) => f.id === id)?.label ?? "All Time";
}

/** Returns a human-readable date range string for preset filters */
function getDateRangeText(id: FilterId, customFrom?: string, customTo?: string): string {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    switch (id) {
        case "all":
            return "All time";
        case "month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return `${fmt(start)} — ${fmt(now)}`;
        }
        case "previous_month": {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return `${fmt(start)} — ${fmt(end)}`;
        }
        case "last_3_months": {
            const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return `${fmt(start)} — ${fmt(now)}`;
        }
        case "last_6_months": {
            const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            return `${fmt(start)} — ${fmt(now)}`;
        }
        case "year": {
            const start = new Date(now.getFullYear(), 0, 1);
            return `${fmt(start)} — ${fmt(now)}`;
        }
        case "custom": {
            if (customFrom && customTo) {
                return `${fmt(new Date(customFrom))} — ${fmt(new Date(customTo))}`;
            }
            return "Select dates";
        }
        default:
            return "";
    }
}

// ─── Calendar helpers ────────────────────────────────────────────────────────
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function dateToString(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function isSameDay(a: string, b: string): boolean {
    return a === b;
}

function isInRange(day: string, from: string, to: string): boolean {
    return day > from && day < to;
}

// ═════════════════════════════════════════════════════════════════════════════

export default function AdminTokenStatsScreen({ navigation }: any) {
    const [filter, setFilter] = useState<FilterId>("all");
    const [stats, setStats] = useState<TokenStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter & calendar popup
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false);

    // Custom date
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    // Calendar picking state
    const [pickingField, setPickingField] = useState<"from" | "to">("from");
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(new Date().getMonth());

    // Cost settings from DB
    const [costSettings, setCostSettings] = useState<CostSettings>({
        input_cost_per_million: 2,
        output_cost_per_million: 12,
        usd_to_inr: 83.5,
    });

    const loadStats = useCallback(
        async (f: FilterId = filter, fromDate?: string, toDate?: string) => {
            try {
                setLoading(true);
                const [data, settings] = await Promise.all([
                    fetchTokenStats(f, fromDate, toDate),
                    fetchCostSettings(),
                ]);
                setStats(data);
                setCostSettings(settings);
            } catch (err) {
                console.error("Token stats error:", err);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [filter]
    );

    useEffect(() => {
        if (filter === "custom") {
            if (customFrom && customTo) loadStats("custom", customFrom, customTo);
        } else {
            loadStats(filter);
        }
    }, [filter]);

    const onRefresh = () => {
        setRefreshing(true);
        if (filter === "custom" && customFrom && customTo) {
            loadStats("custom", customFrom, customTo);
        } else {
            loadStats(filter);
        }
    };

    const selectFilter = (id: FilterId) => {
        if (id === "custom") {
            setFilter("custom");
            setFilterModalVisible(false);
            // Open calendar for "from" date
            setPickingField("from");
            setCalendarVisible(true);
            return;
        }
        setFilter(id);
        setFilterModalVisible(false);
    };

    const onCalendarDayPress = (dateStr: string) => {
        if (pickingField === "from") {
            setCustomFrom(dateStr);
            setCustomTo("");
            setPickingField("to");
        } else {
            // Ensure "to" is after "from"
            if (dateStr < customFrom) {
                // Swap: user picked an earlier date
                setCustomTo(customFrom);
                setCustomFrom(dateStr);
            } else {
                setCustomTo(dateStr);
            }
            // Close calendar and fetch
            setCalendarVisible(false);
            const from = dateStr < customFrom ? dateStr : customFrom;
            const to = dateStr < customFrom ? customFrom : dateStr;
            loadStats("custom", from, to);
        }
    };

    const prevMonth = () => {
        if (calMonth === 0) {
            setCalMonth(11);
            setCalYear(calYear - 1);
        } else {
            setCalMonth(calMonth - 1);
        }
    };

    const nextMonth = () => {
        if (calMonth === 11) {
            setCalMonth(0);
            setCalYear(calYear + 1);
        } else {
            setCalMonth(calMonth + 1);
        }
    };

    // Cost helpers using DB settings
    const calcTotalCostUSD = (inputTokens: number, outputTokens: number) => {
        const inputCost = (inputTokens / 1_000_000) * costSettings.input_cost_per_million;
        const outputCost = (outputTokens / 1_000_000) * costSettings.output_cost_per_million;
        return inputCost + outputCost;
    };

    const formatINR = (usd: number) => `₹${(usd * costSettings.usd_to_inr).toFixed(2)}`;

    // Calendar grid
    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(calYear, calMonth);
        const firstDay = getFirstDayOfMonth(calYear, calMonth);
        const days: (string | null)[] = [];
        // Padding for first week
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(calYear, calMonth, d);
            days.push(dateToString(date));
        }
        return days;
    }, [calYear, calMonth]);

    const dateRangeText = getDateRangeText(filter, customFrom, customTo);

    return (
        <View style={styles.container}>
            <AppHeader title="Token Analytics" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* ── Date Range Display ────────────────────────────── */}
                <View style={styles.dateRangeBanner}>
                    <Ionicons name="calendar" size={16} color={theme.colors.accent} />
                    <AppText style={styles.dateRangeText}>{dateRangeText}</AppText>
                </View>

                {/* ── Filter Button ──────────────────────────────────── */}
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <View style={styles.filterBtnLeft}>
                        <Ionicons name="funnel-outline" size={18} color={theme.colors.accent} />
                        <View>
                            <AppText style={styles.filterBtnLabel}>Filter</AppText>
                            <AppText style={styles.filterBtnValue}>{getFilterLabel(filter)}</AppText>
                        </View>
                    </View>
                    <Ionicons name="chevron-down" size={18} color={theme.colors.secondary} />
                </TouchableOpacity>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.accent} />
                    </View>
                ) : stats ? (
                    <>
                        {/* ── Big number ─────────────────────────────────── */}
                        <View style={styles.bigCard}>
                            <View style={styles.bigIconWrap}>
                                <Ionicons name="flash" size={28} color={theme.colors.accent} />
                            </View>
                            <AppText style={styles.bigValue}>{formatNumber(stats.total_tokens)}</AppText>
                            <AppText style={styles.bigLabel}>Total Tokens Used</AppText>
                            <View style={styles.costSummary}>
                                <AppText style={styles.costText}>
                                    ≈ ${calcTotalCostUSD(stats.total_input_tokens, stats.total_output_tokens).toFixed(4)} •{" "}
                                    {formatINR(calcTotalCostUSD(stats.total_input_tokens, stats.total_output_tokens))}
                                </AppText>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <StatBlock label="Generations" value={stats.total_generations} icon="layers-outline" />
                            <StatBlock label="Images" value={stats.total_images} icon="images-outline" />
                        </View>
                        <View style={styles.statsRow}>
                            <StatBlock label="Input Tokens" value={stats.total_input_tokens} icon="arrow-up-circle-outline" color={theme.colors.success} />
                            <StatBlock label="Output Tokens" value={stats.total_output_tokens} icon="arrow-down-circle-outline" color="#3B82F6" />
                        </View>

                        {/* ── Category Breakdown ──────────────────────────── */}
                        <AppText style={styles.sectionTitle}>By Category</AppText>
                        {stats.categories.length === 0 ? (
                            <View style={styles.emptyState}>
                                <AppText style={styles.emptyText}>No data for this period</AppText>
                            </View>
                        ) : (
                            stats.categories.map((cat, idx) => (
                                <View key={idx} style={styles.catRow}>
                                    <View style={styles.catBadge}>
                                        <AppText style={styles.catName}>{cat.category}</AppText>
                                    </View>
                                    <View style={styles.catStats}>
                                        <AppText style={styles.catStat}>{cat.count} gen</AppText>
                                        <AppText style={styles.catStat}>{cat.images} img</AppText>
                                        <AppText style={styles.catTokens}>{formatNumber(cat.tokens)} tkns</AppText>
                                    </View>
                                </View>
                            ))
                        )}

                        {/* ── Pricing ──────────────────────────────────── */}
                        <View style={styles.pricingCard}>
                            <AppText style={styles.pricingTitle}>Current Cost Rates</AppText>
                            <AppText style={styles.pricingRow}>Input: ${costSettings.input_cost_per_million} / 1M tokens</AppText>
                            <AppText style={styles.pricingRow}>Output: ${costSettings.output_cost_per_million} / 1M tokens</AppText>
                            <AppText style={styles.pricingRow}>Exchange Rate: ₹{costSettings.usd_to_inr} / $1</AppText>
                            <AppText style={[styles.pricingRow, { color: theme.colors.muted, fontSize: 10 }]}>
                                Edit rates on Dashboard → Cost Configuration
                            </AppText>
                        </View>
                    </>
                ) : null}
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════════════════════
           FILTER MODAL (Bottom Sheet)
         ═══════════════════════════════════════════════════════════════════════ */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setFilterModalVisible(false)}
                >
                    <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <AppText style={styles.modalTitle}>Select Filter</AppText>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {FILTER_OPTIONS.map((opt) => {
                                const isSelected = filter === opt.id;
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                                        onPress={() => selectFilter(opt.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.filterOptionLeft}>
                                            <View style={[styles.filterOptionIcon, isSelected && styles.filterOptionIconActive]}>
                                                <Ionicons
                                                    name={opt.icon as any}
                                                    size={18}
                                                    color={isSelected ? theme.colors.white : theme.colors.accent}
                                                />
                                            </View>
                                            <View>
                                                <AppText
                                                    style={[styles.filterOptionLabel, isSelected && styles.filterOptionLabelActive]}
                                                >
                                                    {opt.label}
                                                </AppText>
                                                <AppText style={styles.filterOptionDesc}>{opt.description}</AppText>
                                            </View>
                                        </View>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ═══════════════════════════════════════════════════════════════════════
           CALENDAR MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
            <Modal
                visible={calendarVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <TouchableOpacity
                    style={styles.calOverlay}
                    activeOpacity={1}
                    onPress={() => setCalendarVisible(false)}
                >
                    <View style={styles.calContent} onStartShouldSetResponder={() => true}>
                        {/* Header */}
                        <View style={styles.calHeader}>
                            <AppText style={styles.calTitle}>
                                {pickingField === "from" ? "Select Start Date" : "Select End Date"}
                            </AppText>
                            <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                                <Ionicons name="close-circle" size={24} color={theme.colors.muted} />
                            </TouchableOpacity>
                        </View>

                        {/* Month navigator */}
                        <View style={styles.calMonthNav}>
                            <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                                <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <AppText style={styles.calMonthLabel}>
                                {MONTHS[calMonth]} {calYear}
                            </AppText>
                            <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Weekday labels */}
                        <View style={styles.calWeekRow}>
                            {WEEKDAYS.map((w) => (
                                <View key={w} style={styles.calWeekCell}>
                                    <AppText style={styles.calWeekText}>{w}</AppText>
                                </View>
                            ))}
                        </View>

                        {/* Day grid */}
                        <View style={styles.calGrid}>
                            {calendarDays.map((dayStr, idx) => {
                                if (!dayStr) {
                                    return <View key={`empty-${idx}`} style={styles.calDayCell} />;
                                }
                                const dayNum = parseInt(dayStr.split("-")[2], 10);
                                const isFrom = customFrom && isSameDay(dayStr, customFrom);
                                const isTo = customTo && isSameDay(dayStr, customTo);
                                const inRange = customFrom && customTo && isInRange(dayStr, customFrom, customTo);
                                const isToday = isSameDay(dayStr, dateToString(new Date()));

                                return (
                                    <TouchableOpacity
                                        key={dayStr}
                                        style={[
                                            styles.calDayCell,
                                            inRange && styles.calDayInRange,
                                            (isFrom || isTo) && styles.calDaySelected,
                                        ]}
                                        onPress={() => onCalendarDayPress(dayStr)}
                                        activeOpacity={0.7}
                                    >
                                        <AppText
                                            style={[
                                                styles.calDayText,
                                                isToday && styles.calDayToday,
                                                (isFrom || isTo) && styles.calDaySelectedText,
                                            ]}
                                        >
                                            {dayNum}
                                        </AppText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Selection info */}
                        <View style={styles.calFooter}>
                            <View style={styles.calFooterChip}>
                                <AppText style={styles.calFooterLabel}>From:</AppText>
                                <AppText style={styles.calFooterValue}>
                                    {customFrom
                                        ? new Date(customFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                        : "—"}
                                </AppText>
                            </View>
                            <Ionicons name="arrow-forward" size={14} color={theme.colors.muted} />
                            <View style={styles.calFooterChip}>
                                <AppText style={styles.calFooterLabel}>To:</AppText>
                                <AppText style={styles.calFooterValue}>
                                    {customTo
                                        ? new Date(customTo).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                        : "—"}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

function StatBlock({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: string;
    color?: string;
}) {
    const c = color ?? theme.colors.accent;
    return (
        <View style={styles.statBlock}>
            <Ionicons name={icon as any} size={20} color={c} />
            <AppText style={styles.statBlockValue}>{formatNumber(value)}</AppText>
            <AppText style={styles.statBlockLabel}>{label}</AppText>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { justifyContent: "center", alignItems: "center", paddingVertical: theme.spacing.xl },
    content: { padding: theme.spacing.screenPadding, paddingBottom: theme.spacing.xl },

    // ── Date range banner ──────────────────────────────────────────────────────
    dateRangeBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.accentLight,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.sm,
    },
    dateRangeText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.accent,
        fontWeight: "700",
        fontSize: 13,
    },

    // ── Filter Button ──────────────────────────────────────────────────────────
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    filterBtnLeft: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
    filterBtnLabel: { ...theme.typography.caption, color: theme.colors.muted, fontSize: 10 },
    filterBtnValue: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", fontSize: 14 },

    // ── Stats ──────────────────────────────────────────────────────────────────
    bigCard: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    bigIconWrap: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center", alignItems: "center",
        marginBottom: theme.spacing.sm,
    },
    bigValue: { ...theme.typography.title, fontSize: 28, color: theme.colors.primary },
    bigLabel: { ...theme.typography.caption, color: theme.colors.secondary, marginTop: 2 },
    costSummary: {
        marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm,
        borderTopWidth: 1, borderColor: theme.colors.border,
        width: "80%", alignItems: "center",
    },
    costText: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: "600", fontSize: 12 },

    statsRow: { flexDirection: "row", gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
    statBlock: {
        flex: 1, alignItems: "center",
        backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
        borderWidth: 1, borderColor: theme.colors.border,
        paddingVertical: theme.spacing.md, gap: 4,
    },
    statBlockValue: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", fontSize: 18 },
    statBlockLabel: { ...theme.typography.caption, color: theme.colors.secondary, fontSize: 10 },

    sectionTitle: {
        ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700",
        marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm,
    },

    catRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: theme.colors.surface, borderRadius: theme.radius.md,
        borderWidth: 1, borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    catBadge: { backgroundColor: theme.colors.accentLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    catName: { ...theme.typography.caption, color: theme.colors.accent, fontWeight: "700", fontSize: 11, textTransform: "capitalize" },
    catStats: { flexDirection: "row", gap: theme.spacing.md },
    catStat: { ...theme.typography.caption, color: theme.colors.secondary, fontSize: 10 },
    catTokens: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: "600", fontSize: 10 },

    pricingCard: {
        marginTop: theme.spacing.lg, backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border,
        padding: theme.spacing.md, gap: 4,
    },
    pricingTitle: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", fontSize: 12, marginBottom: 4 },
    pricingRow: { ...theme.typography.caption, color: theme.colors.secondary, fontSize: 11 },

    emptyState: { alignItems: "center", paddingVertical: theme.spacing.xl },
    emptyText: { ...theme.typography.body, color: theme.colors.muted },

    // ═══════════════════════════════════════════════════════════════════════════
    //  FILTER MODAL
    // ═══════════════════════════════════════════════════════════════════════════
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalSheet: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: theme.spacing.screenPadding,
        paddingBottom: theme.spacing.xl,
        maxHeight: "75%",
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: theme.colors.border,
        alignSelf: "center",
        marginTop: theme.spacing.sm, marginBottom: theme.spacing.md,
    },
    modalTitle: { ...theme.typography.title, color: theme.colors.primary, fontSize: 18, marginBottom: theme.spacing.md },

    filterOption: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: 12, paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.md, marginBottom: 4,
    },
    filterOptionActive: { backgroundColor: theme.colors.accent + "10" },
    filterOptionLeft: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
    filterOptionIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: theme.colors.accentLight,
        justifyContent: "center", alignItems: "center",
    },
    filterOptionIconActive: { backgroundColor: theme.colors.accent },
    filterOptionLabel: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "600", fontSize: 14 },
    filterOptionLabelActive: { color: theme.colors.accent },
    filterOptionDesc: { ...theme.typography.caption, color: theme.colors.muted, fontSize: 11 },

    // ═══════════════════════════════════════════════════════════════════════════
    //  CALENDAR MODAL
    // ═══════════════════════════════════════════════════════════════════════════
    calOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center", alignItems: "center",
        padding: theme.spacing.screenPadding,
    },
    calContent: {
        width: "100%",
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
    },
    calHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    calTitle: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", fontSize: 16 },

    calMonthNav: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    calNavBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: theme.colors.surface,
        borderWidth: 1, borderColor: theme.colors.border,
        justifyContent: "center", alignItems: "center",
    },
    calMonthLabel: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "700", fontSize: 15 },

    calWeekRow: { flexDirection: "row", marginBottom: 4 },
    calWeekCell: { flex: 1, alignItems: "center", paddingVertical: 4 },
    calWeekText: { ...theme.typography.caption, color: theme.colors.muted, fontWeight: "700", fontSize: 11 },

    calGrid: { flexDirection: "row", flexWrap: "wrap" },
    calDayCell: {
        width: "14.28%", // 100% / 7
        alignItems: "center", justifyContent: "center",
        paddingVertical: 8,
    },
    calDayText: {
        ...theme.typography.body, color: theme.colors.primary, fontSize: 14,
        width: 34, height: 34, lineHeight: 34,
        textAlign: "center", borderRadius: 17, overflow: "hidden",
    },
    calDayToday: {
        color: theme.colors.accent,
        fontWeight: "700",
    },
    calDaySelected: {
        backgroundColor: theme.colors.accent + "15",
        borderRadius: 17,
    },
    calDaySelectedText: {
        backgroundColor: theme.colors.accent,
        color: theme.colors.white,
        fontWeight: "700",
        borderRadius: 17,
        overflow: "hidden",
    },
    calDayInRange: {
        backgroundColor: theme.colors.accent + "08",
    },

    calFooter: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md, paddingTop: theme.spacing.md,
        borderTopWidth: 1, borderColor: theme.colors.border,
    },
    calFooterChip: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: theme.radius.sm,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    calFooterLabel: { ...theme.typography.caption, color: theme.colors.muted, fontSize: 10 },
    calFooterValue: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: "600", fontSize: 12 },
});
