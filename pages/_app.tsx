import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { CssBaseline, ThemeProvider } from '@mui/material'
import { SWRConfig } from 'swr'
import { lightTheme } from '../themes'
import { AuthProvider, CartProvider, UiProvider } from '../context'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function MyApp({ Component, pageProps }: AppProps) {
  return (

    // La aplicación pasa globalmente por api/auth/[...nexauth].ts y devuelve un usuario autenticado por el provider seleccionado
    <SessionProvider>
      <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '' }}>

        <SWRConfig                                                                     // Configuración global del SWR
          value={{                                                                     // Le pasamos el fetcher que usará SWR
            fetcher: (resource, init) => fetch(resource, init).then(res => res.json()) // fetcher, no es más que una envoltura del fetch nativo
          }}
          >
          <AuthProvider>
            <CartProvider>
              <UiProvider>
                <ThemeProvider theme={ lightTheme }>
                  <CssBaseline />
                  <Component {...pageProps} />
                </ThemeProvider>
              </UiProvider>
            </CartProvider>
          </AuthProvider>
        </SWRConfig>
      </PayPalScriptProvider>

    </SessionProvider>

  )
}

export default MyApp
