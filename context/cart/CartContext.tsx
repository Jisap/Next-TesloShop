import { createContext } from 'react';
import { ICartProduct, ShippingAddress } from '../../interfaces';


interface ContextProps {                                            // El context del carrito contiene
    cart: ICartProduct[];                                           // los productos añadidos
    addProductToCart: (product: ICartProduct) => void ;             // y los métodos para añadirlos, actualizarlos y borrarlos. 
    updateCartQuantity: (product: ICartProduct) => void;
    removeCartProduct: (product: ICartProduct) => void;
    updateAddress: (address: ShippingAddress) => void;
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
    isLoaded:boolean;
    shippingAddress?: ShippingAddress;                               // Si existe la dirección de envío, la añadimos al context
    createOrder: () => Promise<{hasError: boolean; message: string}> // y el método para crear la orden
}

export const CartContext = createContext( {} as ContextProps );