import { ICartProduct, ShippingAddress } from '../../interfaces';
import { CartState } from './';

type CartActionType = 
    | { type: '[Cart] - LoadCart from cookies | storage', payload: ICartProduct[] }
    | { type: '[Cart] - Update products in cart', payload: ICartProduct[] }
    | { type: '[Cart} - Change cart quantity', payload: ICartProduct }
    | { type: '[Cart] - Remove product in cart', payload: ICartProduct } 
    | { type: '[Cart] - LoadAddress from Cookies', payload: ShippingAddress }
    | { type: '[Cart] - Update Address', payload: ShippingAddress }  
    | { type: '[Cart] - Update order summary', payload: {
                                                    numberOfItems: number;
                                                    subTotal: number;
                                                    tax: number;
                                                    total: number;
                                                    }
    }
    | { type: '[Cart] - Order complete' }  

export const cartReducer = (state: CartState, action: CartActionType): CartState => {

    switch (action.type) {

        case '[Cart] - LoadCart from cookies | storage':
            return {
                ...state,
                isLoaded: true,                // Al cargar la app siempre se buscará la cookie y disparará esta acción con el isLoaded:true
                cart: [...action.payload]
            }
        
        case '[Cart] - Update products in cart':
            return{
                ...state,
                cart: [...action.payload]
            }

        case '[Cart} - Change cart quantity':
            return{
                ...state,
                cart: state.cart.map( product => {
                    if( product._id !== action.payload._id ) return product;   // Si el producto que se itera es distinto del que estamos cambiando la cantidad
                                                                               // se retorna tal cual ese producto a la nueva []             
                    if( product.size !== action.payload.size ) return product; // Si tiene misma id pero distinta talla retornamos el producto tal cual

                    product.quantity = action.payload.quantity; // Si tiene la misma id y la misma talla se cambia la cantidad
                    return product;                             // y se retorna el producto con la nueva cantidad
                })
            }

        case '[Cart] - Remove product in cart':
            return{
                ...state,
                cart: state.cart.filter( product => !(product._id === action.payload._id && product.size === action.payload.size) ) 
                // El carrito solo contendrá los productos que cumplan la condición de que no sean el mismo producto 
            }

        case '[Cart] - Update order summary':
            return{
                ...state,
                ...action.payload
            }

        case '[Cart] - Update Address':
        case '[Cart] - LoadAddress from Cookies':    // Añade la direccíon del comprador al state del carrito
            return{
                ...state,
                shippingAddress: action.payload
            }
            
        case '[Cart] - Order complete': //Cuando se completa la orden vaciamos el estado del carrito
            return{
                ...state,
                cart: [],
                numberOfItems: 0,
                subTotal: 0,
                tax: 0,
                total: 0,

            }

        default:
            return state;
    }
}