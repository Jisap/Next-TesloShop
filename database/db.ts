import mongoose from 'mongoose';

/**
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
const mongoConnection = {
    isConnected: 0
}

export const connect = async () => {

    if (mongoConnection.isConnected) {
        console.log('Ya estabamos conectados');    // Si mongo estaba ya conectado no hace nada más.
        return;
    }

    if (mongoose.connections.length > 0) {
        mongoConnection.isConnected = mongoose.connections[0].readyState; // Si mongo esta conectado le da el estado de conexion que tenga

        if (mongoConnection.isConnected === 1) {                          // Si el estado es = 1 usa la conexión anterior 
            console.log('Usando conexión anterior');
            return;
        }

        await mongoose.disconnect();                                      // Si el estado es 2 o 3, cierra la conexión anterior
    }

    await mongoose.connect(process.env.MONGO_URL || '');                  // Conexion a la bd de mongo
    mongoConnection.isConnected = 1;
    console.log('Conectado a MongoDB:', process.env.MONGO_URL);
}

export const disconnect = async () => {

    if (process.env.NODE_ENV === 'development') return;

    if (mongoConnection.isConnected === 0) return;

    await mongoose.disconnect();
    mongoConnection.isConnected = 0;

    console.log('Desconectado de MongoDB');
}