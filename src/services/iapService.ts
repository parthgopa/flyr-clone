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

// Store for pending purchase promises
const pendingPurchases = new Map<string, { resolve: Function; reject: Function }>();

// Purchase a product (initiates purchase, actual verification handled by listener)
export const purchaseProduct = async (productId: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`\n🛒 Initiating purchase for: ${productId}`);
      
      // Store promise resolver for this product
      pendingPurchases.set(productId, { resolve, reject });
      
      // Request purchase with correct v14 API structure
      // This just initiates the purchase flow - actual result comes via listener
      await RNIap.requestPurchase({
        type: 'in-app',
        request: Platform.OS === 'android' 
          ? { google: { skus: [productId] } }
          : { apple: { sku: productId } }
      });
      
      console.log('✓ Purchase request sent to Google Play');
      console.log('⏳ Waiting for purchase result via listener...');
      
      // Set timeout for purchase (2 minutes)
      setTimeout(() => {
        if (pendingPurchases.has(productId)) {
          pendingPurchases.delete(productId);
          reject(new Error('Purchase timeout - please try again'));
        }
      }, 120000);
      
    } catch (error: any) {
      console.error('❌ Purchase initiation error:', error);
      pendingPurchases.delete(productId);
      
      // Handle user cancellation
      if (error.code === 'E_USER_CANCELLED') {
        reject({ success: false, message: 'Purchase was canceled' });
      } else {
        reject({ success: false, message: error.message || 'Purchase failed' });
      }
    }
  });
};

// Resolve pending purchase with result from listener
export const resolvePendingPurchase = (productId: string, result: any) => {
  const pending = pendingPurchases.get(productId);
  if (pending) {
    pendingPurchases.delete(productId);
    if (result.success) {
      pending.resolve(result);
    } else {
      pending.reject(result);
    }
  }
};

// Restore pending purchases silently (for handling "already-owned" products)
export const restorePendingPurchases = async (): Promise<void> => {
  try {
    console.log('🔍 Checking for pending purchases...');
    
    // Get available purchases (products that are owned but not consumed)
    const availablePurchases = await RNIap.getAvailablePurchases();
    
    if (availablePurchases.length === 0) {
      console.log('✅ No pending purchases found');
      return;
    }

    console.log(`📦 Found ${availablePurchases.length} pending purchase(s)`);

    for (const purchase of availablePurchases) {
      const purchaseToken = purchase.purchaseToken || '';
      const productId = purchase.productId;

      console.log(`\n🔄 Processing pending purchase: ${productId}`);

      // Check if already processed
      const alreadyProcessed = await isPurchaseProcessed(purchaseToken);
      if (alreadyProcessed) {
        console.log(`  ✓ Already processed in database, just consuming...`);
        // Just consume it to clear "already-owned" state
        await RNIap.finishTransaction({ purchase, isConsumable: true });
        console.log(`  ✅ Consumed pending purchase: ${productId}`);
        continue;
      }

      console.log(`  🔐 Verifying with backend...`);

      // Verify with backend
      try {
        const verificationResult = await verifyPurchaseAPI({
          productId: productId,
          purchaseToken: purchaseToken,
          packageName: PACKAGE_NAME,
          transactionId: purchase.transactionId || '',
        });

        if (verificationResult.success) {
          // Mark as processed
          await markPurchaseAsProcessed(purchaseToken);
          
          // Consume the purchase
          await RNIap.finishTransaction({ purchase, isConsumable: true });
          console.log(`  ✅ Verified and consumed: ${productId} (+${verificationResult.credits_added} credits)`);
        } else {
          console.log(`  ⚠️  Verification failed: ${verificationResult.message}`);
          console.log(`  ℹ️  Will retry on next app start`);
        }
      } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`);
        console.log(`  ℹ️  Will retry on next app start`);
      }
    }

    console.log('✅ Pending purchases processed\n');
  } catch (error) {
    console.error('❌ Restore pending purchases error:', error);
  }
};

// Restore purchases (for handling unfinished transactions - with user notification)
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
        
        // Consume the purchase
        await RNIap.finishTransaction({ purchase, isConsumable: true });
        console.log(`✓ Restored and consumed purchase: ${productId}`);
      }
    }

    Alert.alert('Restore Complete', 'Your purchases have been restored');
  } catch (error) {
    console.error('Restore purchases error:', error);
    Alert.alert('Restore Failed', 'Failed to restore purchases');
  }
};

// Setup purchase update listener with automatic verification and consumption
export const setupPurchaseListener = (
  onPurchaseUpdate: (result: any) => void,
  onPurchaseError: (error: any) => void
) => {
  // Purchase update listener
  const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
    async (purchase) => {
      console.log('\n' + '='.repeat(60));
      console.log('🔔 PURCHASE RECEIVED FROM GOOGLE PLAY');
      console.log('='.repeat(60));
      console.log('📦 Product ID:', purchase.productId);
      console.log('🎫 Purchase Token:', purchase.purchaseToken?.substring(0, 50) + '...');
      console.log('🔖 Transaction ID:', purchase.transactionId);
      
      try {
        const purchaseToken = purchase.purchaseToken || '';
        const productId = purchase.productId;
        const transactionId = purchase.transactionId || '';
        
        // Check if already processed (prevent duplicate)
        const alreadyProcessed = await isPurchaseProcessed(purchaseToken);
        if (alreadyProcessed) {
          console.log('⚠️  Purchase already processed, skipping');
          console.log('='.repeat(60) + '\n');
          return;
        }
        
        console.log('\n🔐 Verifying purchase with backend...');
        
        // Verify with backend
        const verificationResult = await verifyPurchaseAPI({
          productId: productId,
          purchaseToken: purchaseToken,
          packageName: PACKAGE_NAME,
          transactionId: transactionId,
        });
        
        if (verificationResult.success) {
          console.log('\n✅ BACKEND VERIFICATION SUCCESS');
          console.log('💰 Credits Added:', verificationResult.credits_added);
          console.log('🏦 Total Credits:', verificationResult.total_credits);
          
          // Mark as processed
          await markPurchaseAsProcessed(purchaseToken);
          
          // CRITICAL: Consume the purchase so it can be purchased again
          console.log('\n🔄 Consuming purchase...');
          await RNIap.finishTransaction({ purchase, isConsumable: true });
          console.log('✅ Purchase consumed - user can buy this product again');
          console.log('='.repeat(60) + '\n');
          
          const result = {
            success: true,
            message: 'Purchase successful',
            credits_added: verificationResult.credits_added,
            total_credits: verificationResult.total_credits,
            transaction_id: verificationResult.transaction_id,
          };
          
          // Resolve pending purchase promise (if exists)
          resolvePendingPurchase(productId, result);
          
          // Notify UI
          onPurchaseUpdate(result);
        } else {
          console.log('\n❌ BACKEND VERIFICATION FAILED');
          console.log('Error:', verificationResult.message);
          console.log('⚠️  NOT consuming purchase - will retry on next app start');
          console.log('='.repeat(60) + '\n');
          
          const result = {
            success: false,
            message: verificationResult.message || 'Verification failed',
          };
          
          // Resolve pending purchase promise (if exists)
          resolvePendingPurchase(productId, result);
          
          // Notify UI of failure
          onPurchaseUpdate(result);
        }
      } catch (error: any) {
        console.log('\n❌ PURCHASE PROCESSING ERROR');
        console.log('Error:', error.message);
        console.log('⚠️  NOT consuming purchase - will retry on next app start');
        console.log('='.repeat(60) + '\n');
        
        const result = {
          success: false,
          message: error.message || 'Purchase processing failed',
        };
        
        // Resolve pending purchase promise (if exists)
        const productId = purchase.productId;
        if (productId) {
          resolvePendingPurchase(productId, result);
        }
        
        // Notify UI of error
        onPurchaseUpdate(result);
      }
    }
  );

  // Purchase error listener
  const purchaseErrorSubscription = RNIap.purchaseErrorListener(
    (error) => {
      console.log('\n❌ PURCHASE ERROR FROM GOOGLE PLAY');
      console.log('Error:', error);
      console.log('='.repeat(60) + '\n');
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
