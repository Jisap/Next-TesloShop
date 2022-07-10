import { useContext, useState } from "react"
import { AuthContext, UiContext } from "../../context";
import { useRouter } from "next/router";
import { Box, Divider, Drawer, IconButton, Input, InputAdornment, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import { AccountCircleOutlined, AdminPanelSettings, CategoryOutlined, ConfirmationNumberOutlined, DashboardOutlined, EscalatorWarningOutlined, FemaleOutlined, LoginOutlined, MaleOutlined, SearchOutlined, VpnKeyOutlined } from "@mui/icons-material"


export const SideMenu = () => {

    const router = useRouter();
    const { isMenuOpen, toggleSideMenu } = useContext( UiContext );
    const { user, isLoogedIn, logout } = useContext( AuthContext );

    const navigateTo = ( url: string ) => {
        toggleSideMenu();                   // Cambia isMenuOpen           
        router.push( url);                  // Redirige a la url
    }

    const [searchTerm, setSearchTerm] = useState('');           // Estado que recibe el valor de la busqueda

    const onSearchTerm = () => {
        if( searchTerm.trim().length === 0 ) return;            // Si la busqueda no tiene nada return
        navigateTo( `/search/${searchTerm}` );                  // Si contiene algo redirige a la url de busqueda con el searchTerm
        
    }

    
    return (
        <Drawer
            open={ isMenuOpen }
            anchor='right'
            sx={{ backdropFilter: 'blur(4px)', transition: 'all 0.5s ease-out' }}
            onClose={ toggleSideMenu }
        >
            <Box sx={{ width: 250, paddingTop: 5 }}>

                <List>

                    <ListItem>
                        <Input
                            autoFocus
                            value={ searchTerm }
                            onChange={ (e) => setSearchTerm(e.target.value) }
                            onKeyPress={ (e) => e.key === 'Enter' ? onSearchTerm() : null }
                            type='text'
                            placeholder="Buscar..."
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={ onSearchTerm }
                                    >
                                        <SearchOutlined />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </ListItem>

                    {
                        isLoogedIn &&(
                            <>
                                <ListItem button>
                                    <ListItemIcon>
                                        <AccountCircleOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Perfil'} />
                                </ListItem>

                                <ListItem button onClick={() => navigateTo('/orders/history')}>
                                    <ListItemIcon>
                                        <ConfirmationNumberOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Mis Ordenes'} />
                                </ListItem>
                            </>
                        )
                    }


                    <ListItem 
                        button 
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/men')}
                    >
                        <ListItemIcon>
                            <MaleOutlined />
                        </ListItemIcon>
                        <ListItemText primary={'Hombres'} />
                    </ListItem>

                    <ListItem 
                        button 
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/women')}
                    >
                        <ListItemIcon>
                            <FemaleOutlined />
                        </ListItemIcon>
                        <ListItemText primary={'Mujeres'} />
                    </ListItem>

                    <ListItem 
                        button 
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/kid')}
                    >
                        <ListItemIcon>
                            <EscalatorWarningOutlined />
                        </ListItemIcon>
                        <ListItemText primary={'Niños'} />
                    </ListItem>

                    {
                        isLoogedIn ? (
                            <ListItem 
                                button                  // Si el usuario esta logeado y quiere salir -> logout
                                onClick={logout}        // Borrado de cookies y reseteo de estado del user
                            >
                                <ListItemIcon>
                                    <LoginOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Salir'} />
                            </ListItem>
                        ) : (
                            <ListItem 
                                    button                                                          // Si el usuario quiere ingresar redirección a la url de login 
                                onClick={ () => navigateTo(`/auth/login?p=${ router.asPath }`)}     // con el query de la útlima página visitada
                            >
                                <ListItemIcon>
                                    <VpnKeyOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Ingresar'} />
                            </ListItem>

                        )
                    }



                    {/* Admin */}
                    {
                        user?.role === 'admin' && (
                            <>
                                <Divider />
                                <ListSubheader>Admin Panel</ListSubheader>

                                <ListItem 
                                    button
                                    onClick={() => navigateTo('/admin')}
                                >
                                    <ListItemIcon>
                                        <DashboardOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Dashboard'} />
                                </ListItem>

                                <ListItem
                                    button
                                    onClick={() => navigateTo('/admin/products')}
                                >
                                    <ListItemIcon>
                                        <CategoryOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Productos'} />
                                </ListItem>

                                <ListItem 
                                    button
                                    onClick={() => navigateTo('/admin/orders')}    
                                >
                                    <ListItemIcon>
                                        <ConfirmationNumberOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Ordenes'} />
                                </ListItem>

                                <ListItem
                                    button
                                    onClick={() => navigateTo('/admin/users')}    
                                >
                                    <ListItemIcon>
                                        <AdminPanelSettings />
                                    </ListItemIcon>
                                    <ListItemText primary={'Usuarios'} />
                                </ListItem>
                            </>
                        ) 
                    }
                </List>
            </Box>
        </Drawer>
    )
}