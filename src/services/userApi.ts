import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { backendURL } from "./api";

async function getAuthToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem("auth_token");
    } catch (error) {
        console.error("Error getting auth token:", error);
        return null;
    }
}

function authHeaders(token: string | null) {
    return { Authorization: `Bearer ${token}` };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserGeneration {
    id: string;
    category: string;
    sub_category: string;
    prompt: string;
    total_images: number;
    result_urls: string[];
    status: string;
    created_at: string | null;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile_picture: string | null;
    status: string;
    role: string;
    created_at: string | null;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchMyGenerations(
    category?: string
): Promise<{
    generations: UserGeneration[];
    total: number;
    categories: string[];
}> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/user/my-generations`, {
        headers: authHeaders(token),
        params: category && category !== "all" ? { category } : {},
    });
    return res.data;
}

export async function fetchMyProfile(): Promise<UserProfile> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/user/my-profile`, {
        headers: authHeaders(token),
    });
    return res.data;
}
