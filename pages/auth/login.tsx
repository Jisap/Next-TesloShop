import React, { useContext, useEffect, useState } from 'react'
import NextLink from 'next/link'
//import { AuthContext } from '../../context';
import { signIn, getSession, getProviders } from 'next-auth/react';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next'

import { Box, Button, Chip, Divider, Grid, Link, TextField, Typography } from '@mui/material'
import { AuthLayout } from '../../components/layouts'
import { validations } from '../../utils';
//import { tesloApi } from '../../api';
import { ErrorOutline } from '@mui/icons-material';

type FormData = {
    email: string,
    password: string,
};

const LoginPage = () => {

    const router = useRouter()
    //const { loginUser } = useContext( AuthContext );
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>(); // initialise the hook
    const [ showError, setShowError] = useState(false);

    const [providers, setProviders] = useState<any>({});

    useEffect(() => {
        getProviders().then( prov => { // 
            setProviders(prov);
        })
    }, []);

    const onLoginUser = async( { email, password }:FormData ) => { // Esta función recibe el email y el password del formulario
       
        setShowError(false);                                       // Inicializamos el estado de error a false porque el hook ya valido que no hay errores

        // LOGIN PERSONALIZADO 
        // const isValidLogin = await loginUser( email, password ); // La función del context nos valida el login y retorna un boolean. Ademas graba el usuario en el context
        //                                                          // y el token en una cookie
        // if( !isValidLogin ){
        //     setShowError(true);
        //     setTimeout(() => setShowError(false), 3000);
        //     return
        // }

        // const destination = router.query.p?.toString() || '/';  // Si hay una query p (última pág visitada), la guardamos en destination, sino guardamos '/'
        // router.replace( destination );                          // Si todo salio bien redirigimos a la página de destino
        
        await signIn('credentials', { email, password });          // Solo necesitamos llamar al método signIn de NextAuth -> [...nextAuth] -> session

    }

  return (
    <AuthLayout title={'Ingresar'}>
        <form onSubmit={ handleSubmit(onLoginUser) } noValidate>
            <Box sx={{ width: 350, padding:'10px 20px'}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='h1' component='h1'>Iniciar Sesión</Typography>
                        <Chip
                            label="No reconocemos ese usuario/contraseña"
                            color="error"
                            icon={ <ErrorOutline />}
                            className="fadeIn" 
                            sx={{ display: showError ? 'flex' : 'none' }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField 
                            type="email"
                            label="correo" 
                            variant="filled" 
                            fullWidth 
                            { 
                              ...register('email', {                           // register asocia cada campo con el formulario
                                    required: 'Este campo es requerido',
                                    validate: validations.isEmail              // validamos que sea un email con isEmail de validations 
                              })
                            }
                            error={ !!errors.email }              // Convertimos a booleano el valor de errors.email
                            helperText={ errors.email?.message }  // Si hay error, mostramos el mensaje de error
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="Contraseña" 
                            type='password' 
                            variant="filled" 
                            fullWidth
                            { 
                                ...register('password',{ 
                                    required: 'Este campo es requerido',
                                    minLength:{ value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                                }) 
                            }
                            error={ !!errors.password }
                            helperText={ errors.password?.message }   
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type='submit' 
                            color="secondary" 
                            className="circular-btn" 
                            size="large" 
                            fullWidth
                        >Ingresar</Button>
                    </Grid>
                    
                    <Grid item xs={12} display='flex' justifyContent='end'>
                        <NextLink 
                            href={                                      // Si queremos crear una nueva cuenta evaluamos,
                                router.query.p                          // si hay un query p (última pág visitada),
                                ? `/auth/register?p=${ router.query.p}` // redirigimos s register con dicho query.
                                : '/auth/register'}                     // Si no redirigimos a la página de registro
                            passHref                                     
                        >
                            <Link underline='always'>¿ No tienes cuenta ?</Link>
                        </NextLink>
                    </Grid>

                      <Grid item xs={12} display='flex' flexDirection='column' justifyContent='end'>
                          <Divider sx={{ width: '100%', mb:2 }} />
                                { 
                                    Object.values( providers ).map(( provider: any ) => {     // Obtengo los valores de el objeto providers y a esos valores los mapeo

                                        if ( provider.id === 'credentials') return (<div key="credentials"></div>); // Excluimos el proveedor particular nuestro

                                        return (
                                            <Button
                                                key={ provider.id }
                                                variant="outlined"
                                                fullWidth
                                                color="primary"
                                                sx={{ mb: 1 }}
                                                onClick={ () => signIn( provider.id ) }
                                            >
                                                { provider.name }
                                            </Button>
                                        )
                                    })
                                }
                      </Grid>

                </Grid>
            </Box>
        </form>
    </AuthLayout>
  )
}


// getServerSideProps renderiza previamente la página en cada solicitud utilizando los datos que recupera del servidor.


export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {   // req es el objeto de la petición al serverProvider, query es el query de la url
    
    const session = await getSession({ req });  // Del serverProvider recuperamos la sesión del usuario
    const { p ='/' } = query;                   // Del query recuperamos la última pág visitada (p), si no hay, p = '/'

    if( session ){                              // Si hay una sesión, redirigimos a la página de destino p
        return{
            redirect: {
                destination: p.toString(),
                permanent: false
            }
        }
    }

    return {
        props: {
            
        }
    }
}

export default LoginPage