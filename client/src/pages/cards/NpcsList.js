import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Grid, CircularProgress, Box, 
  Card, CardContent, CardActions, IconButton, Alert, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getCardsByType, deleteCard } from '../../api/cards';
import { useAuth } from '../../context/AuthContext';

const NpcsList = () => {
  const { user, isAdmin, isDungeonMaster } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка NPC
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsData = await getCardsByType('npc');
        setCards(cardsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки NPC:', err);
        setError('Не удалось загрузить NPC. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Обработка удаления карточки
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого NPC?')) {
      try {
        await deleteCard(cardId);
        setCards(cards.filter(card => card.id !== cardId));
      } catch (err) {
        console.error('Ошибка удаления NPC:', err);
        alert('Не удалось удалить NPC. Пожалуйста, попробуйте позже.');
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
          NPC
        </Typography>
        <Button
          component={Link}
          to="/npcs/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Создать NPC
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
            NPC не найдены
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Нажмите "Создать NPC", чтобы добавить первого
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
                  {card.content.npc_type && (
                    <Chip 
                      label={card.content.npc_type} 
                      color="primary" 
                      size="small" 
                      sx={{ mb: 1 }}
                    />
                  )}
                  {card.content.challenge_rating && (
                    <Typography variant="body2" color="text.secondary">
                      Опасность: {card.content.challenge_rating}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Создан: {new Date(card.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    component={Link} 
                    to={`/npcs/${card.id}`} 
                    aria-label="просмотр"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    component={Link} 
                    to={`/npcs/${card.id}/edit`} 
                    aria-label="редактировать"
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                  {/* Только администратор или создатель может удалить NPC */}
                  {(isAdmin || user?.id === card.userId) && (
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

export default NpcsList;