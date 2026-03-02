import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Alert, Linking } from "react-native";

/**
 * Downloads an image from a URL or saves a local file to the device gallery.
 * Requests permissions if needed.
 */

export async function downloadImage(imageUrl: string, filename?: string, showAlert: boolean = true): Promise<boolean> {
  try {
    // 1. Robust Permission Check
    const current = await MediaLibrary.getPermissionsAsync();
    let status = current.status;

    if (status !== 'granted') {
      if (current.canAskAgain) {
        const response = await MediaLibrary.requestPermissionsAsync();
        status = response.status;
      } else {
        Alert.alert(
          "Permission Required",
          "Gallery access is blocked. Please enable it in Settings to save images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    }

    if (status !== 'granted') return false;

    // 2. Prepare File URI
    let fileUri = imageUrl;
    let finalFilename = filename || `img_${Date.now()}.jpg`;
    if (!finalFilename.match(/\.(jpg|jpeg|png|webp)$/i)) finalFilename += '.jpg';

    // 3. Download if Remote
    if (imageUrl.startsWith("http")) {
      const tempUri = `${FileSystem.documentDirectory}${finalFilename}`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, tempUri);
      if (downloadResult.status !== 200) throw new Error("Download failed");
      fileUri = downloadResult.uri;
    }

    // 4. Save to Media Library (The "Safe" Way)
    const asset = await MediaLibrary.createAssetAsync(fileUri);

    // 5. Album Logic - This is where the 'Modify' popup usually happens
    try {
      const album = await MediaLibrary.getAlbumAsync("Flyr");
      if (album === null) {
        // Use copyAsset: false on Android to avoid 'Modify' prompts for duplicates
        await MediaLibrary.createAlbumAsync("Flyr", asset, Platform.OS === 'ios');
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, Platform.OS === 'ios');
      }
    } catch (albumErr) {
      console.warn("Album sync failed, but asset was created in main gallery.");
    }

    if (showAlert) {
      Alert.alert("Success", "Image saved to gallery!");
    }
    return true;
  } catch (error) {
    console.error("Download error:", error);
    if (showAlert) Alert.alert("Download Failed", "Could not save image.");
    return false;
  }
}

/**
 * Downloads multiple images and shows progress
 */
export async function downloadMultipleImages(
  images: { url: string; label: string }[],
  onProgress?: (completed: number, total: number) => void
): Promise<boolean> {
  try {
    // Request media library permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant media library access to download images."
      );
      return false;
    }

    let successCount = 0;
    const totalImages = images.length;

    for (let i = 0; i < totalImages; i++) {
      const { url, label } = images[i];
      const filename = `${label.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now() + i}.jpg`;

      try {
        const success = await downloadImage(url, filename, false);
        if (success) {
          successCount++;
        }
        onProgress?.(successCount, totalImages);
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error);
      }
    }

    if (successCount > 0) {
      Alert.alert(
        "Download Complete",
        `Successfully downloaded ${successCount} out of ${totalImages} images to your gallery!`
      );
      return true;
    } else {
      Alert.alert("Download Failed", "Could not download any images.");
      return false;
    }
  } catch (error) {
    console.error("Batch download error:", error);
    Alert.alert("Download Failed", "Could not download images.");
    return false;
  }
}
