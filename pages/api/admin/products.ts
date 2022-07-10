import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { IProduct } from '../../../interfaces';
import { Product } from '../../../models';
import { isValidObjectId } from 'mongoose';

import { v2 as cloudinary } from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL || '');

type Data = 
| { message: string }
| IProduct[]
|IProduct

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    
    switch (req.method) {
        case 'GET':
            return getProducts( req, res )

        case 'PUT':
            return updateProduct( req, res )

        case 'POST':
            return createProduct( req, res )
    
        default:
            res.status(400).json({ message: 'Bad request' })
    }
    
    
}

const getProducts = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    await db.connect();

    const products = await Product.find()
        .sort({ title: 'asc' })
        .lean()

    await db.disconnect();

    // Procesamiento de las imagenes
    const updatedProducts = products.map(product => {      // Mapeamos los productos y dentro de cada producto 

        product.images = product.images.map((image) => {    // mapeamos las imagenes 
            return image.includes('http')                   // si la imagen ya tiene una url la devolvemos 
                ? image
                : `${process.env.HOST_NAME}products/${image}`        // si no la creamos con la url del host
        });
        return product
    })

    res.status(200).json( updatedProducts )
}

const updateProduct = async(req: NextApiRequest, res: NextApiResponse<Data>) => { // Esta función recibe el formulario nuevo o actualizado en el req.body
    
    
    const { _id='', images=[] } = req.body as IProduct;

    if( !isValidObjectId(_id) ) {
        return res.status(400).json({ message: 'El id del producto no es válido'});
    }
    
    if( images.length < 2 ) {
        return res.status(400).json({ message: 'Es necesario al menos 2 imagenes'});
    }
    
    //TODO: posiblemente tendremos un localhost:3000/products/sldfkjsfl.jpg
    
    try {
        
        await db.connect();
        
        const product = await Product.findById(_id);                                        // Buscamos el producto por el id en bd
        
        if(!product){                                                                       // Si no existe el producto mensaje de error
            await db.disconnect();
            return res.status(400).json({ message: 'No existe un producto con ese ID' });
        }

        // Eliminar las imagenes en cloudinary
        product.images.forEach( async (image) => {                // Recorremos las imagenes del producto que actualizamos
            if(!images.includes(image)){                          // Si la imagen que iteramos no esta en el body que actualizamos hay que eliminarla
                //https://res.cloudinary.com/cursos-udemy/image/upload/v342094204982/dlkgjl5463lk53ldñglk.jpg -> [dlkgjl5463lk53ldñglk, jpg]
                const [ fileId, extension ] = image.substring( image.lastIndexOf('/') + 1).split('.'); // obtenemos la extension del archivo
                console.log({ image, fileId, extension })      
                await cloudinary.uploader.destroy(fileId);         // y eliminamos la imagen en cloudinary  
            }
        })    

        await product.update( req.body );                                                   // Si existe el producto lo actualizamos con los nuevos datos
        await db.disconnect();

        return res.status(200).json( product );

    } catch (error) {
        console.log(error);
        await db.disconnect()
        return res.status(400).json({ message: 'Revisar la consola del servidor' });
    }
}

const createProduct = async(req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const { images = [] } = req.body as IProduct;

    if( images.length < 2 ) {
        return res.status(400).json({ message: 'El producto necesita al menos 2 imagenes '})
    }

    //TODO: posiblemente tendremos un localhost:3000/products/sldfkjsfl.jpg

    try {
        await db.connect();
        
        const productInDB = await Product.findOne({ slug: req.body.slug });    // Buscamos el producto por el slug en bd
        if( productInDB ) {                                                    // Si existe el producto mensaje de error
            await db.disconnect();
            return res.status(400).json({ message: 'El producto ya existe' });
        }
        
        const product = new Product( req.body );                                // Si no existe el producto lo creamos
        await product.save();                                                   // Y lo guardamos en bd
        
        res.status(201).json( product );
        
        await db.disconnect();
    } catch (error) {
        await db.disconnect()
        return res.status(400).json({ message: 'Revisar la consola del servidor' });
    }
}
