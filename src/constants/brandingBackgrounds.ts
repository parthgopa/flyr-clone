// ─── Branding Backgrounds ────────────────────────────────────────────────────
// Two types of backgrounds:
//   1. Solid color swatches (hex strings)
//   2. Image-based backgrounds (require() assets)
//
// To add new image backgrounds, drop your PNG/JPG files into
// `assets/branding-backgrounds/` and add entries to the `backgroundImages`
// array below. The UI renders vertically in a small preview strip.
// ─────────────────────────────────────────────────────────────────────────────

export type BackgroundType = "color" | "image";

export interface BrandingBackground {
    id: string;
    type: BackgroundType;
    label: string;
    /** For type === "color": hex string, e.g. "#F8F5F0" */
    color?: string;
    /** For type === "image": require() asset */
    image?: any;
}

// ── Solid Color Swatches ──────────────────────────────────────────────────────
export const backgroundColors: BrandingBackground[] = [
    { id: "bg-white", type: "color", label: "Pure White", color: "#FFFFFF" },
    { id: "bg-cream", type: "color", label: "Cream", color: "#F8F5EE" },
    { id: "bg-ivory", type: "color", label: "Ivory", color: "#FFFFF0" },
    { id: "bg-light-gray", type: "color", label: "Light Gray", color: "#F2F2F2" },
    { id: "bg-warm-gray", type: "color", label: "Warm Gray", color: "#E8E4DF" },
    { id: "bg-charcoal", type: "color", label: "Charcoal", color: "#2C2C2C" },
    { id: "bg-black", type: "color", label: "Black", color: "#000000" },
    { id: "bg-navy", type: "color", label: "Navy", color: "#1A2744" },
    { id: "bg-forest", type: "color", label: "Forest Green", color: "#1A3A2A" },
    { id: "bg-blush", type: "color", label: "Blush Pink", color: "#F4D5D5" },
    { id: "bg-lavender", type: "color", label: "Lavender", color: "#E8DEFF" },
    { id: "bg-gold-tint", type: "color", label: "Gold Tint", color: "#FFF8E7" },
    { id: "bg-sky", type: "color", label: "Sky Blue", color: "#E7F4FF" },
    { id: "bg-mint", type: "color", label: "Mint", color: "#E0F7F4" },
    { id: "bg-rose", type: "color", label: "Rose Gold", color: "#F9E5E5" },
];

// ── Image-based Backgrounds ──────────────────────────────────────────────────
// Add your background image files to assets/background/
export const backgroundImages: BrandingBackground[] = [
    {
        id: "bg-img-1",
        type: "image",
        label: "Background 1",
        image: require("../../assets/background/back-1.webp"),
    },
    {
        id: "bg-img-2",
        type: "image",
        label: "Background 2",
        image: require("../../assets/background/back-2.webp"),
    },
    {
        id: "bg-img-3",
        type: "image",
        label: "Background 3",
        image: require("../../assets/background/back-3.webp"),
    },
    {
        id: "bg-img-4",
        type: "image",
        label: "Background 4",
        image: require("../../assets/background/back-4.webp"),
    },
    {
        id: "bg-img-5",
        type: "image",
        label: "Background 5",
        image: require("../../assets/background/back-5.webp"),
    },
];

// ── All Backgrounds (colors first, then images) ───────────────────────────────
export const allBrandingBackgrounds: BrandingBackground[] = [
    ...backgroundColors,
    ...backgroundImages,
];
