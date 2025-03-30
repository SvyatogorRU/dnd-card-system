import React from 'react';
import { 
  Container, Box, Typography, Button, 
  Grid, Paper, useTheme 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  return (
    <Box>
      {/* Hero секция */}
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
            {isAuthenticated ? (
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                color="secondary"
                size="large"
              >
                Перейти к моим карточкам
              </Button>
            ) : (
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="secondary"
                size="large"
              >
                Начать работу
              </Button>
            )}
          </Box>
        </Container>
      </Box>

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
            to={isAuthenticated ? "/dashboard" : "/login"}
            variant="contained"
            color="secondary"
            size="large"
          >
            {isAuthenticated ? "Перейти к моим карточкам" : "Войти через Discord"}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;