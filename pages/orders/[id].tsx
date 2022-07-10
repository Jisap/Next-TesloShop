import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from "next-auth/react";
import { PayPalButtons } from "@paypal/react-paypal-js";

import { Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Link, Typography } from "@mui/material"
import { CreditCardOffOutlined, CreditScoreOutlined } from "@mui/icons-material";

import { ShopLayout } from "../../components/layouts"
import { CartList, OrdenSummary } from "../../components/cart"
import NextLink from 'next/link';
import { dbOrders } from "../../database";
import { IOrder } from "../../interfaces";
import { tesloApi } from '../../api';
import { useRouter } from 'next/router';

export type OrderResponseBody = { // Interfaz para details de paypal
    id: string;
    status: 
        | "COMPLETED"
        | "SAVED"
        | "APPROVED"
        | "VOIDED"
        | "PAYER_ACTION_REQUIRED";
}


interface Props { 
    order: IOrder;
}

const OrderPage:NextPage<Props> = ( { order }) => {

    const [isPaying, setIsPaying] = useState( false );
    const router = useRouter();
    console.log({ order })
    const { shippingAddress } = order;

    const onOrderCompleted = async( details: OrderResponseBody ) => {

        if( details.status !== 'COMPLETED'){
            return alert('No hay pago en Paypal'); // Si el estado del pago es diferente de completado es que no se pago nada
        }

        setIsPaying( true ); // Se muestra el <CircularProgress />

        try { // Si si hubo pago
            const { data } = await tesloApi.post(`/orders/pay`,{ // Petición a nuestro backend para verifique token de pago efectuado
                transactionId: details.id,                       // y modifique en bd la orden ( isPaid=true y idTransaction introducida)          
                orderId: order._id
            });

            router.reload();    // Recarga de la página para visibilizar los cambios y poner isPaying=false -> desaparece el <CircularProgress />

        } catch (error) {
            setIsPaying( false );
            console.log(error);
            alert('Error')
        }
    }


    return (
        <ShopLayout title='Resumen de la orden' pageDescription={'Resumen de la orden'}>

            <Typography variant='h1' component='h1' sx={{ mb: 3 }}>
                Orden: { order._id }
            </Typography>

            {
                order.isPaid 
                ? (
                    <Chip
                        sx={{ my: 2 }}
                        label="Orden ya fue pagada"
                        variant='outlined'
                        color="success"
                        icon={<CreditScoreOutlined />}
                    />
                ):
                (
                    <Chip
                        sx={{ my: 2 }}
                        label="Pendiente de pago"
                        variant='outlined'
                        color="error"
                        icon={<CreditCardOffOutlined />}
                    />
                )
            }
        
            <Grid container className='fadeIn'>
                {/* El cartList mostrará en orderPage los items de la orden */}
                <Grid item xs={12} sm={7}>
                    <CartList products={ order.orderItems }/> 
                </Grid>

                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({ order.numberOfItems } { order.numberOfItems > 1 ? 'productos': 'producto' })</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                                {/* <NextLink href="/checkout/address">
                                    <Link underline='always'>
                                        Editar
                                    </Link>
                                </NextLink> */}
                            </Box>

                            <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
                            <Typography>{shippingAddress.address} {shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}</Typography>
                            <Typography>{shippingAddress.city}, {shippingAddress.zip}</Typography>
                            <Typography>{shippingAddress.country}</Typography>
                            <Typography>{shippingAddress.phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            {/* <Box display='flex' justifyContent='end' sx={{ mb: 3 }}>
                                <NextLink href='/cart' passHref>
                                    <Link underline='always'>
                                        Editar
                                    </Link>
                                </NextLink>
                            </Box> */}


                            <OrdenSummary 
                                orderValues={{
                                    numberOfItems: order.numberOfItems,
                                    subTotal: order.subTotal,
                                    total: order.total,
                                    tax: order.tax,
                                }} 
                            />

                            <Box sx={{ mt: 3 }} display="flex" flexDirection='column'>
                                
                                <Box 
                                    display="flex" 
                                    justifyContent="center" 
                                    className="fadeIn"
                                    sx={{ display: isPaying ? 'flex' : 'none' }}    // Se mostrará si isPaying=true
                                >
                                    <CircularProgress />
                                </Box>

                                <Box 
                                    flexDirection='column' sx={{ display: isPaying ? 'none' : 'flex', flex: 1 }} // Los botones se mostrarán si isPaying=false
                                >

                                    {
                                        order.isPaid
                                        ?(
                                            <Chip
                                                sx={{ my: 2 }}
                                                label="Orden ya fue pagada"
                                                variant='outlined'
                                                color="success"
                                                icon={<CreditScoreOutlined />}
                                            />
                                        ):(
                                            <PayPalButtons 
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        value: `${order.total}`,
                                                                    },
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    onApprove={(data, actions) => {
                                                        return actions.order!.capture().then((details) => { // details contiene toda la info de la persona
                                                            //console.log({ details })                      // que esta dada de alta en paypal y ejecuta el pago y contiene la transactionId generada por Paypal
                                                            //const name = details.payer.name?.given_name;
                                                            //alert(`Transaction completed by ${name}`);
                                                            onOrderCompleted( details );
                                                        });
                                                    }}    
                                            />
                                        )
                                    }
                                </Box>
                                                   
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </ShopLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ req, query }) => { // Petición e info del url
    
    const { id = '' } = query;

    const session:any = await getSession({ req }); // En la req van las cookies, headers, etc.
    
    if( !session ){                                            // Si no hay sesión, redirigimos al login
        return{                                                // con el query de la página a la que quería ir.                                             
            redirect:{
                destination: `/auth/login?p=/orders/${id}`,
                permanent: false,
            }
        }
    }

    const order = await dbOrders.getOrderById( id.toString() ); // En este punto si hay session, obtenemos la order
    
    if( !order ){                                               // Si no existe la order, redirigimos al historial de ordenes
        return{
            redirect: {
                destination: `/orders/history`,
                permanent: false,
            }
        }
    }

    console.log("sessionUser", session.user._id);
    if ( order.user  !== session.user._id ){                    // Si si existe la orden en la bd comprobamos que pertenezca al usuario de la session
        return {                                                // Si no pertenece, redirigimos al historial de ordenes
            redirect: {
                destination: `/orders/history`,
                permanent: false,
            }
        }
    }

    return {
        props: {
            order,                                                // Si todo esta bien, retornamos la order y renderizamos los datos en la página
        }
    }
}


export default OrderPage