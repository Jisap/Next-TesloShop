import { FC } from "react";
import { Box, Button } from "@mui/material";
import { ISize } from "../../interfaces";


interface Props {
    selectedSize?: ISize;
    sizes: ISize[];
    onSelectedSize: (size: ISize) => void;
}

export const SizeSelector:FC<Props> = ({ selectedSize, sizes, onSelectedSize }) => {
  return (
    <Box>
        {
            sizes.map( size => (
                <Button
                    key={ size }
                    size='small' 
                    color={ selectedSize === size ? 'primary' : 'info'}  // La opción seleccionada es la que tiene el color primary 
                    onClick={ () => onSelectedSize( size ) }             // Cuando damos click en alguna de las tallas la enviamos a onSelectedSize y la recibe el 
                                                                         // componente padre [slug].tsx                   
                >                                                          
                    { size }
                </Button>
            ))
        }
    </Box>
  )
}
