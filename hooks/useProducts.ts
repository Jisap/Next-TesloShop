import useSWR, { SWRConfiguration } from "swr"
import { IProduct } from "../interfaces";

//const fetcher = (...args: [key: string]) => fetch(...args).then(res => res.json())  // fetcher, que no es más que una envoltura del fetch nativo

export const useProducts = (url:string, config:SWRConfiguration = {} ) => {         // config es un objeto que se puede pasar como parámetro a useSWR y es opcional

    const { data, error } = useSWR<IProduct[]>(`/api${ url }`, config );           // Petición a la API usando SWR con el fetcher global en _app.tsx
    
    return{ 
        products: data || [],
        isLoading: !error && !data,
        isError: error
    }
}