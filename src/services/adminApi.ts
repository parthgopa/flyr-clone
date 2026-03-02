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

export interface DashboardStats {
    users: {
        total: number;
        active: number;
        suspended: number;
        new_this_week: number;
    };
    generations: {
        total: number;
        this_month: number;
    };
    tokens: {
        total_input_tokens: number;
        total_output_tokens: number;
        total_tokens: number;
        total_images: number;
    };
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    created_at: string | null;
}

export interface UserDetail {
    user: AdminUser & {
        profile_picture: string | null;
        updated_at: string | null;
    };
    generation_stats: {
        total_generations: number;
        total_images: number;
        total_input_tokens: number;
        total_output_tokens: number;
        total_tokens: number;
    };
}

export interface GenerationItem {
    id: string;
    category: string;
    prompt: string;
    sub_category: string;
    total_images: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    result_urls: string[];
    status: string;
    created_at: string | null;
}

export interface TokenStats {
    total_generations: number;
    total_images: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    filter: string;
    categories: {
        category: string;
        count: number;
        tokens: number;
        images: number;
    }[];
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardStats> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/admin/dashboard`, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function fetchUsers(
    page = 1,
    limit = 20,
    search = ""
): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/admin/users`, {
        headers: authHeaders(token),
        params: { page, limit, search },
    });
    return res.data;
}

export async function fetchUserDetail(userId: string): Promise<UserDetail> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/admin/users/${userId}`, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function updateUserStatus(
    userId: string,
    status: "active" | "suspended"
): Promise<{ success: boolean; message: string }> {
    const token = await getAuthToken();
    const res = await axios.put(
        `${backendURL}/admin/users/${userId}/status`,
        { status },
        { headers: authHeaders(token) }
    );
    return res.data;
}

export async function fetchUserGenerations(
    userId: string,
    page = 1,
    limit = 10
): Promise<{
    generations: GenerationItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> {
    const token = await getAuthToken();
    const res = await axios.get(
        `${backendURL}/admin/users/${userId}/generations`,
        {
            headers: authHeaders(token),
            params: { page, limit },
        }
    );
    return res.data;
}

export async function fetchTokenStats(
    filter: "all" | "month" | "previous_month" | "last_3_months" | "last_6_months" | "year" | "custom" = "all",
    from?: string,
    to?: string
): Promise<TokenStats> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/admin/token-stats`, {
        headers: authHeaders(token),
        params: { filter, from, to },
    });
    return res.data;
}

// ─── Cost Settings ──────────────────────────────────────────────────────────

export interface CostSettings {
    input_cost_per_million: number;
    output_cost_per_million: number;
    usd_to_inr: number;
}

export async function fetchCostSettings(): Promise<CostSettings> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/admin/settings`, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function updateCostSettings(
    settings: CostSettings
): Promise<{ success: boolean; message: string } & CostSettings> {
    const token = await getAuthToken();
    const res = await axios.put(
        `${backendURL}/admin/settings`,
        settings,
        { headers: authHeaders(token) }
    );
    return res.data;
}

// ─── Content Management ──────────────────────────────────────────────────────

export async function fetchAdminContent(collectionName: string): Promise<any[]> {
    const token = await getAuthToken();
    const res = await axios.get(`${backendURL}/admin/content/${collectionName}`, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function createAdminContent(collectionName: string, data: any): Promise<{ success: boolean, id: string }> {
    const token = await getAuthToken();
    const res = await axios.post(`${backendURL}/admin/content/${collectionName}`, data, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function updateAdminContent(collectionName: string, docId: string, data: any): Promise<{ success: boolean }> {
    const token = await getAuthToken();
    const res = await axios.put(`${backendURL}/admin/content/${collectionName}/${docId}`, data, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function deleteAdminContent(collectionName: string, docId: string): Promise<{ success: boolean }> {
    const token = await getAuthToken();
    const res = await axios.delete(`${backendURL}/admin/content/${collectionName}/${docId}`, {
        headers: authHeaders(token),
    });
    return res.data;
}

export async function uploadAdminContentImage(uri: string): Promise<{ success: boolean, url: string }> {
    const token = await getAuthToken();

    const formData = new FormData();
    const filename = uri.split('/').pop() || 'upload.jpg';

    // @ts-ignore
    formData.append("file", {
        uri: uri,
        name: filename,
        type: "image/jpeg",
    });

    const res = await axios.post(`${backendURL}/admin/content/upload`, formData, {
        headers: {
            ...authHeaders(token),
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}
