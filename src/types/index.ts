export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	images: string[];
	category: string;
	spiceLevel: "mild" | "medium" | "hot";
	size: string;
	inStock: boolean;
	ingredients: string[];
}

export interface CartItem extends Product {
	quantity: number;
}

export interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
}
