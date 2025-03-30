import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Button, CircularProgress, 
  Paper, Grid, Divider, Chip, IconButton 
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
  const { user, isAdmin } = useAuth();
  const [card, setCard] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных карточки и полей
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardData, fieldsData] = await Promise.all([
          getCard(cardId),
          getAllFields()
        ]);
        setCard(cardData);
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
        navigate('/dashboard');
      } catch (err) {
        console.error('Ошибка удаления карточки:', err);
        setError('Не удалось удалить карточку. Пожалуйста, попробуйте позже.');
      }
    }
  };

  // Функция для получения значения поля
  const getFieldValue = (fieldId) => {
    if (!card || !card.fields) return null;
    const fieldEntry = card.fields.find(field => field.fieldId === fieldId);
    return fieldEntry ? fieldEntry.value : null;
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
  const canEdit = card && (isAdmin || (user && user._id === card.userId));

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
        <Typography color="error">{error}</Typography>
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
        <Typography variant="h5">Карточка не найдена</Typography>
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
          
          {canEdit && (
            <Box>
              <IconButton 
                component={Link} 
                to={`/cards/${cardId}/edit`} 
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={handleDelete}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Группировка полей по категориям */}
        {Array.from(new Set(fields.map(field => field.category))).map(category => {
          // Фильтрация полей этой категории, у которых есть значения в карточке
          const categoryFields = fields
            .filter(field => field.category === category)
            .filter(field => getFieldValue(field._id) !== null || field.required)
            .sort((a, b) => a.order - b.order);

          if (categoryFields.length === 0) return null;

          return (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {category}
              </Typography>
              
              <Grid container spacing={2}>
                {categoryFields.map(field => (
                  <Grid item xs={12} sm={6} key={field._id}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {field.name}
                      </Typography>
                      <Typography variant="body1">
                        {formatFieldValue(field, getFieldValue(field._id))}
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
            to="/dashboard"
          >
            Вернуться к списку карточек
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CardDetail;