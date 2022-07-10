import { FC, useEffect, useReducer} from 'react';
import { ICartProduct, IOrder, ShippingAddress } from '../../interfaces';
import { CartContext, cartReducer } from './';
import Cookie from 'js-cookie';
import { tesloApi } from '../../api';
import axios, { AxiosError } from 'axios';



export interface CartState {
  isLoaded: boolean;          // Sirve para saber si se cargo el carrito desde la cookie
  cart: ICartProduct[],
  numberOfItems: number;
  subTotal: number;
  tax: number;
  total: number;
  shippingAddress?: ShippingAddress
}




const CART_INITIAL_STATE: CartState = {
  //cart: Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [], // El estado inicial del carrito depende de si hay o no cookie
  isLoaded: false,
  cart: [],
  numberOfItems: 0,
  subTotal: 0,
  tax: 0,
  total: 0,
  shippingAddress: undefined,
}

export const CartProvider:FC = ({ children }) => {

  const [ state, dispatch] = useReducer( cartReducer, CART_INITIAL_STATE );

  useEffect(() => {
    try {
      const cookieProducts = Cookie.get('cart')             // Si existe la cookie
        ? JSON.parse(Cookie.get('cart')!)                   // asignamos su valor a cookieProducts
        : [];                                               // Sino array vacio []
      dispatch({                                            // Entonces dispatch con el payload de cookieProducts
        type: '[Cart] - LoadCart from cookies | storage',
        payload: cookieProducts,
      });
    } catch (error) {
      dispatch({
        type: '[Cart] - LoadCart from cookies | storage',
        payload: [],
      });
    }
  }, []);

  useEffect(() => {

    if( Cookie.get('firstName') !== undefined ){    // Siempre debe de existir el nombre
      
      const shippingAddress = {                     // Establecemos las direcciones del comprador desde las cookies
        
        firstName: Cookie.get('firstName') || '',
        lastName: Cookie.get('lastName') || '',
        address: Cookie.get('address') || '',
        address2: Cookie.get('address2') || '',
        zip: Cookie.get('zip') || '',
        city: Cookie.get('city') || '',
        country: Cookie.get('country') || '',
        phone: Cookie.get('phone') || '',
      }
  
      dispatch({ type: '[Cart] - LoadAddress from Cookies', payload: shippingAddress }); // Añadimos al state la direccion del comprador
    }

    
  }, []);

  useEffect(() => {
    Cookie.set( 'cart', JSON.stringify( state.cart ))    // Cada vez que cambia el estado del carrito creo una cookie
  }, [state.cart]);

  useEffect(() => {

    const numberOfItems = state.cart.reduce(( prev, current) => current.quantity + prev, 0 ) // A cada valor de cantidad del producto se le suma el anterior
    const subTotal = state.cart.reduce(( prev, current) => (current.price * current.quantity) + prev, 0 ) // A cada valor de precio del producto se le suma el anterior
    const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0 )

    const orderSummary = {
      numberOfItems,
      subTotal,
      tax: subTotal * taxRate,
      total: subTotal * ( taxRate + 1 )
    }

    dispatch({ type: '[Cart] - Update order summary', payload: orderSummary });
    
    console.log(orderSummary)
  }, [state.cart]);

  const addProductToCart = ( product:ICartProduct ) => { // Acción del context para añadir un producto al carrito

                                              //carrito  //argumento
    const productInCart = state.cart.some( p => p._id === product._id ) // Verificamos si exite un producto en el carrito con ese id
    if (!productInCart) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] }); // Sino existe lo añadimos

    //En este punto si existe otro producto igual en el carrito
    const productInCartButDifferentSize = state.cart.some(p => p._id === product._id && p.size === product.size);// Verificamos si existe un producto con la misma talla
    if (!productInCartButDifferentSize) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] });//Sino existe lo añadimos
  
    //En este punto si existe otro producto igual y con la misma talla => Acumular
    const updatedProducts = state.cart.map( p => {
      if (p._id !== product._id) return p;          // Si son diferentes por id lo retornamos para dispatch
      if (p.size !== product.size) return p;        // Aquí son iguales por id pero son diferentes por talla, lo retornamos para dispatch

      // LLegados aquí son artículos iguales por id y por talla
      // Actualizamos la cantidad
      p.quantity += product.quantity; // 
      return p;
    });

    dispatch({ type: '[Cart] - Update products in cart', payload: updatedProducts });

  }

  const updateCartQuantity = ( product:ICartProduct ) => {                  // Acción que modifica la cantidad del producto
    dispatch({ type: '[Cart} - Change cart quantity', payload: product });
  }

  const removeCartProduct = (product: ICartProduct) => {                    // Acción que borra un producto del carrito
    dispatch({ type: '[Cart] - Remove product in cart', payload: product });
  }

  const updateAddress = (address: ShippingAddress) => { // Acción que actualiza las cookies de la dirección del comprador
    Cookie.set('firstName', address.firstName);
    Cookie.set('lastName', address.lastName);
    Cookie.set('address', address.address);
    Cookie.set('address2', address.address2 || '');
    Cookie.set('zip', address.zip);
    Cookie.set('city', address.city);
    Cookie.set('country', address.country);
    Cookie.set('phone', address.phone);

    dispatch({ type: '[Cart] - Update Address', payload: address });
  }

  const createOrder = async():Promise<{ hasError:boolean; message:string }> => { // Si el hasError está en false, el mensaje es el id de la orden

    if( !state.shippingAddress){
      throw new Error('No shipping address');
    }

    // body de la Petición
    const body: IOrder = {
      orderItems: state.cart.map( p => ({ // Nuestra orden estará formada por un array de items de productos contenidos en el state.cart
        ...p,                             // Copiamos todos los productos
        size: p.size!                     // y añadimos la talla. En la interfaz ICartProduct size es opcional y aquí no se puede omitir.
      })),                                // Para evitar conflictos de tipos ponemos como seguro el valor de size con !.
      shippingAddress: state.shippingAddress,
      numberOfItems: state.numberOfItems,
      subTotal: state.subTotal,
      tax: state.tax,
      total: state.total,
      isPaid: false,

    }

    try {
      
      const { data } = await tesloApi.post<IOrder>('/orders', body); // Enviamos la petición al servidor con el body de la orden
      console.log(data)                                              // Si todo fue bien y el backend no devolvio ningún error 
      dispatch({ type: '[Cart] - Order complete' });                 // Actualizamos el state del carrito limpiandolo. Ademas...        
      return {             
        hasError: false,   // Error es false y el message es el id de la orden
        message: data._id! // En IOrder el _id es opcional y aqui siempre sabemos que existirá, por eso colocamos el !
      }


    } catch ( error ) {
      
      console.log(error);
      if (axios.isAxiosError(error)) {                                    // Si el error es de Axios  
        const { message } = error.response?.data as { message: string }   // Obtenemos el mensaje de error y lo casteamos a string para que coincida con el tipado de createOrder
        return {                                                          // Retornamos un objeto con el mensaje de error de axios
          hasError: true,
          message
        }
      }
      return{                                                         // Si el error es de otra fuente
        hasError: true,                                               // Retornamos un objeto con el mensaje de error personalizado
        message: 'Error no controlado, hable con el administrador'
      }
    }
      
  }
  

  return (
     <CartContext.Provider  value={
       {
           ...state,
           addProductToCart,
           updateCartQuantity,
           removeCartProduct, 
           updateAddress, 
           createOrder
       }
     }>
        { children }
     </CartContext.Provider>
  )
}

