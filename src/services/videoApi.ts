import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import backendURL from "../config/api";
import { backendURL } from "./api";
console.log("Video API - Backend URL:", backendURL);

/**
 * Get authentication token from storage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("auth_token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Refine user's prompt using AI with category-specific templates
 */
export const refinePrompt = async (prompt: string, category: string = "general") => {
  try {
    console.log("API: Refining prompt...");
    console.log("API: Category:", category);
    const response = await axios.post(`${backendURL}/video/refine-prompt`, {
      prompt,
      category,
    });
    console.log("API: Prompt refined successfully");
    return response.data;
  } catch (error: any) {
    console.error("API: Prompt refinement failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Generate video and wait for completion (blocking call)
 * This will take 30-60 seconds to complete
 */
export const generateVideo = async (
  prompt: string,
  category: string = "general",
  aspectRatio: string = "9:16",
  resolution: string = "720p"
) => {
  try {
    console.log("API: Starting video generation (this will take 30-60 seconds)...");
    console.log("API: Prompt:", prompt);
    console.log("API: Category:", category);
    
    const token = await getAuthToken();
    const response = await axios.post(`${backendURL}/video/generate`, {
      prompt,
      category,
      aspectRatio,
      resolution,
    }, {
      timeout: 120000, // 2 minute timeout
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("API: Video generation completed!");
    console.log("API: Video URI:", response.data.video_uri);
    return response.data;
  } catch (error: any) {
    console.error("API: Video generation failed:", error.response?.data || error.message);
    throw error;
  }
};
