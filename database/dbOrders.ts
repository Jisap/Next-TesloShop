import { IOrder } from "../interfaces";
import { isValidObjectId } from 'mongoose';
import { db } from ".";
import { Order } from "../models";


export const getOrderById = async( id: string):Promise<IOrder | null> => { // Función para obtener una orden según su id

    if( !isValidObjectId( id )){                                           // 1º comprobamos que el id sea de tipo mongo 
        return null;
    }

    await db.connect();                                                    // Si el id es ok conectamos a la bd    
    const order = await Order.findById( id ).lean();                       // Buscamos la orden en la bd
    await db.disconnect();

    if ( !order ){                                                         // Si no hay orden retornamos null   
        return null;
    }

    return JSON.parse(JSON.stringify(order));                              // Si hay orden la retornamos como un JSON que previamente ha sido convertido a strings 

}

export const getOrdersByUser = async( userId: string ): Promise<IOrder[]> => { // Función para obtener todas las ordenes de un usuario

    if (!isValidObjectId(userId)) {                                            // 1º comprobamos que el id sea de tipo mongo 
        return [];
    }

    await db.connect();
    const orders = await Order.find({ user: userId }).lean();                  // Buscamos en bd Order los registros donde user = userId  
    await db.disconnect();

    return JSON.parse(JSON.stringify(orders));

}