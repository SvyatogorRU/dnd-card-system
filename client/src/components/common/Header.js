import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Box, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, isDungeonMaster, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Получаем текущий URL
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const isLoginPage = location.pathname === '/login'; // Проверяем, находимся ли на странице логина

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setMenuAnchorEl(null);
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
            <Button color="inherit" onClick={handleNavMenuOpen}>
              Карточки
            </Button>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleNavMenuClose}
            >
              <MenuItem 
                onClick={() => { handleNavMenuClose(); navigate('/characters'); }}
              >
                Персонажи
              </MenuItem>
              
              {(isDungeonMaster || hasRole('Card Creator') || isAdmin) && (
                <>
                  <MenuItem 
                    onClick={() => { handleNavMenuClose(); navigate('/npcs'); }}
                  >
                    NPC
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleNavMenuClose(); navigate('/items'); }}
                  >
                    Предметы
                  </MenuItem>
                </>
              )}
            </Menu>
            
            <Button component={Link} to="/groups" color="inherit">
              Группы
            </Button>
            
            {isAdmin && (
              <Button component={Link} to="/admin" color="inherit">
                Администрирование
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
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1">{user?.username}</Typography>
                {user?.roles && (
                  <Typography variant="body2" color="text.secondary">
                    {user.roles.map(role => role.name).join(', ')}
                  </Typography>
                )}
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                Профиль
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
                Мои карточки
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Выйти
              </MenuItem>
            </Menu>
          </>
        ) : (
          // Показываем кнопку "Войти" только если это не страница логина
          !isLoginPage && (
            <Button 
              component={Link} 
              to="/login" 
              color="inherit"
            >
              Войти
            </Button>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;