import NextLink from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CartContext } from '../../context';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Typography } from "@mui/material"
import { ShopLayout } from "../../components/layouts"
import { CartList, OrdenSummary } from "../../components/cart"
import { countries } from "../../utils"
import Cookies from 'js-cookie';


const SummaryPage = () => {

    const router = useRouter()
    const { shippingAddress, numberOfItems, createOrder } = useContext( CartContext );

    const [isPosting, setIsPosting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
       if ( !Cookies.get('firstName') ){
            router.push('/checkout/address')
       }
    }, [router]);

    if ( !shippingAddress){
        return <></>
    }

    const onCreateOrder = async() => {

        setIsPosting(true);
        const { hasError, message } = await createOrder(); // createOrder nos devuelve un objeto con dos propiedades: hasError y message

        if( hasError ){                                    // Si hasError es true         
            setIsPosting( false );                         // Bandera para que no se desabilite el boton de crear orden 
            setErrorMessage( message );                    // Mensaje de error para que aparezca en un chip de MUI
            return
        }

        router.replace( `/orders/${message}` );             // Si hasError es false redirección a la página de la orden (message = id de la orden)
    }

    const { firstName, lastName, address, address2, zip, city, country, phone } = shippingAddress;

    return (
        <ShopLayout title='Resumen de orden' pageDescription={'Resumen de la orden'}>

            <Typography variant='h1' component='h1' sx={{ mb:3 }}>
                Resumen de la orden
            </Typography>

            <Grid container>

                <Grid item xs={12} sm={7}>
                    <CartList />
                </Grid>
                
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({ numberOfItems } { numberOfItems === 1 ? 'producto' : 'productos'}) </Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                                <NextLink href='/checkout/address'>
                                    <Link underline='always'>
                                        Editar
                                    </Link>
                                </NextLink>
                            </Box>

                            <Typography>{ firstName }</Typography>
                            <Typography>{ address } { address2 ? `, ${address2}` : ''}</Typography>
                            <Typography>{ city }, { zip }</Typography>
                            <Typography>{ countries.find( c => c.code === country )?.name }</Typography>
                            <Typography>{ phone }</Typography>

                            <Divider sx={{ my:1 }} />

                            <Box display='flex' justifyContent='end' sx={{ mb:3 }}>
                                <NextLink href='/cart' passHref>
                                    <Link underline='always'>
                                        Editar
                                    </Link>
                                </NextLink>
                            </Box>


                            <OrdenSummary />

                            <Box sx={{ mt: 3 }} display="flex" flexDirection="column">
                                <Button 
                                    color='secondary' 
                                    className='circular-btn' 
                                    fullWidth
                                    onClick = { onCreateOrder } 
                                    disabled = { isPosting }  
                                >
                                    Confirmar orden
                                </Button>

                                <Chip 
                                    color="error"
                                    label={ errorMessage }
                                    sx={{ display: errorMessage ? 'flex' : 'none', mt: 2 }}
                                />

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </ShopLayout>
    )
}

export default SummaryPage