import mongoose, { Schema, model, Model } from 'mongoose';
import { IProduct } from '../interfaces';


const productSchema = new Schema({
    description: { type: String, required: true, default: '' },
    images: [{ type: String }],
    inStock: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    sizes: [{ 
        type: String,
        enum:{ 
            values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            message: '{VALUE} no es un tamaño permitido',
        },
    }],
    slug: { type: String, required: true, unique: true },
    tags: [{ type: String }],
    title: { type: String, required: true, default:'' },
    type: {
        type: String,
        enum:{ 
            values:['shirts', 'pants', 'hoodies', 'hats'],
            message: '{VALUE} no es un tipo válido',
        },
        default: 'shirts'
    },
    gender: { 
        type: String,
        enum: {
            values: ['men', 'women', 'kid', 'unisex'],
            message: '{VALUE} no es un género válido',
        },
        default:'women'
    }
},{
    timestamps: true
});

// Los índices admiten la ejecución eficiente de consultas en MongoDB.
// Sin índices, MongoDB debe realizar un escaneo de colección, es decir, escanear todos los documentos de una colección,
// para seleccionar aquellos documentos que coincidan con la declaración de consulta.
// Si existe un índice apropiado para una consulta, MongoDB puede usar el índice para limitar la cantidad de documentos que debe inspeccionar.


productSchema.index({ title: 'text', tags: 'text' }); // Creamos un índice de mongo por título y tags

const Product: Model<IProduct> = mongoose.models.Product || model('Product', productSchema); // Si el modelo ya existe lo usa y si no lo crea

export default Product