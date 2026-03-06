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

interface InsufficientCreditsModalProps {
  visible: boolean;
  onClose: () => void;
  onBuyCredits: () => void;
  creditsNeeded: number;
  currentCredits: number;
  generationType?: 'photos' | 'catalogue' | 'branded';
}

export default function InsufficientCreditsModal({
  visible,
  onClose,
  onBuyCredits,
  creditsNeeded,
  currentCredits,
  generationType = 'photos',
}: InsufficientCreditsModalProps) {
  const creditsShort = creditsNeeded - currentCredits;

  const getGenerationText = () => {
    switch (generationType) {
      case 'catalogue':
        return 'catalogue photos';
      case 'branded':
        return 'branded photos';
      default:
        return 'photos';
    }
  };

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

          {/* Header with Icon */}
          <View style={styles.header}>
            <View style={styles.iconGradient}>
              <Ionicons name="diamond" size={48} color={colors.white} />
            </View>
          </View>

          {/* Title */}
          <AppText style={styles.title}>Insufficient Credits</AppText>

          {/* Credits Info Card */}
          <View style={styles.creditsCard}>
            <View style={styles.creditsRow}>
              <View style={styles.creditsItem}>
                <AppText style={styles.creditsLabel}>You Have</AppText>
                <View style={styles.creditsBadge}>
                  <Ionicons name="diamond-outline" size={20} color={colors.error} />
                  <AppText style={[styles.creditsValue, { color: colors.error }]}>
                    {currentCredits}
                  </AppText>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.creditsItem}>
                <AppText style={styles.creditsLabel}>You Need</AppText>
                <View style={styles.creditsBadge}>
                  <Ionicons name="diamond" size={20} color={colors.primary} />
                  <AppText style={[styles.creditsValue, { color: colors.primary }]}>
                    {creditsNeeded}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Missing Credits Highlight */}
            <View style={styles.shortageCard}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <AppText style={styles.shortageText}>
                You're short by <AppText style={styles.shortageNumber}>{creditsShort}</AppText> credits
              </AppText>
            </View>
          </View>

          {/* Message */}
          <AppText style={styles.message}>
            To generate your {getGenerationText()}, you need {creditsNeeded} credits.
            {'\n\n'}
            Purchase more credits to unlock unlimited AI-powered photo generation!
          </AppText>

          {/* Benefits */}
          <View style={styles.benefits}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <AppText style={styles.benefitText}>Instant credit top-up</AppText>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <AppText style={styles.benefitText}>Generate unlimited photos</AppText>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <AppText style={styles.benefitText}>No subscription required</AppText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <AppButton
              title="Buy Credits Now"
              onPress={onBuyCredits}
              style={styles.buyButton}
            />
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <AppText style={styles.cancelText}>Maybe Later</AppText>
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
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  creditsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  creditsItem: {
    alignItems: 'center',
    flex: 1,
  },
  creditsLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  creditsValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  shortageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  shortageText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  shortageNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.error,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefits: {
    marginBottom: 24,
    gap: 12,
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
  },
  actions: {
    gap: 12,
  },
  buyButton: {
    marginBottom: 0,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: '600',
  },
});
