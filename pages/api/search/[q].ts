import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database'
import { IProduct } from '../../../interfaces'
import { Product } from '../../../models'

type Data = 
    | { message: string }
    | IProduct[]

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch (req.method) {
        case 'GET':
            return getSearchProducts(req, res)
    
        default:
            return res.status(400).json({
                message: 'Bad request'
            })
    }
}

const getSearchProducts = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    let { q = '' } = req.query;
    
    if( q.length === 0 ){
        return res.status(400).json({
            message: 'Debe de expecificar una busqueda'
        })
    }

    q = q.toString().toLowerCase();

    await db.connect();

    const products = await Product.find({
        $text: { $search: q}
    })
    .select('title iamges price inStock slug -_id')
    .lean()
    
    await db.disconnect();
    
    return res.status(200).json( products)
}
