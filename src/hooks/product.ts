import { type Product } from "@/types/product";

export async function getProduct(id: string): Promise<Product> {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return {
    id,
    name: "Mango Thokku",
    description: "Spicy and tangy mango pickle made with fresh raw mangoes",
    price: 199,
    sizes: ["250g", "500g", "1kg"],
    ingredients: [
      "Raw Mango",
      "Salt",
      "Red Chilli",
      "Mustard",
      "Fenugreek",
      "Sesame Oil",
      "Asafoetida",
    ],
    spiceLevel: "medium",
    shelfLife: "12 months",
    images: ["https://placeholder.pagebee.io/api/plain/600/600"],
    category: "pickles",
    inStock: true,
    rating: {
      average: 4.5,
      count: 128,
      distribution: {
        5: 80,
        4: 30,
        3: 10,
        2: 5,
        1: 3,
      },
    },
    reviews: [
      {
        id: "1",
        userId: "user1",
        userName: "Priya Sharma",
        userImage: "https://placeholder.pagebee.io/api/plain/50/50",
        rating: 5,
        comment:
          "Absolutely authentic taste! Reminds me of my grandmother's homemade pickle. The spice level is perfect and the mango flavor is spot on.",
        date: "2024-02-15",
        verified: true,
        helpful: 24,
      },
    ],
  };
}
