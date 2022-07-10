import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { IPaypal } from '../../../interfaces';
import { db } from '../../../database';
import { Order } from '../../../models';

type Data = {
    message: string
}

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch ( req.method ) {
        case 'POST':
            return payOrder( req, res );
    
        default:
            res.status(400).json({ message: 'Bad request' })
            
    }    
       
}

const getPaypalBearerToken = async():Promise<string|null> => { // Funcion para obtener un token de paypal que nos confirma el pago realizado

    const PAYPAL_CLIENT = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;                        // Llave pública de paypal
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;                                       // Llave secreta de paypal     

    const base64Token = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`, 'utf-8').toString('base64'); // Encriptación en base 64 de las llaves de paypal

    const body = new URLSearchParams('grant_type=client_credentials');                     // Params requeridos por paypal

    try {
        const { data } = await axios.post( process.env.PAYPAL_OAUTH_URL || '', body, {     // Petición a paypal para obtener el token de acceso
            headers: {                                                                     // Contiene el body = params
                'Authorization': `Basic ${base64Token}`,                                   // Y los headers con la autorización proporcionada por las llaves 
                'Content-Type':'application/x-www-form-urlencoded'
            }
        });

        return data.access_token                                                           // Si todo fue bien obtenemos de la data el token de paypal 
                                                                                           
    } catch (error) {
        if( axios.isAxiosError(error)){
            console.log(error.response?.data);
        }else{
            console.log(error);
        }
        return null
    }
}

const payOrder = async(req: NextApiRequest, res: NextApiResponse<Data>) => {    // Función para efectuar el pago a paypal

    //TODO: Validar session del usuario
    //TODO: Validar mongoId


    const paypalBearerToken = await getPaypalBearerToken();

    if( !paypalBearerToken ){
        return res.status(400).json({ message:'No se pudo confirmar el token de paypal'});
    }
            //paypal(details)    MongoDB
    const { transactionId ='', orderId = '' } = req.body;

    // Petición a paypal para verificar el pago de la transacción
    const { data } = await axios.get<IPaypal.PaypalOrderStatusResponse>(`${process.env.PAYPAL_ORDERS_URL}/${transactionId}`, { 
        headers:{
            'Authorization': `Bearer ${paypalBearerToken}`
        }
    });

    if ( data.status !== 'COMPLETED'){
        return res.status(401).json({ message:'Orden no reconocida' })
    }

    await db.connect();            // id de mongo db
    const dbOrder = await Order.findById(orderId);      // Orden de la bd sobre la que se realiza el pago  
    
    if ( !dbOrder ){
        await db.disconnect();
        return res.status(400).json({ message: 'Orden no existe en nuestra base de datos'}); // Comprobación 1ª
    }

    if( dbOrder.total !== Number(data.purchase_units[0].amount.value)){                      // Comprobación 2ª  
        await db.disconnect();
        return res.status(400).json({ message: 'Las cantidades de Paypal y nuestra orden no son iguales' });
    }

    dbOrder.transactionId = transactionId; // Metemos en la orden de mongo la id de paypal
    dbOrder.isPaid = true;                 // y cambiamos isPaid a true   
    await dbOrder.save();                  // Por último grabamos la orden en bd con los cambios efectuados.

    await db.disconnect();
    

    res.status(200).json({ message: 'Orden pagada' });    // Mensaje final de pago efectuado correctamente
}