import { FC } from "react"
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material"
import { Box, IconButton, Typography } from "@mui/material"

interface Props {
  currentValue: number;
  maxValue: number;
  updateQuantity: (newValue: number) => void;
}

                                      //stateTemporal           // stateActualizado
export const ItemCounter: FC<Props> = ({ currentValue, maxValue, updateQuantity }) => {

  const addOrRemove = ( value: number ) => {   // Recibimos el 1 o el -1

    if( value === -1 ){                        // Si el valor de la cantidad es -1             
      if(currentValue === 1) return;           // siendo el valor por defecto = 1, no hacemos nada                      
      return updateQuantity( currentValue -1 ) // Si fuera otro valor por defecto devolvemos la cantidad del state -1
    }
                                               // En este punto el valor de la cantidad es 1 
    if( currentValue >= maxValue ) return;     // Si el stateTemporal de la cantidad es mayor o igual a la maxValue, no hacemos nada
    return updateQuantity( currentValue + 1 )  // Devolvemos la cantidad del stateTemporal +1  

    // onclick genera un valor de 1 o -1 y addOrRemove lo recibe para devolver la cantidad actualizada
  }

  return (
    <Box display='flex' alignItems='center'>
        <IconButton
          onClick={ () => addOrRemove(-1) }
        >
            <RemoveCircleOutline />
        </IconButton>
      <Typography sx={{ width: 40, textAlign: 'center' }}>{ currentValue }</Typography>
          <IconButton
            onClick={() => addOrRemove(+1)}
          >
              <AddCircleOutline />
          </IconButton>
    </Box>
  )
}
