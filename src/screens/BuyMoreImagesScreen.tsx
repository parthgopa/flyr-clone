import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import AppText from "../components/ui/AppText";
import AppButton from "../components/ui/AppButton";
import AppHeader from "../components/ui/AppHeader";
import PurchaseSuccessModal from "../components/PurchaseSuccessModal";
import PurchaseCancelledModal from "../components/PurchaseCancelledModal";
import { theme } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { purchaseProduct, getProducts } from "../services/iapService";
import { getUserCredits } from "../services/api";

const DISCRETE_VALUES = [10, 25, 50, 100];
const COST_PER_IMAGE = 10; // ₹10 per image

export default function BuyMoreImagesScreen({ navigation }: any) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState({ creditsAdded: 0, totalCredits: 0 });

  const selectedValue = DISCRETE_VALUES[selectedIndex];
  const totalCost = selectedValue * COST_PER_IMAGE;

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const response = await getUserCredits();
      if (response.success) {
        setCurrentCredits(response.credits);
      }
    } catch (error) {
      console.error("Error loading credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (value: number) => {
    setSelectedIndex(Math.round(value));
  };

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);

      // Map selected value to product ID
      const productId = `image_pack_${selectedValue}`;

      console.log(`\n🛒 Starting purchase flow for ${productId}...`);

      // Initiate purchase - this returns a promise that resolves when listener completes
      const result = await purchaseProduct(productId);

      console.log('✅ Purchase completed:', result);

      // Success - show beautiful success modal
      setPurchaseResult({
        creditsAdded: selectedValue,
        totalCredits: result.total_credits,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Purchase error:", error);
      
      // Handle different error types
      if (error.success === false) {
        // Error from backend verification
        Alert.alert("Purchase Failed", error.message || "Something went wrong");
      } else if (error.message?.includes('canceled')) {
        // User cancelled - show encouraging modal
        setShowCancelledModal(true);
      } else {
        // Other errors
        Alert.alert("Error", error.message || "Failed to complete purchase");
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Buy More Images" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <AppText style={styles.loadingText}>Loading...</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Buy More Images" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <AppText style={styles.balanceLabel}>Current Balance</AppText>
          <AppText style={styles.balanceValue}>{currentCredits} Images</AppText>
        </View>

        {/* Slider Section */}
        <View style={styles.sliderSection}>
          <AppText style={styles.sectionTitle}>Select Images</AppText>

          {/* Selected Value Display */}
          <View style={styles.selectedValueContainer}>
            <AppText style={styles.selectedValueNumber}>{selectedValue}</AppText>
            <AppText style={styles.selectedValueLabel}>Images</AppText>
          </View>

          {/* Discrete value indicators */}
          <View style={styles.valuesContainer}>
            {DISCRETE_VALUES.map((value, index) => (
              <View key={value} style={styles.valueItem}>
                <AppText
                  style={[
                    styles.valueText,
                    selectedIndex === index && styles.valueTextActive,
                  ]}
                >
                  {value}
                </AppText>
              </View>
            ))}
          </View>

          {/* Slider */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={3}
            step={1}
            value={selectedIndex}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.accent}
          />
        </View>

        {/* Price Calculation */}
        <View style={styles.calculationCard}>
          <View style={styles.calcRow}>
            <AppText style={styles.calcLabel}>{selectedValue} Images</AppText>
            <AppText style={styles.calcValue}>₹{selectedValue * COST_PER_IMAGE}</AppText>
          </View>
          
          <View style={styles.calcDivider} />
          
          <View style={styles.calcRow}>
            <AppText style={styles.calcTotalLabel}>Total Amount</AppText>
            <AppText style={styles.calcTotalValue}>₹{totalCost}</AppText>
          </View>

          <View style={styles.calcInfoRow}>
            <AppText style={styles.calcInfo}>New Balance: {currentCredits + selectedValue} images</AppText>
          </View>
        </View>

        {/* Purchase Button */}
        <AppButton
          title={
            isPurchasing
              ? "Processing..."
              : `Buy ${selectedValue} Images for ₹${totalCost}`
          }
          onPress={handlePurchase}
          disabled={isPurchasing}
          style={styles.purchaseButton}
        />

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={theme.colors.success}
            style={styles.paymentIcon}
          />
          <AppText style={styles.paymentText}>
            Secure payment via Google Play
          </AppText>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL */}
      <PurchaseSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          loadCredits(); // Refresh credits
          navigation.goBack();
        }}
        creditsAdded={purchaseResult.creditsAdded}
        totalCredits={purchaseResult.totalCredits}
      />

      {/* CANCELLED MODAL */}
      <PurchaseCancelledModal
        visible={showCancelledModal}
        onClose={() => {
          setShowCancelledModal(false);
          setIsPurchasing(false); // Reset button state
        }}
        onTryAgain={() => {
          setShowCancelledModal(false);
          handlePurchase(); // Retry purchase
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.xl,
  },
  balanceCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  balanceLabel: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  balanceValue: {
    ...theme.typography.hero,
    fontSize: 22,
    color: theme.colors.accent,
    fontWeight: "700",
    height: 30,
  },
  sliderSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  selectedValueContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  selectedValueNumber: {
    ...theme.typography.hero,
    fontSize: 28,
    color: theme.colors.accent,
    fontWeight: "800",
    height: 30,
  },
  selectedValueLabel: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    fontSize: 16,
  },
  valuesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  valueItem: {
    alignItems: "center",
    flex: 1,
  },
  valueText: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.secondary,
    fontSize: 12,
  },
  valueTextActive: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  calculationCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  calcLabel: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    fontSize: 15,
  },
  calcValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.primary,
    fontSize: 15,
  },
  calcDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  calcTotalLabel: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  calcTotalValue: {
    ...theme.typography.hero,
    fontSize: 28,
    color: theme.colors.accent,
    fontWeight: "800",
  },
  calcInfoRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: "center",
  },
  calcInfo: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontSize: 13,
  },
  purchaseButton: {
    marginBottom: theme.spacing.md,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIcon: {
    marginRight: theme.spacing.xs,
  },
  paymentText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
  },
});
