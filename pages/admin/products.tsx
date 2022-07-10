import React from 'react'
import NextLink from 'next/link';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { AddOutlined, CategoryOutlined } from '@mui/icons-material';
import { Box, Button, CardMedia, Chip, Grid, Link } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { IProduct } from '../../interfaces';
import useSWR from 'swr';

const columns: GridColDef[] = [
    
    {
        field: 'img',
        headerName: 'Foto',
        renderCell: ({ row }: GridValueGetterParams) => { // Tomamos el valor del row para img
            return (
                <a href={`/product/${row.slug}`} target="_blank" rel="noreferrer">  {/* Redirigimos a la url del producto */}
                    <CardMedia
                        component='img'     // Pintamos la imagen del product
                        alt={row.title}     // y al pinchar en ella nos redirige
                        className='fadeIn'  // a la url del producto
                        image={`${row.img}`} // La imagen ha sido procesada en el backend
                    />
                </a>
            )
        }
    },
    {
        field: 'title',
        headerName: 'Title',
        width: 250,
        renderCell: ({ row }: GridValueGetterParams) => {
            return (
                <NextLink href={`/admin/products/${row.slug}`} passHref>
                    <Link underline='always'>
                        {row.title}
                    </Link>
                </NextLink>
            )
        }
    },
    { field: 'gender', headerName: 'Género' },
    { field: 'type', headerName: 'Tipo' },
    { field: 'inStock', headerName: 'Inventario' },
    { field: 'price', headerName: 'Precio' },
    { field: 'sizes', headerName: 'Tallas', width: 250 },
    
]

const ProductsPage = () => {

    const { data, error } = useSWR<IProduct[]>('/api/admin/products');  // Obtención de todos los products

    if (!data && !error) return (<></>)

    const rows = data!.map(product => ({
        id: product._id,
        img: product.images[0],
        title: product.title,
        gender: product.gender,
        type: product.type,
        inStock: product.inStock,
        price: product.price,
        sizes: product.sizes.join(', '),
        slug: product.slug,
    }));

    return (
        <AdminLayout
            title={`Productos (${data?.length})`}
            subTitle={'Mantenimiento de productos'}
            icon={<CategoryOutlined />}
        >
            <Box display='flex' justifyContent='end' sx={{mb:2}}>
                <Button
                    startIcon={<AddOutlined />}
                    color="secondary"
                    href="/admin/products/new" // new es un query que se recibe en admin/products/[slug]
                >
                    Crear producto
                </Button>
            </Box>


            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                    />
                </Grid>
            </Grid>
        </AdminLayout>
    )
}

export default ProductsPage;