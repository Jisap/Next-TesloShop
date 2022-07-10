import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import { PeopleOutline } from '@mui/icons-material'
import { Grid, MenuItem, Select } from '@mui/material'
import useSWR from 'swr'
import { IUser } from '../../interfaces'
import { tesloApi } from '../../api'

const UsersPage = () => {

  const { data, error } = useSWR<IUser[]>('/api/admin/users');  // Obtención de todos los usuarios

  const [users, setUsers] = useState<IUser[]>([]);              // Estado de los usuarios

  useEffect(() => {         
    if(data){               // Si hay datos ( usuarios )
        setUsers(data);     // Se establece el estado de los usuarios
    }
  }, [data]);

  if(!data && !error) return <></>

  const onRoleUpdated = async( userId: String, newRole: string ) => {

    const previosUsers = users.map( user => ({ ...user }));
    const updatedUsers = users.map( user => ({          // Se recorre el estado de los usuarios
        ...user,
        role: userId === user._id ? newRole : user.role // si el id del usuario que cambia = usuario iterado, se cambia el role, sino lo mantengo.
    }))

    setUsers(updatedUsers); // Se establece el estado de los usuarios -> se actualiza el valor de las rows y se redibuja el componente

    try {
        await tesloApi.put(`/admin/users/`, { userId, role: newRole }); // Se actualiza el role en la base de datos
    } catch (error) {
        setUsers( previosUsers );                                       // Si falla, se restaura el estado anterior
        console.log(error);
        alert('No se pudo actualizar el role del usuario')
    }
  }

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Correo', width: 250 },
    { field: 'name', headerName: 'Nombre completo', width: 300 },
    { 
        field: 'role', 
        headerName: 'Rol', 
        width: 300,
        renderCell: ({ row }: GridValueGetterParams) => { 
            return (
                <Select
                    value={row.role}
                    label='Rol'
                    onChange={ ( {target} ) => onRoleUpdated( row.id, target.value ) } // Se envía a onRoleUpdated el id del usuario y el nuevo role
                    sx={{ width: '300px' }}
                >
                    <MenuItem value='admin'> Admin </MenuItem>
                    <MenuItem value='client'> Client </MenuItem>
                    <MenuItem value='super-user'> Super User </MenuItem>
                    <MenuItem value='SEO'> SEO </MenuItem>
                </Select>
            )
        }
    },
  ];

  const rows = users.map( user => ({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  }))



  return (
    <AdminLayout 
        title={'Usuarios'} 
        subTitle={'Mantenimiento de usuarios'}        
        icon={<PeopleOutline />}
    >
          <Grid container className='fadeIn'>
              <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                  <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[10]}
                  />
              </Grid>
          </Grid>


    </AdminLayout>
  )
}

export default UsersPage