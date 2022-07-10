import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs';
import { db } from '../../../database';
import { User } from '../../../models';
import { jwt } from '../../../utils';

type Data =
    | { message: string }
    | {
        token: string,
        user: {
            email: string,
            role: string,
            name: string
        }
    }


export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return checkJWT(req, res)

        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const checkJWT = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { token = '' } = req.cookies;                                        // Obtenemos el token de las cookies

    let userId = '';

    try {
        userId = await jwt.isValidToken(token);                                // Usamos la función de validación que nos devuelve el id del usuario
    } catch (error) {
        return res.status(401).json({
            message: 'Token de autorización no se válido'
        })
    }    

    await db.connect();                                                               // Conectamos a la bd
    const user = await User.findById( userId).lean()                                  // Buscamos el usuario por el id en la bd (modelo User)
    await db.disconnect();                                                            // Desconectamos de la bd 

    if (!user) {                                                                      // Si no existe el usuario en la bd
        return res.status(400).json({ message: 'No existe usuario con ese ID' });     // Bad request
    }

    const { _id, email, role, name } = user;          // Del usuario obtenemos la información que nos interesa

    return res.status(200).json({                     // Devolvemos el resultado
        token: jwt.signToken( _id, email),            // Nuevo token con el id y email del usuario
        user: {                                       // Resto de la información del usuario
            email, role, name
        }

    })
}
