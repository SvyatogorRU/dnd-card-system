import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Grid, CircularProgress, Box, 
  Card, CardContent, CardActions, IconButton, Alert 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getCardsByType, deleteCard } from '../../api/cards';
import { useAuth } from '../../context/AuthContext';

const CharactersList = () => {
  const { user, isAdmin, isDungeonMaster } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка персонажей
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsData = await getCardsByType('character');
        setCards(cardsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки персонажей:', err);
        setError('Не удалось загрузить персонажей. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Обработка удаления карточки
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого персонажа?')) {
      try {
        await deleteCard(cardId);
        setCards(cards.filter(card => card.id !== cardId));
      } catch (err) {
        console.error('Ошибка удаления персонажа:', err);
        alert('Не удалось удалить персонажа. Пожалуйста, попробуйте позже.');
      }
    }
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
          Персонажи
        </Typography>
        <Button
          component={Link}
          to="/characters/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Создать персонажа
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cards.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет персонажей
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Нажмите "Создать персонажа", чтобы начать
          </Typography>
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
                    {card.content.race && card.content.class ? 
                      `${card.content.race}, ${card.content.class}` : 
                      'Нет данных о расе и классе'}
                  </Typography>
                  {card.content.level && (
                    <Typography variant="body2" color="text.secondary">
                      Уровень: {card.content.level}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Создан: {new Date(card.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    component={Link} 
                    to={`/characters/${card.id}`} 
                    aria-label="просмотр"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {(isAdmin || isDungeonMaster || user?.id === card.userId) && (
                    <>
                      <IconButton 
                        component={Link} 
                        to={`/characters/${card.id}/edit`} 
                        aria-label="редактировать"
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                      {(isAdmin || user?.id === card.userId) && (
                        <IconButton 
                          onClick={() => handleDeleteCard(card.id)} 
                          aria-label="удалить"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </>
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

export default CharactersList;