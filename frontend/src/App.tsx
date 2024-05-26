import { Link, Route, Routes } from 'react-router-dom';
import Attributes from './components/Attributes';
import Home from './components/Home';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AttributeDetail from './components/AttributeDetail';
import {
    AppBar,
    Container,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Button,
    Tooltip,
    Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import AdbIcon from '@mui/icons-material/Adb';

const queryClient = new QueryClient();

function App() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    return (
        <QueryClientProvider client={queryClient}>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left'
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left'
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' }
                                }}
                            >
                                <MenuItem component={Link} to={'/'} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">Homepage</Typography>
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    to={'/attributes'}
                                    onClick={handleCloseNavMenu}
                                >
                                    <Typography textAlign="center">Attributes</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Button
                                onClick={handleCloseNavMenu}
                                component={Link}
                                to={'/'}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                Homepage
                            </Button>
                            <Button
                                onClick={handleCloseNavMenu}
                                component={Link}
                                to={'/attributes'}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                Attributes
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/attributes" element={<Attributes />} />
                <Route path="/attributes/:id" element={<AttributeDetail />} />
            </Routes>
        </QueryClientProvider>
    );
}

export default App;
