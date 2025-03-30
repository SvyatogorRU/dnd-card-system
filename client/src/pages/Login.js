import React, { useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDiscordAuthUrl, loginWithDiscord } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Перенаправление на главную страницу после успешной авторизации
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Изменено с /dashboard на /
    }
  }, [isAuthenticated, navigate]);

  // Обработка кода авторизации от Discord
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (code) {
      const handleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
          const { user } = await loginWithDiscord(code);
          setUser(user);
          navigate('/'); // Изменено с /dashboard на /
        } catch (err) {
          console.error('Ошибка авторизации:', err);
          setError('Не удалось авторизоваться через Discord. Пожалуйста, попробуйте снова.');
        } finally {
          setLoading(false);
        }
      };

      handleAuth();
    }
  }, [location, navigate, setUser]);

  // Перенаправление на страницу авторизации Discord
  const handleDiscordLogin = () => {
    window.location.href = getDiscordAuthUrl();
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Вход в систему
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Typography color="error" align="center" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              
              <Button
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  py: 1.5,
                  backgroundColor: '#5865F2',
                  '&:hover': {
                    backgroundColor: '#4752C4',
                  },
                }}
                onClick={handleDiscordLogin}
                disabled={loading}
              >
                Войти через Discord
              </Button>
              
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                Для входа в систему необходима учетная запись Discord
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;