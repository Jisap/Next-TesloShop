

import { AuthContext } from './AuthContext';
import { authReducer } from './authReducer';
import { useSession, signOut } from 'next-auth/react';
import { FC, useEffect, useReducer} from 'react';
import { tesloApi } from '../../api';
import { IUser } from '../../interfaces';
import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';


export interface AuthState {    // Tipado del estado 
     isLoogedIn: boolean,
     user?: IUser
}

const AUTH_INITIAL_STATE: AuthState = { // Estado inicial
     isLoogedIn: false,
     user: undefined,
}

export const AuthProvider:FC = ({ children}) => {

    const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE ); // AuthProvider define un estado que se modificará con el reducer usando el dispath de sus acciones
    const router = useRouter();
    const { data, status } = useSession();                                  // Hook de next-auth que devuelve los datos del userSession y el status del mismo

    // useEffect(() => {                                                       // SISTEMA PERSONALIZADO DE AUTENTICACIÓN
    //   checkToken();                                                         // Cuando se recargue la página, se verifica si hay un token en el cookie
    // }, []);
    
    useEffect(() => {                                                          // SISTEMA DE AUTENTICACIÓN DE NEXT-AUTH
      if( status === 'authenticated' ){                                        // Cuando cambie el status y los datos del user, verificamos si next-auth nos devuelve un status de autenticado 
        //console.log(data)
        //console.log({user: data?.user})                                      // Si es así obtenemos la data de la session de Next-auth ( acces-token y user)
        dispatch({ type: '[Auth] - Login', payload: data?.user as IUser});     // Se obtienen los datos del user y disparamos el reducer para cambiar su estado 
      }
    }, [status, data]);

    const checkToken = async() => {

      if( !Cookies.get('token') ){
        return;
      }
      
      try {

        const { data } = await tesloApi.get('/user/validate-token'); // Petición a /api/user/validate-token (backend) para pillar la cookie y renovarla 
        const { token, user } = data;                                             // Respuesta: El token nuevo y los datos del usuario
        Cookies.set('token', token);                                              // Guardamos el nuevo token en el navegador en forma de cookie  
        dispatch({ type: '[Auth] - Login', payload: user });                      // Actualizamos el estado con el usuario logueado

      } catch (error) {
        Cookies.remove('token');                                                  // Si sale mal borramos el token de las cookies   
      }
    }



    const loginUser = async( email:string, password:string): Promise<boolean> =>{ // Acción de login para el context

      try {
        
        const { data } = await tesloApi.post('/user/login', { email, password }); // Petición a /api/user/login (backend) con los datos del formulario  
        const { token, user } = data;                                             // Respuesta: El token y los datos del usuario
        Cookies.set('token', token);                                              // Guardamos el token en el navegador en forma de cookie  
        dispatch({ type: '[Auth] - Login', payload: user });                      // Actualizamos el estado con el usuario logueado
        return true;                                                              // Retornamos true para indicar que el login fue exitoso

      } catch (error) {
        return false                                                              // Si sale mal retornamos false para indicar que el login falló
      }
    }

  const registerUser = async ( name:string, email:string, password:string ):Promise<{ hasError: boolean; message?:string }> => {

      try{
        const { data } = await tesloApi.post('/user/register', { name, email, password }); // Petición a /api/user/register (backend) con los datos del formulario  
        const { token, user } = data;                                                      // Respuesta: El token y los datos del usuario
        Cookies.set('token', token);                                                       // Guardamos el token en el navegador en forma de cookie
        dispatch({ type: '[Auth] - Login', payload: user });                               // Actualizamos el estado con el usuario logueado
        return {                                                                           // Retornamos hasError como false porque todo fue bien
          hasError: false
        }
      }catch(err){                                                                         // Si hubo algún error preguntamos, 
        if( axios.isAxiosError(err) ){                                                     // si el error es de axios (error en la petición)

          const error = err as AxiosError                                                  // Tipamos el error como AxiosError
          return{                                                                          // Retornamos hasError como true y el mensaje de error
            hasError: true,  
            message: error.message
        };
      }

      return{                                                                             // Si no es de axios retornamos hasError como true y el mensaje de error
        hasError: true,                                                                   // definido por nosotros.
        message: 'No se pudo crear el usuario - intente de nuevo'
      }
    }
  }

  const logout = () => {
    Cookies.remove('cart');                                                              // Borramos el carrito de las cookies
    Cookies.remove('firstName');                                                         // Borramos el shippingAddress las cookies
    Cookies.remove('lastName');
    Cookies.remove('address');
    Cookies.remove('address2');
    Cookies.remove('zip');
    Cookies.remove('city');
    Cookies.remove('country');
    Cookies.remove('phone');
    
    signOut();                                                                           // Llamamos al hook de next-auth para cerrar sesión
    // Cookies.remove('token');                                                          // Borramos el token de las cookies
    // router.reload(); // refresh de la aplicación => el estado desaparece

  }


  return (
     <AuthContext.Provider  value={
       {
           ...state,
           loginUser,
           registerUser, 
           logout,
       }
     }>
        { children }
     </AuthContext.Provider>
    )
}

