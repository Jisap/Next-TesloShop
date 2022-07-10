
import { GetServerSideProps, NextPage } from 'next'


import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material"
import { AirplaneTicketOutlined, CreditCardOffOutlined, CreditScoreOutlined } from "@mui/icons-material";

import { AdminLayout } from "../../../components/layouts"
import { CartList, OrdenSummary } from "../../../components/cart"

import { dbOrders } from "../../../database";
import { IOrder } from "../../../interfaces";




interface Props {
    order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {

    console.log({ order })
    const { shippingAddress } = order;


    return (
        <AdminLayout title='Resumen de la orden' subTitle={`OrdenId: ${ order._id }`} icon={ <AirplaneTicketOutlined /> }>

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
                    ) :
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
                    <CartList products={order.orderItems} />
                </Grid>

                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
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
                                    display='flex'
                                    flexDirection='column'  
                                >

                                    {
                                        order.isPaid
                                            ? (
                                                <Chip
                                                    sx={{ my: 2, flex: 1 }}
                                                    label="Orden ya fue pagada"
                                                    variant='outlined'
                                                    color="success"
                                                    icon={<CreditScoreOutlined />}
                                                />
                                            ) : (
                                                <Chip
                                                    sx={{ my: 2, flex: 1 }}
                                                    label="Pendiente de pago"
                                                    variant='outlined'
                                                    color="error"
                                                    icon={<CreditCardOffOutlined />}
                                                /> 
                                            )
                                    }
                                </Box>

                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ req, query }) => { // Petición e info del url

    const { id = '' } = query;

    const order = await dbOrders.getOrderById(id.toString());   // Obtenemos la order

    if (!order) {                                               // Si no existe la order, redirigimos al historial de ordenes
        return {
            redirect: {
                destination: `admin/orders/`,
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