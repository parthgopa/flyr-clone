import * as RNIap from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import { verifyPurchase as verifyPurchaseAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product SKUs
const PRODUCT_SKUS = [
  'image_pack_10',
  'image_pack_25',
  'image_pack_50',
  'image_pack_100',
];

// Package name (update this with your actual package name)
const PACKAGE_NAME = 'com.anonymous.flyrclone';

// Initialize IAP connection
export const initializeIAP = async (): Promise<boolean> => {
  try {
    await RNIap.initConnection();
    console.log('✓ IAP connection initialized');
    return true;
  } catch (error) {
    console.error('✗ IAP initialization error:', error);
    return false;
  }
};

// End IAP connection
export const endIAP = async () => {
  try {
    await RNIap.endConnection();
    console.log('✓ IAP connection ended');
  } catch (error) {
    console.error('✗ IAP end connection error:', error);
  }
};

// Get available products
export const getProducts = async () => {
  try {
    const products = await RNIap.fetchProducts({ skus: PRODUCT_SKUS, type: 'in-app' });
    console.log('✓ Available products:', products);
    return products || [];
  } catch (error) {
    console.error('✗ Error fetching products:', error);
    return [];
  }
};

// Check if purchase token was already processed
const isPurchaseProcessed = async (purchaseToken: string): Promise<boolean> => {
  try {
    const processedTokens = await AsyncStorage.getItem('processed_purchase_tokens');
    if (processedTokens) {
      const tokens = JSON.parse(processedTokens);
      return tokens.includes(purchaseToken);
    }
    return false;
  } catch (error) {
    console.error('Error checking processed purchases:', error);
    return false;
  }
};

// Mark purchase token as processed
const markPurchaseAsProcessed = async (purchaseToken: string) => {
  try {
    const processedTokens = await AsyncStorage.getItem('processed_purchase_tokens');
    let tokens = [];
    
    if (processedTokens) {
      tokens = JSON.parse(processedTokens);
    }
    
    if (!tokens.includes(purchaseToken)) {
      tokens.push(purchaseToken);
      await AsyncStorage.setItem('processed_purchase_tokens', JSON.stringify(tokens));
    }
  } catch (error) {
    console.error('Error marking purchase as processed:', error);
  }
};

// Purchase a product
export const purchaseProduct = async (productId: string): Promise<any> => {
  try {
    console.log(`Initiating purchase for: ${productId}`);
    
    // Request purchase with correct v14 API structure
    const purchaseResult = await RNIap.requestPurchase({
      type: 'in-app',
      request: Platform.OS === 'android' 
        ? { google: { skus: [productId] } }
        : { apple: { sku: productId } }
    });
    
    if (!purchaseResult) {
      return {
        success: false,
        message: 'Purchase was canceled',
      };
    }

    // Handle array or single purchase response
    const purchase = Array.isArray(purchaseResult) ? purchaseResult[0] : purchaseResult;
    
    if (!purchase) {
      return {
        success: false,
        message: 'Purchase was canceled',
      };
    }

    console.log('Purchase response:', purchase);

    // For Android, get purchase token
    const purchaseToken = purchase.purchaseToken || '';
    
    // Check if already processed (prevent duplicate processing)
    const alreadyProcessed = await isPurchaseProcessed(purchaseToken);
    if (alreadyProcessed) {
      console.log('Purchase already processed, skipping verification');
      return {
        success: false,
        message: 'Purchase already processed',
      };
    }

    // Verify purchase with backend
    console.log('Verifying purchase with backend...');
    const verificationResult = await verifyPurchaseAPI({
      productId: productId,
      purchaseToken: purchaseToken,
      packageName: PACKAGE_NAME,
    });

    if (verificationResult.success) {
      // Mark as processed
      await markPurchaseAsProcessed(purchaseToken);
      
      // Acknowledge/consume the purchase (for one-time products)
      if (Platform.OS === 'android') {
        await RNIap.acknowledgePurchaseAndroid(purchaseToken);
        console.log('✓ Purchase acknowledged');
      } else if (Platform.OS === 'ios') {
        await RNIap.finishTransaction({ purchase, isConsumable: true });
        console.log('✓ Transaction finished');
      }

      return {
        success: true,
        message: 'Purchase successful',
        credits_added: verificationResult.credits_added,
        total_credits: verificationResult.total_credits,
        transaction_id: verificationResult.transaction_id,
      };
    } else {
      console.error('Backend verification failed:', verificationResult.message);
      return {
        success: false,
        message: verificationResult.message || 'Purchase verification failed',
      };
    }
  } catch (error: any) {
    console.error('Purchase error:', error);
    
    // Handle user cancellation
    if (error.code === 'E_USER_CANCELLED') {
      return {
        success: false,
        message: 'Purchase was canceled',
      };
    }
    
    return {
      success: false,
      message: error.message || 'Purchase failed',
    };
  }
};

// Restore purchases (for handling unfinished transactions)
export const restorePurchases = async (): Promise<void> => {
  try {
    console.log('Restoring purchases...');
    
    // Get available purchases
    const availablePurchases = await RNIap.getAvailablePurchases();
    
    console.log(`Found ${availablePurchases.length} available purchases`);

    for (const purchase of availablePurchases) {
      const purchaseToken = purchase.purchaseToken || '';
      const productId = purchase.productId;

      // Check if already processed
      const alreadyProcessed = await isPurchaseProcessed(purchaseToken);
      if (alreadyProcessed) {
        console.log(`Purchase ${productId} already processed, skipping`);
        continue;
      }

      console.log(`Processing unfinished purchase: ${productId}`);

      // Verify with backend
      const verificationResult = await verifyPurchaseAPI({
        productId: productId,
        purchaseToken: purchaseToken,
        packageName: PACKAGE_NAME,
      });

      if (verificationResult.success) {
        // Mark as processed
        await markPurchaseAsProcessed(purchaseToken);
        
        // Acknowledge/finish
        if (Platform.OS === 'android') {
          await RNIap.acknowledgePurchaseAndroid(purchaseToken);
        } else if (Platform.OS === 'ios') {
          await RNIap.finishTransaction({ purchase, isConsumable: true });
        }

        console.log(`✓ Restored purchase: ${productId}`);
      }
    }

    Alert.alert('Restore Complete', 'Your purchases have been restored');
  } catch (error) {
    console.error('Restore purchases error:', error);
    Alert.alert('Restore Failed', 'Failed to restore purchases');
  }
};

// Setup purchase update listener
export const setupPurchaseListener = (
  onPurchaseUpdate: (purchase: any) => void,
  onPurchaseError: (error: any) => void
) => {
  // Purchase update listener
  const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
    async (purchase) => {
      console.log('Purchase updated:', purchase);
      onPurchaseUpdate(purchase);
    }
  );

  // Purchase error listener
  const purchaseErrorSubscription = RNIap.purchaseErrorListener(
    (error) => {
      console.error('Purchase error:', error);
      onPurchaseError(error);
    }
  );

  // Return cleanup function
  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
  };
};

// Clear all processed purchase tokens (for testing only - DO NOT USE IN PRODUCTION)
export const clearProcessedPurchases = async () => {
  try {
    await AsyncStorage.removeItem('processed_purchase_tokens');
    console.log('Cleared processed purchase tokens');
  } catch (error) {
    console.error('Error clearing processed purchases:', error);
  }
};
