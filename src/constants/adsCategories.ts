export interface AdsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  examples: string[];
}

export const adsCategories: AdsCategory[] = [
  {
    id: "jewelry",
    title: "Jewelry",
    description: "Elegant jewelry advertisements",
    icon: "diamond-outline",
    examples: [
      "Luxury diamond necklace showcase",
      "Gold bracelet with sparkling gems",
      "Wedding ring collection display"
    ]
  },
  {
    id: "fashion",
    title: "Fashion",
    description: "Trendy fashion and apparel ads",
    icon: "shirt-outline",
    examples: [
      "Summer collection runway show",
      "Designer handbag reveal",
      "Sneaker product launch"
    ]
  },
  {
    id: "electronics",
    title: "Electronics",
    description: "Tech product advertisements",
    icon: "phone-portrait-outline",
    examples: [
      "Smartphone feature showcase",
      "Laptop performance demo",
      "Wireless earbuds lifestyle ad"
    ]
  },
  {
    id: "beauty",
    title: "Beauty",
    description: "Cosmetics and skincare ads",
    icon: "sparkles-outline",
    examples: [
      "Lipstick color reveal",
      "Skincare routine transformation",
      "Perfume bottle showcase"
    ]
  },
  {
    id: "food",
    title: "Food & Beverage",
    description: "Delicious food and drink ads",
    icon: "fast-food-outline",
    examples: [
      "Restaurant dish presentation",
      "Coffee brewing process",
      "Dessert close-up reveal"
    ]
  },
  {
    id: "automotive",
    title: "Automotive",
    description: "Car and vehicle advertisements",
    icon: "car-sport-outline",
    examples: [
      "Luxury car driving through city",
      "SUV off-road adventure",
      "Electric vehicle charging"
    ]
  }
];
