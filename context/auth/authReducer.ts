
import { IUser } from '../../interfaces';
import { AuthState } from './';

type AuthActionType =                                    // Tipado de las acciones
     | { type: '[Auth] - Login', payload:IUser } 
     | { type: '[Auth] - Logout' }

export const authReducer = (state: AuthState, action: AuthActionType): AuthState => {

    switch (action.type) {

        case '[Auth] - Login':
            return {
                ...state,
                isLoogedIn: true,
                user: action.payload
            }
        
        case '[Auth] - Logout':
            return{
                ...state,
                isLoogedIn: false,
                user: undefined
            }

        default:
            return state;
    }
}