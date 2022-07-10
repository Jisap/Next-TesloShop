import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs';

import  { v2 as cloudinary } from 'cloudinary';
cloudinary.config( process.env.CLOUDINARY_URL || '' );

type Data = {
    message: string
}

export const config = {        
    api: { bodyParser: false } // deshabilita el bodyParser para esta ruta. body-parser extrae la parte del cuerpo completo de un flujo de solicitud entrante y lo expone en req.body.
}                              // Esto lo hacemos porque no queremos toda la información que normalmente trae el req.body , solo las imagenes. Y para ello usaremos un paquete externo: Formidable 

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'POST':
            return uploadFile( req, res );
        
    
        default:
            res.status(400).json({ message: 'Bad request' });
    }
}

const saveFile = async( file:formidable.File ): Promise<string> => {   // Esta función se encarga de guardar el archivo en el servidor
    
    // const data = fs.readFileSync( file.filepath );                  // Leemos el archivo de la ruta temporal en fs que nos devuelve formidable
    // fs.writeFileSync( `./public/${file.originalFilename}`, data );  // Guardamos el archivo en la ruta indicada 
    // fs.unlinkSync( file.filepath );                                 // Eliminamos el archivo temporal    
    // return;   

    const { secure_url } = await cloudinary.uploader.upload( file.filepath );    // Guardamos el archivo ( almacenado en una ruta temporal) en cloudinary 
    return secure_url;                                                           // Cloudinary nos devuelve la url de la imagen subida 
}

const parseFiles = async (req: NextApiRequest): Promise<string> => {   // Esta función se encarga de parsear los archivos que se suben al servidor
    
    return new Promise((resolve, reject) => {

        const form = new formidable.IncomingForm();         // Crea un formulario con "formidable" que recibe archivos
        form.parse(req, async( err, fields, files ) => {    // Parseamos el formulario
           
            if( err ){
                return reject(err);
            }
            const filePath = await saveFile(files.file as formidable.File); // Guardamos el archivo en cloudinary. La grabación se hace archivo a archivo
            resolve(filePath);                                              // En filePhat guardamos las url de la imagenes subidas 
        });
    })
}

const uploadFile = async(req: NextApiRequest, res: NextApiResponse<Data>) => {

    const imageUrl = await parseFiles(req);    // Parseamos los archivos y guardamos en cloudinary
    
    return res.status(200).json({ message: imageUrl });
}
