import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Button, CircularProgress, 
  Paper, Grid, Divider, Chip, IconButton, Alert 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as LockIcon 
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCard, deleteCard } from '../api/cards';
import { getAllFields } from '../api/admin';
import { useAuth } from '../context/AuthContext';

const CardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isDungeonMaster } = useAuth();
  const [card, setCard] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных карточки и полей
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cardData = await getCard(cardId);
        setCard(cardData);
        
        // Загружаем поля для этого типа карточки
        const fieldsData = await getAllFields(cardData.type);
        setFields(fieldsData);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные карточки. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cardId]);

  // Обработчик удаления карточки
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту карточку?')) {
      try {
        await deleteCard(cardId);
        
        // Перенаправление на соответствующую страницу в зависимости от типа карточки
        if (card.type === 'character') {
          navigate('/characters');
        } else if (card.type === 'npc') {
          navigate('/npcs');
        } else if (card.type === 'item') {
          navigate('/items');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Ошибка удаления карточки:', err);
        setError('Не удалось удалить карточку. Пожалуйста, попробуйте позже.');
      }
    }
  };

  // Функция для получения значения поля
  const getFieldValue = (key) => {
    if (!card || !card.content) return null;
    return card.content[key];
  };

  // Функция для форматирования значения поля
  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined) return '-';

    switch (field.type) {
      case 'checkbox':
        return value ? 'Да' : 'Нет';
      case 'number':
        return value.toString();
      default:
        return value;
    }
  };

  // Проверка прав на редактирование
  const canEdit = () => {
    if (!card) return false;
    if (isAdmin) return true;
    if (isDungeonMaster) {
      // DM может редактировать NPC и предметы, а также карточки персонажей (но не удалять их)
      return true;
    }
    // Обычный пользователь может редактировать только свои карточки
    return user?.id === card.userId;
  };

  // Проверка прав на удаление
  const canDelete = () => {
    if (!card) return false;
    if (isAdmin) return true;
    if (isDungeonMaster && card.type !== 'character') {
      // DM может удалять только NPC и предметы
      return true;
    }
    // Обычный пользователь может удалять только свои карточки
    return user?.id === card.userId;
  };

  // Получение ссылки для редактирования в зависимости от типа карточки
  const getEditLink = () => {
    if (!card) return '/';
    if (card.type === 'character') return `/characters/${cardId}/edit`;
    if (card.type === 'npc') return `/npcs/${cardId}/edit`;
    if (card.type === 'item') return `/items/${cardId}/edit`;
    return `/dashboard`;
  };

  // Получение ссылки для возврата в зависимости от типа карточки
  const getBackLink = () => {
    if (!card) return '/dashboard';
    if (card.type === 'character') return '/characters';
    if (card.type === 'npc') return '/npcs';
    if (card.type === 'item') return '/items';
    return '/dashboard';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          component={Link} 
          to="/dashboard" 
          sx={{ mt: 2 }}
        >
          Вернуться к списку карточек
        </Button>
      </Container>
    );
  }

  if (!card) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Карточка не найдена</Alert>
        <Button 
          variant="contained" 
          component={Link} 
          to="/dashboard" 
          sx={{ mt: 2 }}
        >
          Вернуться к списку карточек
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {card.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                icon={card.public ? <PublicIcon /> : <LockIcon />}
                label={card.public ? 'Публичная' : 'Приватная'}
                color={card.public ? 'success' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Создана: {new Date(card.createdAt).toLocaleDateString()}
              </Typography>
              {card.updatedAt !== card.createdAt && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  Обновлена: {new Date(card.updatedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box>
            {canEdit() && (
              <IconButton 
                component={Link} 
                to={getEditLink()} 
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            )}
            {canDelete() && (
              <IconButton 
                onClick={handleDelete}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Группировка полей по категориям */}
        {Array.from(new Set(fields.map(field => field.category))).map(category => {
          // Фильтрация полей этой категории, у которых есть значения в карточке
          const categoryFields = fields
            .filter(field => field.category === category)
            .filter(field => getFieldValue(field.key) !== null || field.required)
            .sort((a, b) => a.order - b.order);

          if (categoryFields.length === 0) return null;

          return (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {category}
              </Typography>
              
              <Grid container spacing={2}>
                {categoryFields.map(field => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {field.name}
                      </Typography>
                      <Typography variant="body1">
                        {formatFieldValue(field, getFieldValue(field.key))}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}

        <Box sx={{ mt: 4 }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to={getBackLink()}
          >
            Вернуться к списку
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CardDetail;