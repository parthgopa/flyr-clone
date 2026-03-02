import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const backendURL = 'http://10.191.230.22:5000';
console.log("backendURL", backendURL);

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
 * Start a generation job. Returns immediately with jobId + scenario info.
 */
export async function startGenerationJob(payload: {
  categoryId: string;
  modelImage: string;
  productImage: string;
}) {
  const token = await getAuthToken();
  const response = await axios.post(
    `${backendURL}/generate/generate-image`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data as {
    jobId: string;
    totalImages: number;
    scenarios: { id: string; label: string }[];
  };
}

/**
 * Start a catalogue generation job with multiple model images.
 */
export async function startCatalogueGenerationJob(payload: {
  categoryId: string;
  modelImages: string[];
  productImage: string;
  modelLabels: string[];
}) {
  const token = await getAuthToken();
  const response = await axios.post(
    `${backendURL}/generate/generate-catalogue`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data as {
    jobId: string;
    totalImages: number;
    scenarios: { id: string; label: string }[];
  };
}

/**
 * Start a branding generation job with pose, product, logo, and business details.
 */
export async function startBrandingGenerationJob(payload: {
  categoryId: string;
  modelId: string;
  poseImage: string;
  productImage: string;
  logoImage: string | null;
  businessName: string;
  phoneNumber?: string;
  address?: string;
  webUrl?: string;
  backgroundColor?: string | null;
  backgroundLabel?: string;
  aspectRatio?: string;
  aspectRatioDescription?: string;
}) {
  const token = await getAuthToken();
  const response = await axios.post(
    `${backendURL}/generate/generate-branding`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data as {
    jobId: string;
    totalImages: number;
    scenarios: { id: string; label: string }[];
  };
}

/**
 * Poll a job for its current status + images generated so far.
 */
export async function pollJobStatus(jobId: string) {
  const response = await axios.get(
    `${backendURL}/generate/job/${jobId}`
  );
  return response.data as {
    jobId: string;
    status: "generating" | "done";
    totalImages: number;
    completedImages: number;
    currentScenario: string | null;
    images: { scenarioId: string; label: string; imageUrl: string }[];
    errors: { scenarioId: string; label: string; error: string }[];
  };
}
