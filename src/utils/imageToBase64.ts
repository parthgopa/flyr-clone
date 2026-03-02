import * as FileSystem from "expo-file-system/legacy";

export async function imageUriToBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
}
