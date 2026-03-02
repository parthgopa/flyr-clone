/**
 * Content API — fetches categories, models, backgrounds from the backend database.
 * Replaces local hardcoded constants files.
 */
import axios from "axios";
import { backendURL } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShowcaseThumbnail {
    label: string;
    image_url: string;
}

export interface ShowcasePhotoshoot {
    id: string;
    before_url: string;
    after_url: string;
}

export interface ShowcaseCatalogue {
    id: string;
    thumbnails: ShowcaseThumbnail[];
}

export interface Scenario {
    id: string;
    label: string;
    prompt_hint: string;
    is_active: boolean;
}

export interface CategoryData {
    id: string;
    title: string;
    icon: string;
    is_active: boolean;
    order: number;
    subcategories: string[];
    showcase_items: {
        photoshoot: ShowcasePhotoshoot[];
        catalogue: ShowcaseCatalogue[];
        branding: ShowcasePhotoshoot[];
    };
    scenarios: Scenario[];
}

export interface PhotoshootModel {
    id: string;
    name: string;
    sub_type: "photoshoot";
    image_url: string;
    is_active: boolean;
    order: number;
}

export interface CataloguePhoto {
    id: string;
    image_url: string;
    type: "model" | "studio" | "highlight";
    label: string;
}

export interface CatalogueModel {
    id: string;
    name: string;
    sub_type: "catalogue";
    image_url: string;
    is_active: boolean;
    order: number;
    photos: CataloguePhoto[];
}

export interface BrandingPose {
    id: string;
    image_url: string;
    label: string;
}

export interface BrandingModel {
    id: string;
    name: string;
    sub_type: "branding";
    image_url: string;
    is_active: boolean;
    order: number;
    poses: BrandingPose[];
    before_image_url: string;
    after_image_url: string;
}

export interface BrandingBackground {
    id: string;
    type: "color" | "image";
    label: string;
    color?: string;
    image_url?: string;
    is_active: boolean;
    order: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Convert a relative upload path to a full URL */
export function getFullUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${backendURL}/${path}`;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Fetch all active categories */
export async function fetchCategories(): Promise<CategoryData[]> {
    const res = await axios.get(`${backendURL}/content/categories`);
    return res.data;
}

/** Fetch a single category */
export async function fetchCategory(categoryId: string): Promise<CategoryData> {
    const res = await axios.get(`${backendURL}/content/categories/${categoryId}`);
    return res.data;
}

/** Fetch photoshoot models */
export async function fetchPhotoshootModels(): Promise<PhotoshootModel[]> {
    const res = await axios.get(`${backendURL}/content/models?sub_type=photoshoot`);
    return res.data;
}

/** Fetch catalogue models */
export async function fetchCatalogueModels(): Promise<CatalogueModel[]> {
    const res = await axios.get(`${backendURL}/content/models?sub_type=catalogue`);
    return res.data;
}

/** Fetch a single catalogue model */
export async function fetchCatalogueModel(modelId: string): Promise<CatalogueModel> {
    const res = await axios.get(`${backendURL}/content/models/${modelId}`);
    return res.data;
}

/** Fetch branding models */
export async function fetchBrandingModels(): Promise<BrandingModel[]> {
    const res = await axios.get(`${backendURL}/content/models?sub_type=branding`);
    return res.data;
}

/** Fetch branding backgrounds */
export async function fetchBrandingBackgrounds(): Promise<BrandingBackground[]> {
    const res = await axios.get(`${backendURL}/content/branding-backgrounds`);
    return res.data;
}
