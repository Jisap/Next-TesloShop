import { ISize } from "./";

export interface ICartProduct { // Así luce un producto en el carrito
    _id: string
    image: string;
    price: number;
    size?: ISize;
    slug: string;
    title: string;
    gender: 'men' | 'women' | 'kid' | 'unisex';
    quantity: number;
}



