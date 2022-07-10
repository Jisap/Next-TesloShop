import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { useContext, useState } from "react";
import { CartContext } from "../../context";
import { useRouter } from "next/router";

import { Box, Button, Chip, Grid, Typography } from "@mui/material";

import { ICartProduct, IProduct, ISize } from "../../interfaces";
import { ShopLayout } from "../../components/layouts"
import { ProductSlideShow, SizeSelector } from "../../components/products";
import { ItemCounter } from "../../components/ui";
import { getProductBySlug } from "../../database/dbProducts";
import { dbProducts } from "../../database";

interface Props { 
  product: IProduct
}

const ProductPage:NextPage<Props> = ( { product }) => {

  const router = useRouter();
  const { addProductToCart } = useContext( CartContext ); // Desestructuramos el método para añadir al context

  const [tempCartProduct, setTempCartProduct] = useState<ICartProduct>({ // Estado temporal del carrito de producto
    _id: product._id,
    image: product.images[0],
    price: product.price,
    size: undefined,
    slug: product.slug,
    title: product.title,
    gender: product.gender,
    quantity: 1,
  });

  const selectedSize = ( size: ISize ) => {
    setTempCartProduct(currentProduct => ({ // Seleccionada una talla la incorporamos al state del producto temporal
      ...currentProduct,
      size
    }));
  }

  const onUpdateQuantity = ( quantity: number ) => {
    setTempCartProduct(currentProduct => ({ // Seleccionada una cantidad la incorporamos al state del producto temporal
      ...currentProduct,
      quantity
    }));
  }

  const onAddProduct = () => {
    if (!tempCartProduct){ return; }

    addProductToCart( tempCartProduct ) // Llamamos la acción del context para agregar al carrito
    router.push('/cart')
  }

  return (
    <ShopLayout title={ product.title } pageDescription={ product.description }>

      <Grid container spacing={3}>

        <Grid item xs={12} sm={7}>
          <ProductSlideShow images={ product.images }/>
        </Grid>

        <Grid item xs={12} sm={5}>
          
          {/* títulos */}
          <Box display='flex' flexDirection='column'>
            
              <Typography variant='h1' component='h1'>{ product.title }</Typography>
              <Typography variant='subtitle1' component='h2'>{ `$${product.price}` }</Typography>

              {/* cantidad */}
              <Box sx={{ my: 2 }}>
                <Typography variant='subtitle2'>Cantidad</Typography>
                <ItemCounter 
                  currentValue={ tempCartProduct.quantity }// Cantidad por defecto en el state
                  updateQuantity={ onUpdateQuantity }      // Cantidad actualizada en el state
                  maxValue={ product.inStock > 10 ? 10 : product.inStock }
                />
                <SizeSelector
                  sizes={ product.sizes } 
                  selectedSize={ tempCartProduct.size } // En principio el selectedSize es undefined por defecto
                  onSelectedSize={ selectedSize }       // Luego el usuario seleccionará una talla
                  />
              </Box>

              {/* Agregar al carrito */}
              {
                (product.inStock > 0 ) 
                  ? (
                      <Button color="secondary" className="circular-btn" onClick={ onAddProduct }>
                        {
                          tempCartProduct.size            // Si el usuario seleccionó una talla
                            ? `Agregar al carrito`        // Entonces se agrega al carrito
                            : `Seleccione una talla`      // Si no mensaje de seleccionar una talla
                        }
                      </Button>
                  ):(
                      <Chip label="No hay disponibles" color="error" variant="outlined" /> 
                  )
              
              }


              {/* Description */}
              <Box sx={{ mt:3 }}>
                <Typography variant='subtitle2'>Descripción</Typography>
                <Typography variant='body2'>{ product.description }</Typography>
              </Box>

          </Box>
        </Grid>

      </Grid>
    </ShopLayout>
  )
}

// export const getServerSideProps:GetServerSideProps = async ({ params }) => {
//   const { slug ='' } = params as { slug:string }
//   const product = await dbProducts.getProductBySlug(slug); // El endpoint usado viene de dbProduct para que el servidor no se llame asi mismo

//   if( !product ){
//     return {
//       redirect:{
//         destination: '/',
//         permanent: false
//       }
//     }
//   }

//   return {
//     props: {
//       product
//     }
//   }
// }




export const getStaticPaths: GetStaticPaths = async (ctx) => {
 
  const productSlugs = await dbProducts.getAllProductSlugs(); // Obtenemos todos los productos que contengan un slug en un [{}]

  return {
    paths: productSlugs.map( ({ slug }) => ({ params: { slug } })), // Generamos todos los paths basados en sus slugs (params), para que el cliente pueda acceder a cada producto 
      
    fallback: "blocking"
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => { // Se reciben los params que se generaron en getStaticPaths
  
  const { slug='' } = params as { slug:string }
  const product = await dbProducts.getProductBySlug( slug ); // Generamos un productos según el slug que se recibe de getStaticPaths
                                                             // Cuando se haga el build de producción se generaran todas la páginas de producto                                                            
                                                             // El endpoint usado viene de dbProduct para que el servidor no se llame asi mismo
  if( !product ){
    return {
      redirect:{
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24 // 1 día
  }
}

export default ProductPage