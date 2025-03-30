import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, CircularProgress, Box, Card, CardContent, CardActions, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getUserCards, deleteCard } from '../api/cards';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdmin, isDungeonMaster, hasRole } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка карточек пользователя
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsData = await getUserCards();
        setCards(cardsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки карточек:', err);
        setError('Не удалось загрузить карточки. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Обработка удаления карточки
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту карточку?')) {
      try {
        await deleteCard(cardId);
        setCards(cards.filter(card => card.id !== cardId));
      } catch (err) {
        console.error('Ошибка удаления карточки:', err);
        alert('Не удалось удалить карточку. Пожалуйста, попробуйте позже.');
      }
    }
  };

  // Проверка прав на создание карточки
  const canCreateCard = () => {
    return isAdmin || isDungeonMaster || hasRole('Card Creator');
  };

  // Проверка прав на удаление карточки
  const canDeleteCard = (card) => {
    // Администратор может удалять любые карточки
    if (isAdmin) return true;
    
    // Dungeon Master может удалять только NPC и предметы, но не персонажей
    if (isDungeonMaster) {
      return card.type !== 'character' || card.userId === user?.id;
    }
    
    // Пользователь может удалять только свои карточки
    return card.userId === user?.id;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Мои карточки
        </Typography>
        {canCreateCard() && (
          <Button
            component={Link}
            to="/characters/new"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Создать карточку
          </Button>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {cards.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет карточек
          </Typography>
          {canCreateCard() && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Нажмите "Создать карточку", чтобы начать
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {card.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Тип: {card.type === 'character' ? 'Персонаж' : card.type === 'npc' ? 'NPC' : 'Предмет'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Создано: {new Date(card.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    component={Link} 
                    to={`/${card.type === 'character' ? 'characters' : card.type === 'npc' ? 'npcs' : 'items'}/${card.id}`} 
                    aria-label="просмотр"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    component={Link} 
                    to={`/${card.type === 'character' ? 'characters' : card.type === 'npc' ? 'npcs' : 'items'}/${card.id}/edit`} 
                    aria-label="редактировать"
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                  {canDeleteCard(card) && (
                    <IconButton 
                      onClick={() => handleDeleteCard(card.id)} 
                      aria-label="удалить"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;