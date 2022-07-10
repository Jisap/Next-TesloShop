import { db } from ".";
import { Product } from "../models";
import { IProduct } from "../interfaces";


export const getProductBySlug = async( slug: string ):Promise<IProduct | null> => { // Usamos este endpoint y no el de la api
                                                                                    // para no llamar al server desde el mismo
    await db.connect();                                                             // si implementamos en la página de producto el getServerSideProps           
    const product = await Product.findOne({ slug }).lean()
    await db.disconnect();

    if( !product ){
        return null;
    }

    // Procesamiento de las imagenes
    product.images = product.images.map( (image) => {    // mapeamos las imagenes 
        return image.includes('http')                    // si la imagen ya tiene una url la devolvemos 
            ? image 
            : `${ process.env.HOST_NAME }products/${image}`       // si no la creamos con la url del host
    })

    return JSON.parse( JSON.stringify( product ))
}

interface ProductSlug{ 
    slug:string;
}

export const getAllProductSlugs = async(): Promise<ProductSlug[]> => {
    await db.connect(); 
    const slugs = await Product.find().select('slug -_id').lean(); // slugs = [{}]
    await db.disconnect()

    return slugs;
}

export const getProductsByTerm = async( term:string ):Promise<IProduct[]> => { // Esta función devuelve una promesa de IProduct[{}]

    term = term.toString().toLowerCase();

    await db.connect();
    const products = await Product.find({ $text: { $search: term }})
        .select('title images price inStock slug -_id')
        .lean();

    await db.disconnect();

    // Procesamiento de las imagenes
    const updatedProducts = products.map( product => {      // Mapeamos los productos y dentro de cada producto 
        
        product.images = product.images.map((image) => {    // mapeamos las imagenes 
            return image.includes('http')                   // si la imagen ya tiene una url la devolvemos 
                ? image
                : `${process.env.HOST_NAME}products/${image}`        // si no la creamos con la url del host
        });
        return product
    })
        
    return updatedProducts;
}

export const getAllProducts = async (): Promise<IProduct[]> => {

    await db.connect();
    const products = await Product.find().lean();
    await db.disconnect();

    // Procesamiento de las imagenes
    const updatedProducts = products.map(product => {      // Mapeamos los productos y dentro de cada producto 

        product.images = product.images.map((image) => {    
            return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`        
        });
        return product
    })


    return JSON.parse(JSON.stringify(updatedProducts));
}