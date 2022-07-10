import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { db } from '../../../database'
import { IOrder } from '../../../interfaces'
import { Order, Product } from '../../../models'
import mongoose from 'mongoose';

type Data =
    | { message: string } 
    | IOrder;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch( req.method ) {
        case 'POST':
            return createOrder( req, res )
        default:
            return res.status(400).json({ message: 'Bad request' })

    }
    
}

const createOrder = async( req: NextApiRequest, res: NextApiResponse<Data> ) => {

    const { orderItems, total } = req.body as IOrder;

    //Verificar que tengamos un usario logueado
    const session: any = await getSession({ req });                     // En la req van las cookies y en ellas va la Sesión
    if(!session){                                                       // Si no hay sesión, no se puede crear un pedido
        return  res.status(401).json({ message: 'Unauthorized' });      // Mensaje de unauthorized
    }

    //Crear un arreglo con los productos que la persona quiere
    const productsIds = orderItems.map( product => product._id );                // Arreglo de strings con los ids de los productos
    await db.connect();                                                          // Conectamos a la bd   
    const dbProducts = await Product.find({ _id: { $in:  productsIds }});        // Buscamos los productos en la bd según los ids que tenemos en el arreglo   
    
    try {
        // Construimos subTotal según backend
        const subTotal = orderItems.reduce((prev, current) => {                        // current.price debe ser el que esta en la bd, no el que viene del front
                                                          //bd          /front
            const currentPrice = dbProducts.find( prod => prod.id === current._id )?.price    // Buscamos en el arreglo de productos de la bd, sus precios
            
            //const currentPrice = dbProducts.find((p) => new mongoose.Types.ObjectId(p._id).toString() === current._id)?.price;
            
            if ( !currentPrice ) {
                throw new Error('Verifique el carrito de nuevo');                             // Si no encontramos el precio, lanzamos un error
            }
                return (currentPrice * current.quantity) + prev                               // Si encontramos el precio, lo multiplicamos por la cantidad y lo sumamos al previo
                                                                                              // Al final obtenemos el subTotal según backend 
        }, 0 ); 
                                                                                      
        // Contruimos total según backend
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
        const backendTotal = subTotal * ( taxRate + 1 );
        
    
        if( total !== backendTotal ){                                                          // Si el total del front no coincide con el backend   
            throw new Error('El total no cuadra con el monto');                                // lanzamos un error    
        }

        // Aquí todo esta bien, creamos el pedido
        const userId = session.user._id;
        const newOrder = new Order({ ...req.body, isPaid:false, user: userId});
        newOrder.total = Math.round( newOrder.total * 100 )/100
        await newOrder.save();
        await db.disconnect();
        
        return res.status(201).json( newOrder )


    } catch ( error:any ) {
        await db.disconnect();
        console.log(error);
        res.status(400).json({ 
            message: error.message || 'Revise logs del servidor'
        })
    }


    
    //return res.status(201).json( session )
}
