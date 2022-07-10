import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs';
import { db } from '../../../database';
import { User } from '../../../models';
import { jwt, validations } from '../../../utils';

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
        case 'POST':
            return registerUser(req, res)

        default:
            res.status(400).json({
                message: 'Bad request'
            })
    }

}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '', name='' } = req.body as { email: string, password: string, name: string }; // información del body

    if( password.length < 6 ){                                                                   // Validamos la pass
        return res.status(400).json({
            message: 'La contraseña debe tener al menos 6 caracteres'
        });
    }
    
    if (name.length < 3 ) {                                                                      // Validamos el nombre
        return res.status(400).json({
            message: 'El nombre debe de ser de 2 caracteres'
        });
    }
                                                                 
    if (!validations.isValidEmail(email)) {                                                      // Validamos el email
        return res.status(400).json({
            message: 'El correo no es permitido'
        });
    }
    
    await db.connect();                                                                          // Conectamos a la bd
    const user = await User.findOne({ email });                                                  // Buscamos el usuario por el email
    
    if ( user ){
        return res.status(400).json({
            message: 'El correo ya está registrado'                                              // Si ya existe el usuario mensaje de error
        });
    }

    const newUser = new User({                    // Si los datos del body son correctos creamos el nuevo usuario según modelo User
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password, 10),
        role: 'client',
        name: name,
    })

    try {
        await newUser.save({ validateBeforeSave: true });    // Grabamos el usuario en la bd

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: 'Error al crear el usuario'
        })
    }

    const { _id, role } = newUser;                         // Desestructuramos lo que nos hace falta
    const token = jwt.signToken(_id, email);               // Obtenemos el jwt

    return res.status(200).json({                          // Devolvemos el resultado
        token,
        user: {
            email, role, name
        }

    })
}
