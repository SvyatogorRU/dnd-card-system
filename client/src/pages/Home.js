import React from 'react';
import { 
  Container, Box, Typography, Button, 
  Grid, Paper, useTheme, Card, CardContent, 
  Divider, Avatar, List, ListItem, ListItemIcon, 
  ListItemText, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Dashboard as DashboardIcon, 
  Person as PersonIcon,
  Group as GroupIcon,
  ViewList as ViewListIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';

const Home = () => {
  const { isAuthenticated, user, isAdmin, isDungeonMaster, hasRole } = useAuth();
  const theme = useTheme();

  return (
    <Box>
      {/* Hero секция - показываем только для неавторизованных пользователей */}
      {!isAuthenticated && (
        <Box 
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            pt: 8,
            pb: 6
          }}
        >
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              D&D Card System
            </Typography>
            <Typography
              variant="h5"
              align="center"
              paragraph
              sx={{ mb: 4 }}
            >
              Создавайте, управляйте и делитесь карточками для ваших кампаний Dungeons & Dragons
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="secondary"
                size="large"
              >
                Начать работу
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* Панель управления для авторизованных пользователей */}
      {isAuthenticated && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Добро пожаловать, {user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Здесь вы найдете все необходимое для управления своими D&D карточками и группами.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {/* Информация о пользователе */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined}
                      alt={user?.username}
                      sx={{ width: 80, height: 80, mb: 2 }}
                    >
                      {user?.username?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {user?.username}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                      {user?.isAdmin && (
                        <Chip color="error" label="Администратор" size="small" />
                      )}
                      {user?.roles?.map(role => (
                        <Chip key={role.id} label={role.name} size="small" variant="outlined" />
                      ))}
                      {(!user?.roles || user?.roles.length === 0) && (
                        <Chip label="Нет ролей" size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Быстрые ссылки
                  </Typography>
                  
                  <List dense>
                    <ListItem button component={Link} to="/profile">
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Мой профиль" />
                    </ListItem>
                    <ListItem button component={Link} to="/dashboard">
                      <ListItemIcon>
                        <DashboardIcon />
                      </ListItemIcon>
                      <ListItemText primary="Мои карточки" />
                    </ListItem>
                    <ListItem button component={Link} to="/groups">
                      <ListItemIcon>
                        <GroupIcon />
                      </ListItemIcon>
                      <ListItemText primary="Мои группы" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Доступные разделы */}
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                Доступные разделы
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="h6" align="center" gutterBottom>
                        Персонажи
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        Управление вашими персонажами, просмотр характеристик и инвентаря.
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button component={Link} to="/characters" variant="outlined" size="small">
                          Перейти
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Секция для NPC (только для DM и админов) */}
                {(isDungeonMaster || isAdmin || hasRole('Card Creator')) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <ViewListIcon />
                          </Avatar>
                        </Box>
                        <Typography variant="h6" align="center" gutterBottom>
                          NPC
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Создание и управление неигровыми персонажами для ваших кампаний.
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <Button component={Link} to="/npcs" variant="outlined" size="small">
                            Перейти
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {/* Секция для предметов (только для DM и админов) */}
                {(isDungeonMaster || isAdmin || hasRole('Card Creator')) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <GavelIcon />
                          </Avatar>
                        </Box>
                        <Typography variant="h6" align="center" gutterBottom>
                          Предметы
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Создание и управление предметами, оружием, артефактами и магическими вещами.
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <Button component={Link} to="/items" variant="outlined" size="small">
                            Перейти
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <GroupIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="h6" align="center" gutterBottom>
                        Группы
                      </Typography>
                      <Typography variant="body2" align="center" color="text.secondary">
                        Управление группами, просмотр банка группы и участников.
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button component={Link} to="/groups" variant="outlined" size="small">
                          Перейти
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Секция для администрирования (только для админов) */}
                {isAdmin && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <DashboardIcon />
                          </Avatar>
                        </Box>
                        <Typography variant="h6" align="center" gutterBottom>
                          Администрирование
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Управление пользователями, ролями и настройка системы.
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <Button component={Link} to="/admin" variant="outlined" size="small">
                            Перейти
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
              
              {/* Информационный блок для новых пользователей без ролей */}
              {(!user?.roles || user?.roles.length === 0) && (
                <Card sx={{ mt: 4, bgcolor: 'info.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Информация для новых пользователей
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Вы вошли в систему, но у вас пока нет определенных ролей. 
                      Для получения доступа к расширенному функционалу, обратитесь к администратору или Dungeon Master.
                    </Typography>
                    <Typography variant="body2">
                      Пока вы можете просматривать основную информацию и ваш профиль.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
          
          {/* Последние обновления или актуальная информация */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Важная информация
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" paragraph>
                D&D Card System - это удобная платформа для управления персонажами, NPC и предметами для кампаний Dungeons & Dragons.
                Система разделена на несколько основных разделов:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Персонажи" 
                    secondary="Создавайте и управляйте своими игровыми персонажами, отслеживайте их характеристики, навыки и инвентарь." 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Группы" 
                    secondary="Объединяйтесь в игровые группы, используйте банк группы и управляйте совместными ресурсами." 
                  />
                </ListItem>
                {(isDungeonMaster || isAdmin) && (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="NPC и Предметы" 
                        secondary="Для Dungeon Master: создавайте и управляйте NPC и предметами, которые можно использовать в ваших кампаниях." 
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Container>
      )}

      {/* Секции для неавторизованных пользователей */}
      {!isAuthenticated && (
        <>
          {/* Раздел с возможностями */}
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ mb: 6 }}
            >
              Возможности системы
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="h5" component="h2" gutterBottom>
                    Персонажи
                  </Typography>
                  <Typography paragraph sx={{ flexGrow: 1 }}>
                    Создавайте полноценные карточки персонажей с настраиваемыми полями. 
                    Отслеживайте характеристики, навыки, снаряжение и историю.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="h5" component="h2" gutterBottom>
                    НПС и Монстры
                  </Typography>
                  <Typography paragraph sx={{ flexGrow: 1 }}>
                    Организуйте библиотеку неигровых персонажей и монстров для ваших кампаний.
                    Быстрый доступ к важной информации во время игры.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="h5" component="h2" gutterBottom>
                    Предметы и Заклинания
                  </Typography>
                  <Typography paragraph sx={{ flexGrow: 1 }}>
                    Храните информацию о магических предметах, артефактах и заклинаниях.
                    Делитесь с другими игроками своей коллекцией.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>

          {/* Раздел "Как это работает" */}
          <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
            <Container maxWidth="md">
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ mb: 4 }}
              >
                Как это работает
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      1. Войдите через Discord
                    </Typography>
                    <Typography paragraph>
                      Простая и безопасная авторизация через ваш аккаунт Discord. 
                      Не нужно создавать еще один аккаунт.
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>
                      2. Создавайте карточки
                    </Typography>
                    <Typography paragraph>
                      Выбирайте из готовых шаблонов или создавайте свои собственные 
                      карточки с нужными полями.
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>
                      3. Делитесь с другими
                    </Typography>
                    <Typography paragraph>
                      Делайте карточки публичными, чтобы поделиться с другими игроками 
                      и мастерами.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      bgcolor: 'primary.light',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    <Typography variant="h5">
                      Иллюстрация процесса
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Призыв к действию */}
          <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 6 }}>
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Начните использовать D&D Card System прямо сейчас!
              </Typography>
              <Typography paragraph sx={{ mb: 4 }}>
                Создайте свою первую карточку и улучшите опыт ваших игровых сессий
              </Typography>
              
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="secondary"
                size="large"
              >
                Войти через Discord
              </Button>
            </Container>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Home;