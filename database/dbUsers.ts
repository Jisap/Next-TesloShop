import bcrypt from 'bcryptjs'
import { User } from "../models";
import { db } from "./"



export const checkUserEmailPassword = async( email:string, password:string ) => {
    
    await db.connect();
    const user = await User.findOne({ email });               // Buscamos en db un usuario según email
    await db.disconnect();

    if(!user){                                                // Sino existe user return null
        return null;
    }

    if ( !bcrypt.compareSync( password, user.password! ) ){    // Si si existe comparamos los hash de bcrypt de la pass del argumento con la pass del usuario       
        return null                                            // y si no hacen match return null
    }

    const { role, name, _id } = user;                          // Si se llego a este punto el user existe y la pass es correcta  

    return { 
        _id, 
        email: email.toLocaleLowerCase(), 
        role,
        name, 
    }                                                          // Devolvemos el id, email, role y name del usuario
}

export const oAUthToDbUser = async( oAuthEmail: string, oAuthName: string ) => {
    
    await db.connect();
    const user = await User.findOne({ email: oAuthEmail });                                            // Buscamos en bd un usuario según email

    if( user ){                                                                                        // Si existe el user en db
        await db.disconnect();
        const { _id, name, email, role } = user;                                                       // Retornamos la info del mismo
        return { _id, name, email, role }
    }

    const newUser = new User({ email: oAuthEmail, name: oAuthName, password:'@', role: 'client' });    // Si no existe el user en db creamos un nuevo usuario
    await newUser.save();                                                                              // Lo grabamos en bd          
    await db.disconnect();

    const { _id, name, email, role } = newUser;
    return { _id, name, email, role }                                                                   // Y retornamos la info del mismo
    
}