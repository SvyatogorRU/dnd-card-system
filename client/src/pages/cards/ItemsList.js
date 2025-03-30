import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Grid, CircularProgress, Box, 
  Card, CardContent, CardActions, IconButton, Alert, Chip,
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getCardsByType, deleteCard } from '../../api/cards';
import { useAuth } from '../../context/AuthContext';

const ItemsList = () => {
  const { user, isAdmin, isDungeonMaster } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    search: ''
  });

  // Загрузка предметов
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsData = await getCardsByType('item');
        setCards(cardsData);
        setFilteredCards(cardsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки предметов:', err);
        setError('Не удалось загрузить предметы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Фильтрация предметов
  useEffect(() => {
    let result = [...cards];
    
    // Фильтр по типу
    if (filter.type) {
      result = result.filter(card => card.content.item_type === filter.type);
    }
    
    // Фильтр по поисковому запросу
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(card => 
        card.name.toLowerCase().includes(searchLower) || 
        (card.content.item_description && card.content.item_description.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredCards(result);
  }, [filter, cards]);

  // Обработка изменения фильтра
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработка удаления карточки
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот предмет?')) {
      try {
        await deleteCard(cardId);
        setCards(cards.filter(card => card.id !== cardId));
      } catch (err) {
        console.error('Ошибка удаления предмета:', err);
        alert('Не удалось удалить предмет. Пожалуйста, попробуйте позже.');
      }
    }
  };

  // Получение цвета для редкости предмета
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'Обычный': return 'default';
      case 'Необычный': return 'success';
      case 'Редкий': return 'primary';
      case 'Очень редкий': return 'secondary';
      case 'Легендарный': return 'warning';
      case 'Артефакт': return 'error';
      default: return 'default';
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
          Предметы
        </Typography>
        <Button
          component={Link}
          to="/items/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Создать предмет
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Фильтры */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Тип предмета</InputLabel>
          <Select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            label="Тип предмета"
          >
            <MenuItem value="">Все типы</MenuItem>
            <MenuItem value="Оружие">Оружие</MenuItem>
            <MenuItem value="Броня">Броня</MenuItem>
            <MenuItem value="Магический предмет">Магический предмет</MenuItem>
            <MenuItem value="Зелье">Зелье</MenuItem>
            <MenuItem value="Свиток">Свиток</MenuItem>
            <MenuItem value="Расходный материал">Расходный материал</MenuItem>
            <MenuItem value="Артефакт">Артефакт</MenuItem>
            <MenuItem value="Инструмент">Инструмент</MenuItem>
            <MenuItem value="Прочее">Прочее</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          name="search"
          label="Поиск"
          value={filter.search}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      {filteredCards.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Предметы не найдены
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {cards.length === 0 
              ? 'Нажмите "Создать предмет", чтобы добавить первый' 
              : 'Измените параметры фильтрации для отображения предметов'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {card.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    {card.content.item_type && (
                      <Chip 
                        label={card.content.item_type} 
                        size="small" 
                      />
                    )}
                    {card.content.rarity && (
                      <Chip 
                        label={card.content.rarity} 
                        color={getRarityColor(card.content.rarity)} 
                        size="small" 
                      />
                    )}
                    {card.content.attunement && (
                      <Chip 
                        label="Требует настройки" 
                        variant="outlined"
                        size="small" 
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {card.content.item_description || 'Нет описания'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    component={Link} 
                    to={`/items/${card.id}`} 
                    aria-label="просмотр"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    component={Link} 
                    to={`/items/${card.id}/edit`} 
                    aria-label="редактировать"
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                  {/* Только администратор или создатель может удалить предмет */}
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

export default ItemsList;