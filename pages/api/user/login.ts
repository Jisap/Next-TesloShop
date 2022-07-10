import type { NextApiRequest, NextApiResponse } from 'next'
import  bcrypt from 'bcryptjs';
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
    
    switch( req.method ){
        case 'POST':
            return loginUser( req, res )

        default: 
            res.status(400).json({ 
                message: 'Bad request'
            })
    }

}

const loginUser = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const { email = '', password = '' } = req.body;
    
    await db.connect();                                                                          // Conectamos a la bd
    const user = await User.findOne({ email });                                                  // Buscamos el usuario por el email
    await db.disconnect();                                                                       // Desconectamos de la bd 

    if (!user ){                                                                                 // Si no existe el usuario en la bd
        return res.status(400).json({ message: 'Correo o contraseña incorrectos - EMAIL' });     // Bad request
    }

    if( !bcrypt. compareSync( password, user.password! ) ){                                      // Si no son comparables los hashs de las contraseñas
        return res.status(400).json({ message: 'Correo o contraseña incorrectos - PASS' });      // Bad request
    }

    const { role, name, _id } = user;                 // En este punto email y password son válidas
    const token = jwt.signToken( _id, email );        // Obtenemos el jwt

    return res.status(200).json({                     // Devolvemos el resultado
        token, 
        user:{
            email, role, name
        }

    })
}
