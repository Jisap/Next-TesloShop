import React from 'react'
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react'
import NextLink from 'next/link'

import { ShopLayout } from '../../components/layouts'
import { Chip, Grid, Link, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import { dbOrders } from '../../database'
import { IOrder } from '../../interfaces'



const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 100},
    {field: 'fullname', headerName: 'Nombre Completo', width: 300},

    {
        field: 'paid', 
        headerName: 'Pagada',
        description: 'Muestra información si está pagada la orden o no',
        width: 200,
        renderCell: (params: GridValueGetterParams) => {
            return (
                params.row.paid
                    ? <Chip color="success" label="Pagada" variant='outlined' />
                    : <Chip color="error" label="No Pagada" variant='outlined' />
            )
        }
    },
    {
        field: 'orden',
        headerName: 'Ver orden',
        description: 'Muestra información si está pagada la orden o no',
        width: 200,
        sortable: false,
        renderCell: (params: GridValueGetterParams) => {
            return (
                <NextLink href={`/orders/${ params.row.orderId }`} passHref>
                    <Link underline='always'>
                        Ver orden
                    </Link>
                </NextLink>
            )
        }
    }


];

// const rows = [
//     { id: 1, paid: true,  fullname: 'Fernado Herrera'},
//     { id: 2, paid: false,  fullname: 'Melissa Flores' },
//     { id: 3, paid: true,  fullname: 'Hernando Vallejo' },
//     { id: 4, paid: false,  fullname: 'Emin Reyes' },
//     { id: 5, paid: false,  fullname: 'Duardo Rios' },
//     { id: 6, paid: true,  fullname: 'Natalia Herrera' },
// ]

interface Props {
    orders: IOrder[]
}

const HistoryPage: NextPage<Props> = ( { orders  } ) => {

  const rows = orders.map(( order, idx ) => ({
     id: idx + 1,
     paid: order.isPaid,
     fullname: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
     orderId: order._id
  }))

  return (
    <ShopLayout title={'Hisotrial de ordenes'} pageDescription={'Historial de ordenes del cliente'}>
        <Typography variant='h1' component='h1'>Historial de ordenes</Typography>
        
        <Grid container className='fadeIn'>
            <Grid item xs={12} sx={{ height:650, width:'100%'}}>
                <DataGrid 
                    rows={ rows }
                    columns={ columns}
                    pageSize={ 10 }
                    rowsPerPageOptions={[10]}
                />
            </Grid>
        </Grid>


    </ShopLayout>
  )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async({ req }) => {
    
    const session: any = await getSession({ req });                 // Obtenemos la session para así conseguir el id del usuario logueado
    if (!session) {                                                 // Si no hay session, redirigimos al /auth/login?p=/orders/history
        return{
            redirect: { 
                destination: '/auth/login?p=/orders/history',
                permanent: false
            }
        }
    }

    console.log(session.user.id)
    const orders = await dbOrders.getOrdersByUser( session.user._id );   // Si si hay session obtenemos las ordenes del usuario

    return {
        props: { 
            orders
        }
    }
}

export default HistoryPage