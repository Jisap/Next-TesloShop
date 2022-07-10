
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
//import { jwt } from "../../utils";
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest, ev:NextFetchEvent) { // Los middleware se ejecutan antes de renderizar cualquier página

    // MÉTODO PERSONALIZADO
    // const { token = '' } = req.cookies;   // Obtenemos la cookie
    // //const { pathname, origin } = req.nextUrl //

    // try {
    //     await jwt.isValidToken(token);    // Validamos la cookie
    //     return NextResponse.next();       // Si la cookie es buena dejamos que se renderize la página 
    // } catch (error) {
    //     const { origin, pathname } = req.nextUrl.clone();                      // Clonamos el objeto nextUrl que contiene las props de la url actual
    //     return NextResponse.redirect( `${origin}/auth/login?p=${pathname}` )   // Si no hay cookie redirect a login con la query de la pag a la que queriamos entrar
    //                                                                            // Especificamos el origen de la url (local o producción) y la ruta a la que queriamos entrar
    // }                                                                          // añadiendo el query de la pag que despues se renderizará     


    // MÉTODO DE NEXTAUTH
    const session = await getToken ({ req, secret: process.env.NEXTAUTH_SECRET }); // Obtenemos la session gracias a getToken, que es una función de next-auth que nos devuelve el payload del jwt

    if (!session) {                                                                // Si no existe la sesión, redirect a login con la query de la pag a la que queriamos entrar
        const { origin, pathname } = req.nextUrl.clone();                          // Especificamos el origen de la url (local o producción) y la ruta a la que queriamos entrar  
        return NextResponse.redirect( `${origin}/auth/login?p=${pathname}` );      // añadiendo el query de la pag que despues se renderizará
    }

    return NextResponse.next();                                                    // Si si existe la sessión dejamos que se renderize la página



}