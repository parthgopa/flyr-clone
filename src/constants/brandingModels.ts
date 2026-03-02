// ─── Branding Models ─────────────────────────────────────────────────────────
// Each branding model has:
//   - id, name
//   - beforeImage / afterImage: thumbnails shown on the "Try It" card (before/after)
//   - poses: list of pose images unique to this model (same structure as catalogueModels)
// ─────────────────────────────────────────────────────────────────────────────

export interface BrandingPose {
    id: string;
    image: any;
    label: string;
}

export interface BrandingModel {
    id: string;
    name: string;
    /** Shown on the HomeScreen card — raw product photo */
    beforeImage: any;
    /** Shown on the HomeScreen card — branded result photo */
    afterImage: any;
    poses: BrandingPose[];
}

export const brandingModels: BrandingModel[] = [
    {
        id: "branding-indian-man",
        name: "Indian Man",
        beforeImage: require("../../assets/indian_man.png"),
        afterImage: require("../../assets/indian_man.png"), // replace with actual branding result
        poses: [
            { id: "bim-stand", image: require("../../assets/indian-man/indian-man-stand.png"), label: "Standing" },
            { id: "bim-3-4", image: require("../../assets/indian-man/indian-man-3-4.png"), label: "3/4 View" },
            { id: "bim-side", image: require("../../assets/indian-man/indian-man-side.png"), label: "Side View" },
            { id: "bim-closeup", image: require("../../assets/indian-man/indian-man-closeup.png"), label: "Close-up" },
            { id: "bim-hips", image: require("../../assets/indian-man/indian-man-hips.png"), label: "Hips View" },
            { id: "bim-back", image: require("../../assets/indian-man/indian-man-back.png"), label: "Back View" },
        ],
    },
    {
        id: "branding-indian-woman",
        name: "Indian Woman",
        beforeImage: require("../../assets/indian_woman.png"),
        afterImage: require("../../assets/indian_woman.png"), // replace with actual branding result
        poses: [
            { id: "biw-stand", image: require("../../assets/indian-woman/indian-woman-stand.png"), label: "Standing" },
            { id: "biw-3-4", image: require("../../assets/indian-woman/indian-woman-3-4.png"), label: "3/4 View" },
            { id: "biw-side", image: require("../../assets/indian-woman/indian-woman-side.png"), label: "Side View" },
            { id: "biw-closeup", image: require("../../assets/indian-woman/indian-woman-closeup.png"), label: "Close-up" },
            { id: "biw-hips", image: require("../../assets/indian-woman/indian-woman-hips.png"), label: "Hips View" },
            { id: "biw-back", image: require("../../assets/indian-woman/indian-woman-back.png"), label: "Back View" },
        ],
    },
    {
        id: "branding-indian-boy",
        name: "Indian Boy",
        beforeImage: require("../../assets/indian_boy.png"),
        afterImage: require("../../assets/indian_boy.png"),
        poses: [
            { id: "bib-stand", image: require("../../assets/indian-boy/indian-boy-stand.png"), label: "Standing" },
            { id: "bib-3-4", image: require("../../assets/indian-boy/indian-boy-3-4.png"), label: "3/4 View" },
            { id: "bib-side", image: require("../../assets/indian-boy/indian-boy-side.png"), label: "Side View" },
            { id: "bib-closeup", image: require("../../assets/indian-boy/indian-boy-closeup.png"), label: "Close-up" },
            { id: "bib-hips", image: require("../../assets/indian-boy/indian-boy-hips.png"), label: "Hips View" },
            { id: "bib-back", image: require("../../assets/indian-boy/indian-boy-back.png"), label: "Back View" },
        ],
    },
    {
        id: "branding-indian-girl",
        name: "Indian Girl",
        beforeImage: require("../../assets/indian_girl.png"),
        afterImage: require("../../assets/indian_girl.png"),
        poses: [
            { id: "big-stand", image: require("../../assets/indian-girl/indian-girl-stand.png"), label: "Standing" },
            { id: "big-3-4", image: require("../../assets/indian-girl/indian-girl-3-4.png"), label: "3/4 View" },
            { id: "big-side", image: require("../../assets/indian-girl/indian-girl-side.png"), label: "Side View" },
            { id: "big-closeup", image: require("../../assets/indian-girl/indian-girl-closeup.png"), label: "Close-up" },
            { id: "big-hips", image: require("../../assets/indian-girl/indian-girl-hips.png"), label: "Hips View" },
            { id: "big-back", image: require("../../assets/indian-girl/indian-girl-back.png"), label: "Back View" },
        ],
    },
    {
        id: "branding-inter-man",
        name: "International Man",
        beforeImage: require("../../assets/inter_man.png"),
        afterImage: require("../../assets/inter_man.png"),
        poses: [
            { id: "bintm-stand", image: require("../../assets/inter-man/inter-man-stand.png"), label: "Standing" },
            { id: "bintm-3-4", image: require("../../assets/inter-man/inter-man-3-4.png"), label: "3/4 View" },
            { id: "bintm-side", image: require("../../assets/inter-man/inter-man-side.png"), label: "Side View" },
            { id: "bintm-closeup", image: require("../../assets/inter-man/inter-man-closeup.png"), label: "Close-up" },
            { id: "bintm-hips", image: require("../../assets/inter-man/inter-man-hips.png"), label: "Hips View" },
            { id: "bintm-back", image: require("../../assets/inter-man/inter-man-back.png"), label: "Back View" },
        ],
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getBrandingModelById(id: string): BrandingModel | undefined {
    return brandingModels.find((m) => m.id === id);
}

export function getBrandingPoseById(modelId: string, poseId: string): BrandingPose | undefined {
    const model = getBrandingModelById(modelId);
    return model?.poses.find((p) => p.id === poseId);
}
