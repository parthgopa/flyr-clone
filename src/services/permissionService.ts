// permissionservice.ts
import * as MediaLibrary from 'expo-media-library';
import { Alert, Linking } from 'react-native';

export const requestGalleryPermissionOnLaunch = async (): Promise<boolean> => {
    try {
        const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
        console.log(status, canAskAgain);

        if (status === 'granted') {
            return true;
        }

        // If we can't ask again (user previously denied + "don't ask again"), 
        // we must send them to settings.
        if (status === 'denied' && !canAskAgain) {
            Alert.alert(
                'Permission Required',
                'Gallery access is needed to save images. Please enable it in your device settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
            return false;
        }

        // This is where the magic happens for first-time users
        const { status: finalStatus } = await MediaLibrary.requestPermissionsAsync();

        return finalStatus === 'granted';

    } catch (error) {
        console.error('Error requesting gallery permission:', error);
        return false;
    }
};