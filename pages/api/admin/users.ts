import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { User } from '../../../models';
import { IUser } from '../../../interfaces';
import { isValidObjectId } from 'mongoose';

type Data = 
| { message: string }
|  IUser[] 

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch ( req.method ) {
        case 'GET':
            return getUsers( req, res );
        case 'PUT':
            return updateUser( req, res );
    
        default:
            res.status(400).json({ message: 'Bad request' });
            break;
    }

}

const getUsers = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    await db.connect();
    const users = await User.find().select('-password').lean();
    await db.disconnect();

    return res.status(200).json( users )

}


const updateUser = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const { userId ='', role = '' } = req.body;                                        // Obtenemos el id del usuario y el nuevo role

    if (!isValidObjectId(userId)) {                                                    // Chekeamos que el id sea de mongo
        return res.status(400).json({ message: 'No existe usuario por ese id' })
    }

    const validRoles = ['admin', 'super-user', 'SEO', 'client'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol no permitido: ' + validRoles.join(', ') }); // Chekeamos que el rol sea valido
    }

    await db.connect();
    const user = await User.findById(userId);    // Buscamos el usuario por su id

    if (!user) {                                // Sino existe el usuario mensaje de error
        await db.disconnect();
        return res.status(404).json({ message: 'Usuario no encontrado: ' + userId });
    }

    user.role = role;            // Si si existe el usuario actualizamos el rol
    await user.save();           // Grabamos el usuario en bd 
    await db.disconnect();

    return res.status(200).json({ message: 'Usuario actualizado' }); // Si todo sale bien mensaje de exito
}
