import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './ui/AppText';
import AppButton from './ui/AppButton';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface PurchaseCancelledModalProps {
  visible: boolean;
  onClose: () => void;
  onTryAgain: () => void;
}

export default function PurchaseCancelledModal({
  visible,
  onClose,
  onTryAgain,
}: PurchaseCancelledModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.muted} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="pause-circle-outline" size={64} color={colors.primary} />
            </View>
          </View>

          {/* Title */}
          <AppText style={styles.title}>Purchase Paused</AppText>
          <AppText style={styles.subtitle}>
            No worries! You can complete your purchase anytime.
          </AppText>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <AppText style={styles.infoText}>
                Your selection has been saved
              </AppText>
            </View>
          </View>

          {/* Benefits - Why Buy */}
          <View style={styles.benefits}>
            <AppText style={styles.benefitsTitle}>Why Get Credits?</AppText>
            
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name="flash" size={18} color={colors.white} />
              </View>
              <View style={styles.benefitContent}>
                <AppText style={styles.benefitTitle}>Instant Generation</AppText>
                <AppText style={styles.benefitDesc}>Create AI photos in seconds</AppText>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name="trending-up" size={18} color={colors.white} />
              </View>
              <View style={styles.benefitContent}>
                <AppText style={styles.benefitTitle}>Boost Sales</AppText>
                <AppText style={styles.benefitDesc}>Professional photos increase conversions</AppText>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name="wallet" size={18} color={colors.white} />
              </View>
              <View style={styles.benefitContent}>
                <AppText style={styles.benefitTitle}>Cost Effective</AppText>
                <AppText style={styles.benefitDesc}>Much cheaper than photoshoots</AppText>
              </View>
            </View>
          </View>

          {/* Special Offer Hint */}
          <View style={styles.offerCard}>
            <Ionicons name="gift" size={20} color={colors.primary} />
            <AppText style={styles.offerText}>
              Credits never expire - buy now, use anytime!
            </AppText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <AppButton
              title="Complete Purchase"
              onPress={onTryAgain}
              style={styles.primaryButton}
            />
            <TouchableOpacity onPress={onClose} style={styles.secondaryButton}>
              <AppText style={styles.secondaryText}>Maybe Later</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: Math.min(width - 40, 400),
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
    flex: 1,
  },
  benefits: {
    marginBottom: 20,
    gap: 14,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    color: colors.secondary,
    lineHeight: 18,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  offerText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    marginBottom: 0,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: '600',
  },
});
