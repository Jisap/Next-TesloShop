import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import { AdminLayout } from '../../../components/layouts'
import { IProduct, ISize, IType } from '../../../interfaces';
import { DriveFileRenameOutline, SaveOutlined, UploadOutlined } from '@mui/icons-material';
import { dbProducts } from '../../../database';
import { Box, Button, capitalize, Card, CardActions, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { tesloApi } from '../../../api';
import { Product } from '../../../models';
import { useRouter } from 'next/router';


const validTypes = ['shirts', 'pants', 'hoodies', 'hats']
const validGender = ['men', 'women', 'kid', 'unisex']
const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

interface FormData {                   // La data del formulario va lucir como un IProduct
    _id? : string;                      // Si modificamos un producto no es necesario el _id    
    description: string;
    images: string[];
    inStock: number;
    price: number;
    sizes: string[];
    slug: string;
    tags: string[];
    title: string
    type: string;
    gender: string;
}

interface Props {
    product: IProduct;
}

const ProductAdminPage: FC<Props> = ({ product }) => {

    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newTagValue, setNewTagValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, formState:{ errors }, getValues, setValue, watch } = useForm({ // watch observará valores y sus modificaciones
        defaultValues: product // Las funciones de useForms se aplicarán al producto que viene por props siendo de tipo IProduct
    })

    useEffect(() => { // useEffect para gestionar la creación de nuevos slugs en base al cambio de title -> usaremos un watch de useForm
    //value son los valores de las props de IProduct en el formulario, name hace ref al nombre de la prop que cambia y type al tipo de evento que sucede (cambio valor)
        const subscription = watch( (value, { name, type }) => {
            
            if ( name === 'title' ) {                       // Si el nombre de la prop que cambia es title
                const newSlug = value.title?.trim()         // Obtenemos el valor del title y lo quitamos los espacios
                    .replaceAll(' ', '_')                   // Reemplazamos los espacios por _
                    .replaceAll("'", '')                    // Quitamos las comillas
                    .toLowerCase() || ''                    // Lo ponemos en minúsculas
                setValue('slug', newSlug)                   // Y lo asignamos al slug
            } 
        })

        return () => subscription.unsubscribe(); // Unsubscribe al finalizar el watch
        
    }, [watch, setValue]);

    const onChangeSize = (size: string) => {
        const currentSizes = getValues('sizes'); // Tallas disponibles en product -> ISize[]
        console.log(currentSizes);
        if (currentSizes.includes(size as ISize)) { // Si la talla elegida esta dentro de las disponibles
            return setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true }); // Eliminamos la talla elegida
        }   

        setValue('sizes', [...currentSizes as ISize[]  , size as ISize], { shouldValidate: true });//Si la talla elegida no esta dentro de las disponibles, la añadimos
    }

    const onNewTag = () => {                                // Modifica el [] de tags que usa el product
        const newTag = newTagValue.trim().toLowerCase();    // Al nuevo tag le quitamos los espacios y lo ponemos en minúsculas
        setNewTagValue('');                                 // Limpiamos el input
        const currentTags = getValues('tags');              // Tags disponibles en este product -> string[]
        if (currentTags.includes(newTag)) {                 // Si el tag ya existe
            return;                                         // No hacemos nada    
        }
        currentTags.push(newTag)                            // Si el tag no existe, lo añadimos al []
    }

    const onFilesSelected = async({ target }: ChangeEvent<HTMLInputElement>) => { 

       if(!target.files || target.files.length === 0) {
           return;
       }
       
       try {
           for(const file of target.files) {        // Recorremos todos los archivos seleccionados
                const formData = new FormData();    // Creamos un formData (formData ayuda a construir un set de datos clave/valor para enviar a la API)
                formData.append('file', file);      // Añadimos el archivo al formData
                const { data } = await tesloApi.post<{ message: string }>('/admin/upload', formData); // Enviamos el formData a la API
                setValue('images', [...getValues('images'), data.message], { shouldValidate: true }); // Añadimos la url a la lista de imagenes
           }   
       } catch (error) {
              console.log(error);
       }
        
    }

    const onDeleteImage = async(image: string) => {
        
        setValue('images', getValues('images').filter(i => i !== image), { shouldValidate: true }); // Eliminamos la imagen del producto
        
    }

    const onDeleteTag = (tag: string) => {
        const updateTags = getValues('tags').filter(t => t !== tag); // Eliminamos el tag del array
        setValue('tags', updateTags, { shouldValidate: true });      // Actualizamos el array
    }

    const onSubmit = async( form: FormData ) => {// El producto que queramos guardar podrá ser o una actualización o una creación
        
        if( form.images.length < 2) return alert('Mínimo 2 imagenes');                  // Comprobación de que hay al menos 2 imagenes
        setIsSaving(true);                                                              // Si las hay isSaving en true
        try {
            const { data } = await tesloApi({                                           // Petición a la API/admin/products para grabar o actualizar
                url: '/admin/products',                                                      
                method: form._id ? 'PUT':'POST',                                        // Si tenemos un _id, es un PUT(actualizar), si no, es un POST(crear)
                data: form
            })
            console.log(data);
            if(!form._id){                                                              // Si no tenemos un _id, es un nuevo producto
                router.replace( `/admin/products/${data.slug}` )                        // Redirigimos a la página del producto con el slug que pusimos en el nuevo producto
            }else{
                setIsSaving(false);
            }
        } catch (error) {
            console.log(error)
            setIsSaving(false);
        }
    }

    return (
        <AdminLayout
            title={'Producto'}
            subTitle={`Editando: ${product.title}`}
            icon={<DriveFileRenameOutline />}
        >
            <form onSubmit={ handleSubmit( onSubmit ) }>
                <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
                    <Button
                        color="secondary"
                        startIcon={<SaveOutlined />}
                        sx={{ width: '150px' }}
                        type="submit"
                        disabled={ isSaving }
                    >
                        Guardar
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {/* Data */}
                    <Grid item xs={12} sm={6}>

                        <TextField
                            label="Título"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('title', {                                        // Register permite registrar una entrada o seleccionar un elemento 
                                required: 'Este campo es requerido',                       // y aplicar reglas de validación 
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={ !!errors.title }
                            helperText={ errors.title?.message }
                        />

                        <TextField
                            label="Descripción"
                            variant="filled"
                            fullWidth
                            multiline
                            sx={{ mb: 1 }}
                            {...register('description', {                                        
                                required: 'Este campo es requerido',                       
                            })}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />

                        <TextField
                            label="Inventario"
                            type='number'
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('inStock', {                                         
                                required: 'Este campo es requerido',                      
                                min: { value: 0, message: 'Mínimo de valor cero' }
                            })}
                            error={!!errors.inStock}
                            helperText={errors.inStock?.message}
                        />

                        <TextField
                            label="Precio"
                            type='number'
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('price', {
                                required: 'Este campo es requerido',
                                min: { value: 0, message: 'Mínimo de valor cero' }
                            })}
                            error={!!errors.price}
                            helperText={errors.price?.message}
                        />

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Tipo</FormLabel>
                            <RadioGroup
                                row    
                                value={ getValues('type') }
                                onChange={ ({ target } ) => setValue('type', target.value as IType, { shouldValidate: true }) }
                            >
                                {
                                    validTypes.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio color='secondary' />}
                                            label={capitalize(option)}
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Género</FormLabel>
                            <RadioGroup
                                row
                                value={ getValues('gender') }
                                onChange={({ target }) => setValue('gender', target.value as 'men' | 'women' | 'kid' | 'unisex', { shouldValidate: true })}
                            >
                                {
                                    validGender.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio color='secondary' />}
                                            label={capitalize(option)}
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormGroup>
                            <FormLabel>Tallas</FormLabel>
                            {
                                validSizes.map(size => (
                                    <FormControlLabel 
                                        key={size}             // getValues hace ref a ISize[] de product
                                        control={<Checkbox checked={ getValues('sizes').includes(size as ISize)}/>} // Si los valores del campo sizes incluye el size que se itera, se marca
                                        label={size}                                                                // Básicamente nos dice que tallas tiene este producto
                                        onChange={ () => onChangeSize( size )} // Implementamos una función para añadir o quitar las tallas que el admin quiera
                                    />
                                ))
                            }
                        </FormGroup>

                    </Grid>

                    {/* Tags e imagenes */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Slug - URL"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('slug', {
                                required: 'Este campo es requerido',
                                validate: (val) => val.trim().includes(' ') ? 'No puede contener espacios en blanco' : undefined
                            })}
                            error={!!errors.slug}
                            helperText={errors.slug?.message}
                        />

                        <TextField
                            label="Etiquetas"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            helperText="Presiona [spacebar] para agregar"
                            value={ newTagValue }                                           // newTagValue es el valor que se muestra en el input
                            onChange={ ({ target }) => setNewTagValue(target.value) }       // Cuando cambia el input cambiamos el estado de newTagValue
                            onKeyUp={ ({ code }) => code === 'Space' ? onNewTag() : undefined } // Si se presiona la tecla espacio, se llama a la función onNewTag
                        />

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            p: 0,
                            m: 0,
                        }}
                            component="ul">
                            {
                                getValues('tags').map((tag) => { // mapeamos los tags que el usuario ha escrito

                                    return (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => onDeleteTag(tag)}
                                            color="primary"
                                            size='small'
                                            sx={{ ml: 1, mt: 1 }}
                                        />
                                    );
                                })}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box display='flex' flexDirection="column">
                            <FormLabel sx={{ mb: 1 }}>Imágenes</FormLabel>
                            <Button
                                color="secondary"
                                fullWidth
                                startIcon={<UploadOutlined />}
                                sx={{ mb: 3 }}
                                onClick={() => fileInputRef.current?.click()} // Al hacer click en el botón, se establece el valor de fileInputRef.current y dispara el onChange del input
                            >
                                Cargar imagen
                            </Button>
                            <input 
                                ref={ fileInputRef }    // fileInputRef es un ref a un input de tipo file
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/gif"
                                style={{ display: 'none' }} // Esta oculto
                                onChange={ onFilesSelected } // Cuando se seleccionan archivos, se llama a la función onFilesSelected
                            />

                            <Chip
                                label="Es necesario al 2 imagenes"
                                color='error'
                                variant='outlined'
                                sx={{ display: getValues('images').length < 2 ? 'flex' : 'none' }}
                            />

                            <Grid container spacing={2}>
                                {
                                    getValues('images').map(img => (
                                        <Grid item xs={4} sm={3} key={img}>
                                            <Card>
                                                <CardMedia
                                                    component='img'
                                                    className='fadeIn'
                                                    image={ img }
                                                    alt={img}
                                                />
                                                <CardActions>
                                                    <Button 
                                                        fullWidth 
                                                        color="error"
                                                        onClick={ () => onDeleteImage(img) }
                                                    >
                                                        Borrar
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                }
                            </Grid>

                        </Box>

                    </Grid>

                </Grid>
            </form>
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ query }) => {

    const { slug = '' } = query;                                             // Obtenemos el slug del query de la url

    let product: IProduct|null;                                              // Creamos una variable para guardar el producto

    if( slug === 'new'){                                                     // Si el slug es new, creamos un nuevo producto, para ello 
        const tempProduct = JSON.parse( JSON.stringify( new Product()));     // 1º creamos un nuevo objeto temporal de tipo IProduct.
        delete tempProduct._id                                               // Eliminamos el id del producto temporal
        tempProduct.images = ['img1.jpg', 'img2.jpg'];                       // Le asignamos unas imágenes por defecto
        product = tempProduct;                                               // Asignamos el producto temporal al producto final, el cual estará vacio.
    }else{
        product = await dbProducts.getProductBySlug(slug.toString());        // Si el slug es difetente de new obtenemos el producto por el slug
    }


    if (!product) {                                                          // Si no existe el producto
        return {
            redirect: {
                destination: '/admin/products',                              // Redirigimos a la lista de productos
                permanent: false,
            }
        }
    }


    return {
        props: {
            product                                                         // Pasamos el producto al componente
        }
    }
}


export default ProductAdminPage