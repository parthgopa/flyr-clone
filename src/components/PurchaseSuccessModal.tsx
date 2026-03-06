import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './ui/AppText';
import AppButton from './ui/AppButton';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface PurchaseSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  creditsAdded: number;
  totalCredits: number;
}

export default function PurchaseSuccessModal({
  visible,
  onClose,
  creditsAdded,
  totalCredits,
}: PurchaseSuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Celebration animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      sparkleAnim.setValue(0);
    }
  }, [visible]);

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Celebration Icon */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              </View>
              
              {/* Sparkles */}
              <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleOpacity }]}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
              </Animated.View>
              <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleOpacity }]}>
                <Ionicons name="sparkles" size={20} color={colors.accent} />
              </Animated.View>
              <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkleOpacity }]}>
                <Ionicons name="sparkles" size={18} color={colors.success} />
              </Animated.View>
            </View>
          </View>

          {/* Title */}
          <AppText style={styles.title}>Purchase Successful! 🎉</AppText>
          <AppText style={styles.subtitle}>Your credits have been added</AppText>

          {/* Credits Info */}
          <View style={styles.creditsCard}>
            <View style={styles.creditsRow}>
              <View style={styles.creditsItem}>
                <Ionicons name="add-circle" size={32} color={colors.success} />
                <AppText style={styles.creditsAddedLabel}>Credits Added</AppText>
                <AppText style={styles.creditsAddedValue}>+{creditsAdded}</AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalCreditsRow}>
              <Ionicons name="diamond" size={24} color={colors.primary} />
              <View style={styles.totalCreditsInfo}>
                <AppText style={styles.totalCreditsLabel}>New Balance</AppText>
                <AppText style={styles.totalCreditsValue}>{totalCredits} Credits</AppText>
              </View>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <AppText style={styles.benefitsTitle}>What's Next?</AppText>
            <View style={styles.benefitRow}>
              <Ionicons name="images" size={20} color={colors.primary} />
              <AppText style={styles.benefitText}>Generate unlimited AI photos</AppText>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="flash" size={20} color={colors.primary} />
              <AppText style={styles.benefitText}>Start creating amazing content</AppText>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <AppText style={styles.benefitText}>Boost your business instantly</AppText>
            </View>
          </View>

          {/* Action Button */}
          <AppButton
            title="Start Creating"
            onPress={onClose}
            style={styles.actionButton}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: Math.min(width - 40, 400),
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -5,
    right: 10,
  },
  sparkle2: {
    bottom: 5,
    left: 5,
  },
  sparkle3: {
    top: 10,
    left: -5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  creditsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditsRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsItem: {
    alignItems: 'center',
  },
  creditsAddedLabel: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 8,
    fontWeight: '600',
  },
  creditsAddedValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.success,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  totalCreditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  totalCreditsInfo: {
    alignItems: 'flex-start',
  },
  totalCreditsLabel: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalCreditsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  benefits: {
    marginBottom: 24,
    gap: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    marginBottom: 0,
  },
});
