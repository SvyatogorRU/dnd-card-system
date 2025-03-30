import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          D&D Card System
        </Typography>

        {isAuthenticated ? (
          <>
            <Button component={Link} to="/dashboard" color="inherit">
              Мои карточки
            </Button>
            
            {isAdmin && (
              <Button component={Link} to="/admin" color="inherit">
                Админ-панель
              </Button>
            )}
            
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar 
                src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined} 
                alt={user?.username}
                sx={{ width: 32, height: 32 }}
              >
                {user?.username?.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
                Профиль
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Выйти
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button 
            component={Link} 
            to="/login" 
            color="inherit"
          >
            Войти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;