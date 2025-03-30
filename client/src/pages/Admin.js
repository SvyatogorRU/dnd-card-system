import React from 'react';
import { 
  Container, Typography, Grid, Paper, Box, 
  List, ListItem, ListItemIcon, ListItemText, 
  ListItemButton, Divider 
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Badge as BadgeIcon, 
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ViewList as ViewListIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { isAdmin } = useAuth();

  // Если не администратор, не показываем страницу
  if (!isAdmin) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Доступ запрещен
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            У вас нет прав для доступа к этому разделу.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Административная панель
      </Typography>
      
      <Grid container spacing={3}>
        {/* Меню слева */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List component="nav">
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin">
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Обзор" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/users">
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Пользователи" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/roles">
                  <ListItemIcon>
                    <BadgeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Роли" />
                </ListItemButton>
              </ListItem>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/fields">
                  <ListItemIcon>
                    <ViewListIcon />
                  </ListItemIcon>
                  <ListItemText primary="Поля карточек" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/admin/settings">
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Настройки" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Основное содержимое */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>
              Обзор системы
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'primary.light',
                    color: 'white'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">Пользователи</Typography>
                  <Typography variant="body2">Управление пользователями и ролями</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Link to="/admin/users" style={{ color: 'white', textDecoration: 'underline' }}>
                      Перейти
                    </Link>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'secondary.light',
                    color: 'white'
                  }}
                >
                  <ViewListIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">Поля карточек</Typography>
                  <Typography variant="body2">Настройка структуры карточек</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Link to="/admin/fields" style={{ color: 'white', textDecoration: 'underline' }}>
                      Перейти
                    </Link>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'info.light',
                    color: 'white'
                  }}
                >
                  <StorageIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">База данных</Typography>
                  <Typography variant="body2">Системная информация</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Link to="/admin/database" style={{ color: 'white', textDecoration: 'underline' }}>
                      Перейти
                    </Link>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="body1" sx={{ mt: 4 }}>
              Используйте административную панель для настройки и управления системой карточек D&D.
              Здесь вы можете управлять пользователями, ролями, структурой карточек и другими аспектами системы.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;