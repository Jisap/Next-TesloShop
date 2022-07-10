import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database'
import { IOrder } from '../../../interfaces'
import { Order } from '../../../models'

type Data = 
| { message: string}
| IOrder[]

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch ( req.method ) {
        case 'GET':
            return getOrders( req, res )
            
    
        default:
            return res.status(405).json({ message: 'Bad request' })
    }
}

const getOrders = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    await db.connect();

    const orders = await Order.find()    // Buscamos todas las ordenes
        .sort({ createdAt: 'desc' })     // Ordenamos por fecha de creacion   
        .populate('user', 'name email')  // Llenamos el usuario con el nombre y email  
        .lean();


    await db.disconnect();

    return res.status(200).json( orders )
}
