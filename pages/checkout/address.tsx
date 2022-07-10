import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { ShopLayout } from "../../components/layouts"
import { CartContext } from "../../context";
import { countries } from "../../utils"
//import { GetServerSideProps } from 'next'
//import { jwt } from "../../utils"

type FormData = {
    firstName: string;
    lastName: string;
    address: string;
    address2: string;
    zip: string;
    city: string;
    phone: string;
    country: string;
}

const getAddressFromCookies = (): FormData => {         // Direcciones de envio guardadas en cookies , y si no existen toman el valor ''
    return {
        firstName: Cookies.get('firstName') || '',
        lastName: Cookies.get('lastName') || '',
        address: Cookies.get('address') || '',
        address2: Cookies.get('address2') || '',
        zip: Cookies.get('zip') || '',
        city: Cookies.get('city') || '',
        country: Cookies.get('country') || '',
        phone: Cookies.get('phone') || '',
    }
} 


const AddressPage = () => {


  const router = useRouter();
  const { updateAddress } = useContext( CartContext );
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues: getAddressFromCookies() });

  const onSubmitAddress = ( data: FormData ) => {   // Al hacer submit establecemos las cookies mediante la action updateAddress,
    
    updateAddress( data );                  // actualizamos la dirección en el state context del carrito
    router.push('/checkout/summary');       // y redireccionamos a la página de resumen
      
  }
  
  return (
    <ShopLayout title={"Dirección"} pageDescription={"Confirmar dirección del destino"} >
      <form onSubmit = { handleSubmit( onSubmitAddress ) }>
        <Typography variant="h1" component="h1">Dirección</Typography>

        <Grid container spacing={2} sx={{mt:2}}>
            <Grid item xs={12} sm={6}>
                  <TextField 
                        label='Nombre' 
                        variant='filled' 
                        fullWidth
                        {
                            ...register('firstName', {
                                required: 'Este campo es requerido',
                            })
                        }
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message} 
                   />
            </Grid>
            <Grid item xs={12} sm={6}>
                  <TextField 
                        label='Apellido' 
                        variant='filled' 
                        fullWidth
                        {
                            ...register('lastName', {
                                required: 'Este campo es requerido',
                            })
                        }
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}  
                   />
            </Grid>
            <Grid item xs={12} sm={6}>
                  <TextField 
                        label='Dirección' 
                        variant='filled' 
                        fullWidth
                            {...register('address', {
                                required: 'Este campo es requerido'
                            })}
                            error={!!errors.address}
                            helperText={errors.address?.message} 
            />
            </Grid>
            <Grid item xs={12} sm={6}>
                  <TextField 
                        label='Direccion 2 (opcional)' 
                        variant='filled' 
                        fullWidth 
                          {...register('address2')}
                    />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField 
                        label='Código postal' 
                        variant='filled' 
                        fullWidth 
                            {...register('zip', {
                                required: 'Este campo es requerido'
                            })}
                        error={!!errors.zip}
                        helperText={errors.zip?.message}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField 
                        label='Ciudad' 
                        variant='filled' 
                        fullWidth 
                            {...register('city', {
                                required: 'Este campo es requerido'
                            })}
                        error={!!errors.city}
                        helperText={errors.city?.message}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    {/* <InputLabel>País</InputLabel> */}
                    <TextField
                        select
                        key={Cookies.get('country') || countries[0].code}
                        variant="filled"
                        label="País"
                        defaultValue={ Cookies.get('country') || countries[0].code }
                              {...register('country', {
                                  required: 'Este campo es requerido'
                              })}
                              error={!!errors.country}
                        >
                            { 
                                countries.map( country => (
                                    <MenuItem  
                                        key={ country.code } 
                                        value={ country.code }
                                    >
                                        { country.name }
                                    </MenuItem>
                                ))
                            }

                        </TextField>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField 
                    label='Teléfono' 
                    variant='filled' 
                    fullWidth 
                          {...register('phone', {
                              required: 'Este campo es requerido'
                          })}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                />
            </Grid>
        </Grid> 
        <Box sx={{ mt:5 }} display='flex' justifyContent='end'>
            <Button type="submit" color='secondary' className='circular-btn' size='large'>Revisar pedido</Button>
        </Box>
      </form>




    </ShopLayout>
  )
}

// gerServerSideProps se ejecuta siempre que haya una request a la página
// es decir, siempre que se cargue la página


// export const getServerSideProps: GetServerSideProps = async ( { req } ) => {
    
//     const { token = '' } = req.cookies;
//     let userId = '';
//     let isValidToken = false;
    
//     try {
//         await jwt.isValidToken( token )          // Validamos el token 
//         isValidToken = true;                     // Ponemos la bandera en true y renderizamos la página de /checkout/address
//     } catch (error) {
//         isValidToken = false;
//     }

//     if ( !isValidToken ){   // Si la bandera es false y por tanto el token no es valido
//         return{
//             redirect:{
//                 destination: '/auth/login?p=/checkout/address',  // redireccionamos a la página de login
//                 permanent: false,
//             }
//         }
//     }

//     return {
//         props: {
            
//         }
//     }
// }

export default AddressPage