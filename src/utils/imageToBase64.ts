import * as FileSystem from "expo-file-system/legacy";

export async function imageUriToBase64(uri: string): Promise<string> {
  // Check if it's a remote URL (http/https)
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    // Download the remote image to local cache first
    const filename = uri.split('/').pop() || 'temp_image.png';
    const localUri = FileSystem.cacheDirectory + filename;
    
    const downloadResult = await FileSystem.downloadAsync(uri, localUri);
    
    // Now read the local file as base64
    return await FileSystem.readAsStringAsync(downloadResult.uri, {
      encoding: "base64",
    });
  }
  
  // For local file URIs, read directly
  return await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
}
