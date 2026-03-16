// permissionservice.ts
import * as MediaLibrary from 'expo-media-library';
import { Alert, Linking, Platform } from 'react-native';

export const requestGalleryPermissionOnLaunch = async (): Promise<boolean> => {
    try {
        const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
        console.log('Gallery permission status:', status, 'canAskAgain:', canAskAgain);

        if (status === 'granted') {
            return true;
        }

        // If user permanently denied (can't ask again), show settings alert
        if (status === 'denied' && !canAskAgain) {
            Alert.alert(
                'Storage Permission Required',
                `Please enable storage permission in Settings to save images.\n\nSettings > Apps > ${Platform.OS === 'android' ? 'Flyr Clone' : 'This App'} > Permissions > Storage`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
            return false;
        }

        // Request permission - this will show native Android dialog with:
        // "Allow once", "Allow all the time", "Deny"
        const { status: finalStatus } = await MediaLibrary.requestPermissionsAsync();

        return finalStatus === 'granted';

    } catch (error) {
        console.error('Error requesting gallery permission:', error);
        return false;
    }
};