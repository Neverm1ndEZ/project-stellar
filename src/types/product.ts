export type SpiceLevel = "mild" | "medium" | "hot";

export interface Review {
	id: string;
	userId: string;
	userName: string;
	userImage?: string;
	rating: number;
	comment: string;
	date: string;
	verified: boolean;
	images?: string[];
	helpful: number;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	sizes: string[];
	ingredients: string[];
	spiceLevel: SpiceLevel;
	shelfLife: string;
	images: string[];
	category: string;
	inStock: boolean;
	rating: {
		average: number;
		count: number;
		distribution: Record<number, number>; // e.g., {5: 10, 4: 5, 3: 3, ...}
	};
	reviews: Review[];
}

export interface CartProduct extends Product {
	quantity: number;
	size: string;
}
