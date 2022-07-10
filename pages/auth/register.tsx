import React, { useContext, useState } from 'react'
import NextLink from 'next/link'
import { GetServerSideProps } from 'next'
import { getSession, signIn } from 'next-auth/react'
import { tesloApi } from '../../api'
import { useForm } from 'react-hook-form'
import { validations } from '../../utils'
import { Box, Button, Grid, Link, TextField, Typography, Chip } from '@mui/material'
import { AuthLayout } from '../../components/layouts'
import { ErrorOutline, SingleBedOutlined } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { AuthContext } from '../../context'

type FormData = { 
  name: string,
  email: string,
  password: string,
}



const RegisterPage = () => {

  const router = useRouter()
  const { registerUser } = useContext( AuthContext )
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onRegisterForm = async ({ name, email, password }: FormData) => {

    setShowError(false);
    const { hasError, message } = await registerUser( name, email, password ); // La función del context nos registra en bd y en el state. Ademas valida el login del nuevo usuario y 
                                                                               // Tambien graba el token en una cookie y genera o no un mensaje de error si existe.
    if (hasError){
      setShowError(true);
      setErrorMessage( message || '')
      setTimeout(() => setShowError(false), 3000);                              // Si hay un error, lo mostramos por 3 segundos y lo ocultamos
      return
    }

    // const destination = router.query.p?.toString() || '/';  // Cuando llegamos a register evaluamos si existe el query y en función de el
    // router.replace(destination);                            // redirigimos despues del registro a la última página visitada o al home.

    await signIn('credentials', { email, password });          // Si no hubo error llamamos al método signIn de NextAuth -> [...nextAuth] -> session
  }


  return (
    <AuthLayout title={'Ingresar'}>
      <form onSubmit={ handleSubmit(onRegisterForm) } noValidate>
          <Box sx={{ width: 350, padding: '10px 20px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='h1' component='h1'>Crear cuenta</Typography>
                <Chip
                  label="No reconocemos ese usuario/contraseña"
                  color="error"
                  icon={<ErrorOutline />}
                  className="fadeIn"
                  sx={{ display: showError ? 'flex' : 'none' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  label="Nombre completo" 
                  variant="filled" 
                  fullWidth
                  {
                    ...register('name', { 
                          required: 'El nombre es requerido', 
                          minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }    
                    })
                  } 
                error={!!errors.name}                            
                helperText={errors.name?.message} 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="email" 
                  label="Correo" 
                  variant="filled" 
                  fullWidth
                    {
                    ...register('email', {                          // register asocia cada campo con el formulario
                      required: 'Este campo es requerido',
                      validate: validations.isEmail                 // validamos que sea un email con isEmail de validations 
                    })
                    }
                  error={!!errors.email}                            // Convertimos a booleano el valor de errors.email
                  helperText={errors.email?.message}                // Si hay error, mostramos el mensaje de error  
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  type='password' 
                  label="Contraseña" 
                  variant="filled" 
                  fullWidth
                    {
                    ...register('password', {
                      required: 'Este campo es requerido',
                      minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                    })
                    }
                  error={!!errors.password}
                  helperText={errors.password?.message}  
                />
              </Grid>

              <Grid item xs={12}>
                <Button 
                  color="secondary" 
                  className="circular-btn" 
                  size="large" 
                  fullWidth 
                  type="submit">
                    Ingresar
                </Button>
              </Grid>
              <Grid item xs={12} display='flex' justifyContent='end'>
                <NextLink 
                  href={router.query.p ? `/auth/login?p=${router.query.p}` : '/auth/login'}  
                  passHref
              >
                  <Link underline='always'>¿ Ya tienes cuenta ?</Link>
                </NextLink>
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
  const { p = '/' } = query;                  // Del query recuperamos la última pág visitada (p), si no hay, p = '/'

  if (session) {                              // Si hay una sesión, redirigimos a la página de destino p
    return {
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

export default RegisterPage