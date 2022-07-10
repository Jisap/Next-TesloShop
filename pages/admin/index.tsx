import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import { AccessTimeOutlined, AttachmentOutlined, AttachMoneyOutlined, CancelPresentationOutlined, CategoryOutlined, CreditCardOffOutlined, DashboardOutlined, GroupOutlined, ProductionQuantityLimitsOutlined } from '@mui/icons-material'
import { Grid, Typography } from '@mui/material'
import { AdminLayout } from '../../components/layouts'
import { SummaryTile } from '../../components/admin'
import { DashboardSummaryResponse } from '../../interfaces'

const DashboardPage = () => {

  const { data, error } = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', {
    refreshInterval: 30 * 1000 // Cada 30 segundos se hace la petición
  });

  const [refreshIn, setRefreshIn] = useState(30);
  useEffect(() => {
    
    const interval = setInterval(() => {                               // Cada 1 segundo se ejecuta el código  
      console.log('Tick');                                             // Mensaje 
      setRefreshIn( refreshIn => refreshIn > 0 ? refreshIn - 1 : 30 ); // Actualiza el contador
    }, 1000);                                                          // Cada 1 segundo 
    
    return () => {
      clearInterval(interval); // Se limpia el intervalo cuando se sale de la página
    }
  }, [])
  

  if( !error && !data ){
    return <></>
  }

  if( error ){
    console.log(error);
    return <Typography>Error al cargar la información</Typography>
  }

  const { 
    numberOfOrders,
    paidOrders,
    numberOfClients,
    numberOfProducts,
    productsWithNoInventory,
    lowInventory,
    notPaidOrders,
  } = data!;

  return (
    <AdminLayout 
        title='Dashboard' 
        subTitle='Estadisticas generales'
        icon={ <DashboardOutlined /> }
        >
            <Grid container spacing={2}>
              <SummaryTile
                title={ numberOfOrders }
                subTitle="Ordenes totales"
                icon={ <CreditCardOffOutlined color="secondary" sx={{ fontSize:40 }}/> }
              />
              <SummaryTile
                  title={ paidOrders }
                  subTitle="Ordenes pagadas"
                  icon={<AttachMoneyOutlined color="success" sx={{ fontSize: 40 }} />}
              />
              <SummaryTile
                  title={ notPaidOrders }
                  subTitle="Ordenes pendientes"
                  icon={<CreditCardOffOutlined color="error" sx={{ fontSize: 40 }} />}
              />
              <SummaryTile
                  title={ numberOfClients }
                  subTitle="Clientes"
                  icon={<GroupOutlined color="primary" sx={{ fontSize: 40 }} />}
              />
              <SummaryTile
                  title={ numberOfProducts }
                  subTitle="Productos"
                  icon={<CategoryOutlined color="warning" sx={{ fontSize: 40 }} />}
              />
              <SummaryTile
                  title={ productsWithNoInventory }
                  subTitle="Sin existencias"
                  icon={<CancelPresentationOutlined color="error" sx={{ fontSize: 40 }} />}
              />
              <SummaryTile
                  title={ lowInventory }
                  subTitle="Bajo inventario"
                  icon={<ProductionQuantityLimitsOutlined  color="warning" sx={{ fontSize: 40 }} />}
              />
              <SummaryTile
                  title={ refreshIn }
                  subTitle="Actualizacion en:"
                  icon={<AccessTimeOutlined color="secondary" sx={{ fontSize: 40 }} />}
              />  

            </Grid>
    </AdminLayout>
  )
}

export default DashboardPage