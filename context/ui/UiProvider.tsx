import { FC, useReducer} from 'react';
import { UiContext, uiReducer } from './';



export interface UiState {
     isMenuOpen: boolean,
}

const UI_INITIAL_STATE: UiState = {
     isMenuOpen: false,
}

export const UiProvider:FC = ({ children }) => {

  const [ state, dispatch] = useReducer( uiReducer, UI_INITIAL_STATE ) // Creamos un state y usamos un reducer para cambiarlo

  const toggleSideMenu = () => {
      dispatch({ type: '[UI] - ToggleMenu' });  // Enviamos una accion al reducer
  }  

  return (
      <UiContext.Provider  value={  // Compartimos el state y la funcion de toggle con todos los componentes que lo necesiten
       {
           ...state,
          toggleSideMenu
       }
     }>
        { children }
      </UiContext.Provider>
  )
}

  