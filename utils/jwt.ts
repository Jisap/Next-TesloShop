import jwt from 'jsonwebtoken'

export const signToken = ( _id:string, email:string ) => {

    if( !process.env.JWT_SECRET_SEED ){
        throw new Error('No se encuentra la variable de entorno JWT_SECRET_SEED');
    }

    return jwt.sign(
        // payload
        { _id, email},

        // Seed
        process.env.JWT_SECRET_SEED,

        // Opciones
        { expiresIn: '30d'}
    )
}

export const isValidToken = ( token:string ):Promise<string> => { // Función de validación de jwt

    if (!process.env.JWT_SECRET_SEED) {                                            // 1º Nos aseguramos que tenemos la variable de entorno que encrypta la información
        throw new Error('No se encuentra la variable de entorno JWT_SECRET_SEED');
    }

    if( token.length <= 10 ){ 
        return Promise.reject('JWT no es válido');
    }

    return new Promise( ( resolve, reject ) => {                                        // 2º Creamos una promesa

        try {
            jwt.verify( token, process.env.JWT_SECRET_SEED || '', ( err, payload) => {   // 3º Verificamos que el token se encrypto según la variable de entorno
                const { _id } = payload as { _id:string };                               // Obtenemos del payload el id del usuario 
                resolve( _id );                                                          // Resolvemos el id del usuario
            });
        } catch (error) {
            reject('JWT no es válido');
        }
    })
}