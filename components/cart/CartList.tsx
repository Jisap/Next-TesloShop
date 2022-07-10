import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from "@mui/material"
import NextLink from 'next/link'
import { ItemCounter } from "../ui"
import { FC, useContext } from "react"
import { CartContext } from "../../context"
import { ICartProduct, IOrderItem } from "../../interfaces"




interface Props {
    editable?: boolean;         // Editable lo define la página donde se use el Cartlist
    products?: IOrderItem[];    // Los productos a mostrar tendrán un tipo IOrdenItem[] y se castearan ICartProduct en las actions del CartContext
}

export const CartList: FC<Props> = ({ editable = false, products }) => { 

    const { cart, updateCartQuantity, removeCartProduct } = useContext(CartContext);

    const onNewCartQuantityValue = ( product: ICartProduct, newQuantityValue: number ) => {
        product.quantity = newQuantityValue
        updateCartQuantity( product )
    }

    const onRemoveCartProduct = ( product: ICartProduct ) => {
        removeCartProduct( product )
    }

    const productsToShow = products ? products : cart; // Los productos a mostrar serán los de la orden y sino existe serán los del carrito

  return (
    <>
        {
            productsToShow.map( product => (
                <Grid container spacing={2} sx={{mb:1}} key={ product.slug + product.size }>

                    <Grid item xs={3}>
                        
                        <NextLink href={`/product/${ product.slug }`} passHref>
                            <Link>
                                <CardActionArea>
                                    <CardMedia
                                        image={ product.image }
                                        component='img'
                                        sx={{ borderRadius: '5px' }}
                                    />
                                </CardActionArea>
                            </Link>
                        </NextLink>
                    </Grid>

                    <Grid item xs={7}>
                        <Box display='flex' flexDirection='column'>
                            <Typography variant='body1'>{ product.title }</Typography>
                            <Typography variant='body1'>Talla: <strong>{ product.size }</strong></Typography>  
                            {/* Condicional */}
                            {
                                editable 
                                    ? 
                                    (<ItemCounter 
                                        currentValue={ product.quantity } 
                                        maxValue={10}  //Quantity actualizada -> onNewCartQuantityValue -> action que cambia el state de cart
                                        updateQuantity={( value ) => onNewCartQuantityValue( product as ICartProduct, value ) } />
                                    )
                                    :
                                    (
                                        <Typography variant='h5'>{ product.quantity } { product.quantity > 1 ? 'productos' : 'producto' }</Typography>
                                    ) 
                            }     
                        </Box>
                    </Grid>

                    <Grid item xs={2} display='flex' alignItems='center' flexDirection='column'>
                        <Typography variant='subtitle1'>{ `$${ product.price } `}</Typography>
                        {/* Editable */}
                        {
                            editable && (
                                <Button
                                    variant='text' 
                                    color='secondary'
                                    onClick={() => onRemoveCartProduct( product as ICartProduct)}    
                                >
                                    Remover
                                </Button>
                            )
                        }
                    </Grid>

                </Grid>
            ))
        }
    </>  
  )
}
