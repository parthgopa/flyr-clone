export type SubcategoryType = "photoshoot" | "catalogue" | "branding";

export interface Subcategory {
  id: SubcategoryType;
  title: string;
  description: string;
  imageCount: number;
  icon: string;
}

export const subcategories: Subcategory[] = [
  {
    id: "photoshoot",
    title: "Photo Shoot",
    description: "Before & After professional photography",
    imageCount: 2,
    icon: "camera",
  },
  {
    id: "catalogue",
    title: "Catalogue",
    description: "Multiple product views and angles",
    imageCount: 4,
    icon: "grid",
  },
  {
    id: "branding",
    title: "Branding",
    description: "Before & After brand-focused shots",
    imageCount: 2,
    icon: "sparkles",
  },
];

export const categories = [
  {
    id: "jewelry",
    title: "Jewelry",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        {
          id: "j_ps1",
          before: require("../../assets/jewelry.jpg"),
          after: require("../../assets/jewelery_shoot.png"),
        },
        {
          id: "j_ps2",
          before: require("../../assets/jewelry.jpg"),
          after: require("../../assets/diamond.webp"),
        },
        {
          id: "j_ps3",
          before: require("../../assets/jewelry.jpg"),
          after: require("../../assets/diamond.webp"),
        },
      ],
      catalogue: [
        {
          id: "j_cat1",
          thumbnails: [
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Sitting", image: require("../../assets/jewelry.jpg") },
            { label: "Product View", image: require("../../assets/jewelry.jpg") },
            { label: "Key Highlights", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "j_cat2",
          thumbnails: [
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Sitting", image: require("../../assets/jewelry.jpg") },
            { label: "Product View", image: require("../../assets/jewelry.jpg") },
            { label: "Key Highlights", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        {
          id: "j_br1",
          before: require("../../assets/jewelry.jpg"),
          after: require("../../assets/diamond.webp"),
        },
        {
          id: "j_br2",
          before: require("../../assets/jewelry.jpg"),
          after: require("../../assets/diamond.webp"),
        },
      ],
    },
  },
  {
    id: "fashion",
    title: "Fashion & Clothing",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        { id: "f_ps1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "f_ps2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
      catalogue: [
        {
          id: "f_cat1",
          thumbnails: [
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Sitting", image: require("../../assets/jewelry.jpg") },
            { label: "Product View", image: require("../../assets/jewelry.jpg") },
            { label: "Back View", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
                {
          id: "f_cat2",
          thumbnails: [
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Sitting", image: require("../../assets/jewelry.jpg") },
            { label: "Product View", image: require("../../assets/jewelry.jpg") },
            { label: "Back View", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        { id: "f_br1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "f_br2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
    },
  },
  {
    id: "home",
    title: "Home Decor",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        { id: "h_ps1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "h_ps2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "h_ps3", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
      catalogue: [
        {
          id: "h_cat1",
          thumbnails: [
            { label: "Front View", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Detail Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Room Context", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "h_cat2",
          thumbnails: [
            { label: "Front View", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Detail Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Room Context", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "h_cat3",
          thumbnails: [
            { label: "Front View", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Detail Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Room Context", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        { id: "h_br1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "h_br2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
    },
  },
  {
    id: "kitchen",
    title: "Kitchen & Dining",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        { id: "k_ps1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "k_ps2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "k_ps3", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
      catalogue: [
        {
          id: "k_cat1",
          thumbnails: [
            { label: "Top View", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "In Use", image: require("../../assets/jewelry.jpg") },
            { label: "Features", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "k_cat2",
          thumbnails: [
            { label: "Top View", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "In Use", image: require("../../assets/jewelry.jpg") },
            { label: "Features", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "k_cat3",
          thumbnails: [
            { label: "Top View", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "In Use", image: require("../../assets/jewelry.jpg") },
            { label: "Features", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        { id: "k_br1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "k_br2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
    },
  },
  {
    id: "electronics",
    title: "Electronics",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        { id: "e_ps1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "e_ps2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "e_ps3", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
      catalogue: [
        {
          id: "e_cat1",
          thumbnails: [
            { label: "Front View", image: require("../../assets/jewelry.jpg") },
            { label: "Back View", image: require("../../assets/jewelry.jpg") },
            { label: "Screen On", image: require("../../assets/jewelry.jpg") },
            { label: "Ports", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "e_cat2",
          thumbnails: [
            { label: "Front View", image: require("../../assets/jewelry.jpg") },
            { label: "Back View", image: require("../../assets/jewelry.jpg") },
            { label: "Screen On", image: require("../../assets/jewelry.jpg") },
            { label: "Ports", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "e_cat3",
          thumbnails: [
            { label: "Front View", image: require("../../assets/jewelry.jpg") },
            { label: "Back View", image: require("../../assets/jewelry.jpg") },
            { label: "Screen On", image: require("../../assets/jewelry.jpg") },
            { label: "Ports", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        { id: "e_br1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "e_br2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
    },
  },
  {
    id: "beauty",
    title: "Beauty & Cosmetics",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        { id: "b_ps1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "b_ps2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "b_ps3", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
      catalogue: [
        {
          id: "b_cat1",
          thumbnails: [
            { label: "Product Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Swatch", image: require("../../assets/jewelry.jpg") },
            { label: "In Use", image: require("../../assets/jewelry.jpg") },
            { label: "Ingredients", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "b_cat2",
          thumbnails: [
            { label: "Product Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Swatch", image: require("../../assets/jewelry.jpg") },
            { label: "In Use", image: require("../../assets/jewelry.jpg") },
            { label: "Ingredients", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "b_cat3",
          thumbnails: [
            { label: "Product Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Swatch", image: require("../../assets/jewelry.jpg") },
            { label: "In Use", image: require("../../assets/jewelry.jpg") },
            { label: "Ingredients", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        { id: "b_br1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "b_br2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
    },
  },
  {
    id: "sports",
    title: "Sports & Fitness",
    subcategories: subcategories,
    itemsBySubcategory: {
      photoshoot: [
        { id: "s_ps1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "s_ps2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "s_ps3", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
      catalogue: [
        {
          id: "s_cat1",
          thumbnails: [
            { label: "Action Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Detail", image: require("../../assets/jewelry.jpg") },
            { label: "Features", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "s_cat2",
          thumbnails: [
            { label: "Action Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Detail", image: require("../../assets/jewelry.jpg") },
            { label: "Features", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
        {
          id: "s_cat3",
          thumbnails: [
            { label: "Action Shot", image: require("../../assets/jewelry.jpg") },
            { label: "Side View", image: require("../../assets/jewelry.jpg") },
            { label: "Detail", image: require("../../assets/jewelry.jpg") },
            { label: "Features", image: require("../../assets/diamond.webp") },
            { label: "Before", image: require("../../assets/jewelry.jpg") },
          ],
        },
      ],
      branding: [
        { id: "s_br1", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
        { id: "s_br2", before: require("../../assets/jewelry.jpg"), after: require("../../assets/diamond.webp") },
      ],
    },
  },
];
