export interface CatalogueModelPhoto {
  id: string;
  image: any;
  type: "model" | "studio" | "highlight";
  label: string;
}

export interface CatalogueModel {
  id: string;
  name: string;
  photos: CatalogueModelPhoto[];
}

export const catalogueModels: CatalogueModel[] = [
  {
    id: "indian-man",
    name: "Indian Man",
    photos: [
      // Model Views (9 photos)
      { id: "indian-man-3-4", image: require("../../assets/indian-man/indian-man-3-4.png"), type: "model", label: "3/4 View" },
      { id: "indian-man-away", image: require("../../assets/indian-man/indian-man-away.png"), type: "model", label: "Away View" },
      { id: "indian-man-back", image: require("../../assets/indian-man/indian-man-back.png"), type: "model", label: "Back View" },
      { id: "indian-man-chair", image: require("../../assets/indian-man/indian-man-chair.png"), type: "model", label: "Chair Pose" },
      { id: "indian-man-closeup", image: require("../../assets/indian-man/indian-man-closeup.png"), type: "model", label: "Close-up" },
      { id: "indian-man-hips", image: require("../../assets/indian-man/indian-man-hips.png"), type: "model", label: "Hips View" },
      { id: "indian-man-side", image: require("../../assets/indian-man/indian-man-side.png"), type: "model", label: "Side View" },
      { id: "indian-man-stand", image: require("../../assets/indian-man/indian-man-stand.png"), type: "model", label: "Standing" },
      { id: "indian-man-walk", image: require("../../assets/indian-man/indian-man-walk.png"), type: "model", label: "Walking" },
      
      // Studio Views (2 photos - ending with product, magic)
      { id: "indian-man-product", image: require("../../assets/indian-man/indian-man-product.png"), type: "studio", label: "Product" },
      { id: "indian-man-magic", image: require("../../assets/indian-man/indian-man-magic.png"), type: "studio", label: "Magic View" },
      
      // Key Highlights (2 photos - ending with with-model, without-model)
      { id: "indian-man-with-model", image: require("../../assets/indian-man/indian-man-with-model.png"), type: "highlight", label: "With Model" },
      { id: "indian-man-without-model", image: require("../../assets/indian-man/indian-man-without-model.png"), type: "highlight", label: "Without Model" },
    ],
  },
  {
    id: "indian-woman",
    name: "Indian Woman",
    photos: [
      // Model Views (9 photos) - placeholder for now
      { id: "indian-woman-3-4", image: require("../../assets/indian-woman/indian-woman-3-4.png"), type: "model", label: "3/4 View" },
      { id: "indian-woman-away", image: require("../../assets/indian-woman/indian-woman-away.png"), type: "model", label: "Away View" },
      { id: "indian-woman-back", image: require("../../assets/indian-woman/indian-woman-back.png"), type: "model", label: "Back View" },
      { id: "indian-woman-chair", image: require("../../assets/indian-woman/indian-woman-chair.png"), type: "model", label: "Chair Pose" },
      { id: "indian-woman-closeup", image: require("../../assets/indian-woman/indian-woman-closeup.png"), type: "model", label: "Close-up" },
      { id: "indian-woman-hips", image: require("../../assets/indian-woman/indian-woman-hips.png"), type: "model", label: "Hips View" },
      { id: "indian-woman-side", image: require("../../assets/indian-woman/indian-woman-side.png"), type: "model", label: "Side View" },
      { id: "indian-woman-stand", image: require("../../assets/indian-woman/indian-woman-stand.png"), type: "model", label: "Standing" },
      { id: "indian-woman-walk", image: require("../../assets/indian-woman/indian-woman-walk.png"), type: "model", label: "Walking" },
      
      // Studio Views (2 photos) - placeholder for now
      { id: "indian-woman-product", image: require("../../assets/indian-woman/indian-woman-product.png"), type: "studio", label: "Product" },
      { id: "indian-woman-magic", image: require("../../assets/indian-woman/indian-woman-magic.png"), type: "studio", label: "Magic View" },
      
      // Key Highlights (2 photos) - placeholder for now
      { id: "indian-woman-with-model", image: require("../../assets/indian-woman/indian-woman-with-model.png"), type: "highlight", label: "With Model" },
      { id: "indian-woman-without-model", image: require("../../assets/indian-woman/indian-woman-without-model.png"), type: "highlight", label: "Without Model" },
    ],
  },
  {
    id: "indian-boy",
    name: "Indian Boy",
    photos: [
      // Model Views (9 photos)
      { id: "indian-boy-3-4", image: require("../../assets/indian-boy/indian-boy-3-4.png"), type: "model", label: "3/4 View" },
      { id: "indian-boy-away", image: require("../../assets/indian-boy/indian-boy-away.png"), type: "model", label: "Away View" },
      { id: "indian-boy-back", image: require("../../assets/indian-boy/indian-boy-back.png"), type: "model", label: "Back View" },
      { id: "indian-boy-chair", image: require("../../assets/indian-boy/indian-boy-chair.png"), type: "model", label: "Chair Pose" },
      { id: "indian-boy-closeup", image: require("../../assets/indian-boy/indian-boy-closeup.png"), type: "model", label: "Close-up" },
      { id: "indian-boy-hips", image: require("../../assets/indian-boy/indian-boy-hips.png"), type: "model", label: "Hips View" },
      { id: "indian-boy-side", image: require("../../assets/indian-boy/indian-boy-side.png"), type: "model", label: "Side View" },
      { id: "indian-boy-stand", image: require("../../assets/indian-boy/indian-boy-stand.png"), type: "model", label: "Standing" },
      { id: "indian-boy-walk", image: require("../../assets/indian-boy/indian-boy-walk.png"), type: "model", label: "Walking" },
      
      // Studio Views (2 photos - ending with product, magic)
      { id: "indian-boy-product", image: require("../../assets/indian-boy/indian-boy-product.png"), type: "studio", label: "Product" },
      { id: "indian-boy-magic", image: require("../../assets/indian-boy/indian-boy-magic.png"), type: "studio", label: "Magic View" },
      
      // Key Highlights (2 photos - ending with with-model, without-model)
      { id: "indian-boy-with-model", image: require("../../assets/indian-boy/indian-boy-with-model.png"), type: "highlight", label: "With Model" },
      { id: "indian-boy-without-model", image: require("../../assets/indian-boy/indian-boy-without-model.png"), type: "highlight", label: "Without Model" },
    ],
  },
  {
    id: "indian-girl",
    name: "Indian Girl",
    photos: [
      // Model Views (9 photos) - placeholder for now
      { id: "indian-girl-3-4", image: require("../../assets/indian-girl/indian-girl-3-4.png"), type: "model", label: "3/4 View" },
      { id: "indian-girl-away", image: require("../../assets/indian-girl/indian-girl-away.png"), type: "model", label: "Away View" },
      { id: "indian-girl-back", image: require("../../assets/indian-girl/indian-girl-back.png"), type: "model", label: "Back View" },
      { id: "indian-girl-chair", image: require("../../assets/indian-girl/indian-girl-chair.png"), type: "model", label: "Chair Pose" },
      { id: "indian-girl-closeup", image: require("../../assets/indian-girl/indian-girl-closeup.png"), type: "model", label: "Close-up" },
      { id: "indian-girl-hips", image: require("../../assets/indian-girl/indian-girl-hips.png"), type: "model", label: "Hips View" },
      { id: "indian-girl-side", image: require("../../assets/indian-girl/indian-girl-side.png"), type: "model", label: "Side View" },
      { id: "indian-girl-stand", image: require("../../assets/indian-girl/indian-girl-stand.png"), type: "model", label: "Standing" },
      { id: "indian-girl-walk", image: require("../../assets/indian-girl/indian-girl-walk.png"), type: "model", label: "Walking" },
      
      // Studio Views (2 photos) - placeholder for now
      { id: "indian-girl-product", image: require("../../assets/indian-girl/indian-girl-product.png"), type: "studio", label: "Product" },
      { id: "indian-girl-magic", image: require("../../assets/indian-girl/indian-girl-magic.png"), type: "studio", label: "Magic View" },
      
      // Key Highlights (2 photos) - placeholder for now
      { id: "indian-girl-with-model", image: require("../../assets/indian-girl/indian-girl-with-model.png"), type: "highlight", label: "With Model" },
      { id: "indian-girl-without-model", image: require("../../assets/indian-girl/indian-girl-without-model.png"), type: "highlight", label: "Without Model" },
    ],
  },
  {
    id: "international-man",
    name: "International Man",
    photos: [
      // Model Views (9 photos) - placeholder for now
      { id: "international-man-3-4", image: require("../../assets/inter-man/inter-man-3-4.png"), type: "model", label: "3/4 View" },
      { id: "international-man-away", image: require("../../assets/inter-man/inter-man-away.png"), type: "model", label: "Away View" },
      { id: "international-man-back", image: require("../../assets/inter-man/inter-man-back.png"), type: "model", label: "Back View" },
      { id: "international-man-chair", image: require("../../assets/inter-man/inter-man-chair.png"), type: "model", label: "Chair Pose" },
      { id: "international-man-closeup", image: require("../../assets/inter-man/inter-man-closeup.png"), type: "model", label: "Close-up" },
      { id: "international-man-hips", image: require("../../assets/inter-man/inter-man-hips.png"), type: "model", label: "Hips View" },
      { id: "international-man-side", image: require("../../assets/inter-man/inter-man-side.png"), type: "model", label: "Side View" },
      { id: "international-man-stand", image: require("../../assets/inter-man/inter-man-stand.png"), type: "model", label: "Standing" },
      { id: "international-man-walk", image: require("../../assets/inter-man/inter-man-walk.png"), type: "model", label: "Walking" },
      
      // Studio Views (2 photos) - placeholder for now
      { id: "international-man-product", image: require("../../assets/inter-man/inter-man-product.png"), type: "studio", label: "Product" },
      { id: "international-man-magic", image: require("../../assets/inter-man/inter-man-magic.png"), type: "studio", label: "Magic View" },
      
      // Key Highlights (2 photos) - placeholder for now
      { id: "international-man-with-model", image: require("../../assets/inter-man/inter-man-with-model.png"), type: "highlight", label: "With Model" },
      { id: "international-man-without-model", image: require("../../assets/inter-man/inter-man-without-model.png"), type: "highlight", label: "Without Model" },
    ],
  },
];

// Helper function to get model photos by type
export function getModelPhotosByType(modelId: string, type: "model" | "studio" | "highlight"): CatalogueModelPhoto[] {
  const model = catalogueModels.find(m => m.id === modelId);
  if (!model) return [];
  
  return model.photos.filter(photo => photo.type === type);
}

// Helper function to get all photos for a model
export function getModelPhotos(modelId: string): CatalogueModelPhoto[] {
  const model = catalogueModels.find(m => m.id === modelId);
  return model ? model.photos : [];
}
