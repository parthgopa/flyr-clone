import React, { useEffect } from 'react';
import { initializeIAP, setupPurchaseListener, endIAP, restorePendingPurchases } from '../services/iapService';

/**
 * IAPProvider - Initializes In-App Purchase service and sets up listeners
 * This must wrap the app to handle purchases globally
 */
export const IAPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const initIAP = async () => {
      console.log('🚀 Initializing IAP service...');
      
      // Initialize IAP connection
      await initializeIAP();
      
      // Set up purchase listener with empty handlers
      // The listener will resolve pending purchases automatically
      const cleanup = setupPurchaseListener(
        (result) => {
          // Purchase update handled - this is called by the listener
          // The purchaseProduct() promise is resolved automatically
          if (result.success) {
            console.log('✅ Purchase listener: Success');
          } else {
            console.log('❌ Purchase listener: Failed -', result.message);
          }
        },
        (error) => {
          console.log('❌ Purchase error:', error);
        }
      );
      
      // Restore any pending purchases on app start
      // This handles "already-owned" products that weren't consumed
      console.log('🔄 Checking for pending purchases...');
      setTimeout(() => {
        restorePendingPurchases();
      }, 2000); // Wait 2 seconds for IAP to fully initialize
      
      return cleanup;
    };
    
    let cleanup: (() => void) | undefined;
    
    initIAP().then((cleanupFn) => {
      cleanup = cleanupFn;
    });
    
    // Cleanup on unmount
    return () => {
      console.log('🛑 Cleaning up IAP service...');
      if (cleanup) cleanup();
      endIAP();
    };
  }, []);
  
  return <>{children}</>;
};
