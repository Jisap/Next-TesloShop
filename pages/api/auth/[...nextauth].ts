import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { dbUsers } from "../../../database"

export default NextAuth({                                                                      // [...nextauth] por aqui entra la app al arrancar
    // Configure one or more authentication providers
    providers: [
        GithubProvider({                                                                       // Proveedor de autenticación de Github
            clientId: process.env.GITHUB_ID,                                                   // Cada proveedor nos dará un user y un tokenAccess
            clientSecret: process.env.GITHUB_SECRET,
        }),
       Credentials({                                                                           // Proveedor particular nuestro
           name: 'Custom Login',                                                               // Configuración de los campos      
           credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'correo@google.com' },
                password: { label: 'Contraseña', type: 'password', placeholder: 'Contraseña'},
           },
           async authorize( credentials ){                                                      // Función de autenticación de next-auth recibiendo los datos del formulario
                //console.log({credentials})
                return await dbUsers.checkUserEmailPassword( credentials!.email, credentials!.password ); // Verficamos en la base de datos el usuario y la pass
           }                                                                                              // Este user pasa a los callbacks de next-auth  
       })
    ],
    pages:{    // Custom pages of signIn and register
        
        signIn: '/auth/login',
        newUser: '/auth/register',

    },
    jwt:{
        // Aqui se puede expecificar si va o no encryptado. Por defecto no lo esta.
    },
    session:{
        maxAge: 2592000, // 30 days
        strategy: 'jwt',
        updateAge: 86400, // 1 day
    },
    
    // Configuración de las respuestas de next-auth
    callbacks:{  //token=name, email//account=credentials or oAuth, access_token//user= name, email, role                                                              
        async jwt({ token, account, user }){                                       // Cuando nos logeamos o renovamos la sesión se crea un jwt que se almacenara en forma de cookie
                                                                                   // El jwt estará basado en la info autenticada del user y su contenido es llevado a el callback session
            if( account ){                                                         // Si el usuario esta autenticado hay que introducir un token de acceso para el caso de signin con redes sociales
                token.accessToken = account.access_token;                          // Evaluamos el tipo de cuenta osea si es de redes sociales o personalizada 
                switch(account.type){
                    case 'oauth':                                                                        // Si la autenticación es por redes sociales
                        token.user = await dbUsers.oAUthToDbUser( user?.email || '', user?.name || '')   // El token.user se establece con la info del usuario de la bd
                        //console.log(token)                                                             // token { name, email, accessToken, user: { _id, role, name, email } }}       
                    break;
                    case 'credentials':                                            // Si la autenticación es personalizada
                        token.user = user;                                         // El token.user se establece  con la info de las credenciales validadas.
                        //console.log(token);                                      // Token { name, email, accessToken: undefined, user: { _id, role, name, email } }
                        break;
                }                                                                  
            }                                                                                                                                
            return token                                                           // Devolvemos el token  y pasa al siguiente callback
        },
        async session({ session, token, user }){                                   // Siempre que se use useSession se ejecuta este callback, en nuestro caso en authProvider
            //console.log({session, token, user})                                  // session en principio solo tiene el user y el expires      
            session.accessToken = token.accessToken;                               // Introducimos en la sesión el valor del token.accessToken
            session.user = token.user as any;                                      // Introducimos en la sesión el valor del token.user  
            //console.log(session)
            return session                                                         // Devolvemos la sesión con el access_token ,el user que venia del token y el expires
        }                                                                          // Esta session es la data que se recibe en el userSession del auth-provider  
    }
})