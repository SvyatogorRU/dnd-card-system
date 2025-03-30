import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, List, ListItem, ListItemText, 
  ListItemSecondaryAction, Divider, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel, Checkbox,
  Chip, CircularProgress, Alert, Card, CardContent, Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { getCardItems, addItemToCard, updateCardItem, removeItemFromCard } from '../../api/cardItems';
import { getCardsByType } from '../../api/cards';
import { useAuth } from '../../context/AuthContext';

const CardItems = ({ card, isEditable }) => {
  const { isAdmin, isDungeonMaster } = useAuth();
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formValues, setFormValues] = useState({
    itemId: '',
    quantity: 1,
    equipped: false,
    notes: ''
  });

  // Загрузка предметов карточки
  useEffect(() => {
    if (!card) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const cardItemsData = await getCardItems(card.id);
        setItems(cardItemsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки предметов:', err);
        setError('Не удалось загрузить предметы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [card]);

  // Загрузка доступных предметов (только для модального окна добавления)
  const loadAvailableItems = async () => {
    try {
      const allItems = await getCardsByType('item');
      // Фильтрация: исключаем предметы, которые уже есть в карточке
      const alreadyAddedIds = items.map(item => item.id);
      const availableItems = allItems.filter(item => !alreadyAddedIds.includes(item.id));
      setAvailableItems(availableItems);
    } catch (err) {
      console.error('Ошибка загрузки доступных предметов:', err);
      setError('Не удалось загрузить доступные предметы.');
    }
  };

  // Открытие диалога добавления предмета
  const handleOpenAddDialog = () => {
    loadAvailableItems();
    setFormValues({
      itemId: '',
      quantity: 1,
      equipped: false,
      notes: ''
    });
    setDialogOpen(true);
  };

  // Открытие диалога редактирования предмета
  const handleOpenEditDialog = (item) => {
    if (!item || !item.CardItem) {
      console.error('Ошибка: item или item.CardItem отсутствует', item);
      return;
    }
    
    setSelectedItem(item);
    setFormValues({
      itemId: item.id,
      quantity: item.CardItem.quantity || 1,
      equipped: item.CardItem.equipped || false,
      notes: item.CardItem.notes || ''
    });
    setEditDialogOpen(true);
  };

  // Закрытие всех диалогов
  const handleCloseDialogs = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedItem(null);
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'equipped') {
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'quantity') {
      const quantity = parseInt(value) || 1;
      setFormValues(prev => ({
        ...prev,
        [name]: Math.max(1, quantity) // Минимум 1
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Добавление предмета к карточке
  const handleAddItem = async () => {
    if (!formValues.itemId) {
      setError('Необходимо выбрать предмет');
      return;
    }

    try {
      setUpdating(true);
      await addItemToCard(card.id, {
        itemId: formValues.itemId,
        quantity: formValues.quantity,
        equipped: formValues.equipped,
        notes: formValues.notes
      });

      // Перезагрузка предметов
      const updatedItems = await getCardItems(card.id);
      setItems(updatedItems);
      
      handleCloseDialogs();
      setError(null);
    } catch (err) {
      console.error('Ошибка добавления предмета:', err);
      setError('Не удалось добавить предмет. Пожалуйста, попробуйте позже.');
    } finally {
      setUpdating(false);
    }
  };

  // Обновление предмета в карточке
  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      setUpdating(true);
      await updateCardItem(card.id, selectedItem.id, {
        quantity: formValues.quantity,
        equipped: formValues.equipped,
        notes: formValues.notes
      });

      // Перезагрузка предметов
      const updatedItems = await getCardItems(card.id);
      setItems(updatedItems);
      
      handleCloseDialogs();
      setError(null);
    } catch (err) {
      console.error('Ошибка обновления предмета:', err);
      setError('Не удалось обновить предмет. Пожалуйста, попробуйте позже.');
    } finally {
      setUpdating(false);
    }
  };

  // Удаление предмета из карточки
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет из карточки?')) {
      return;
    }

    try {
      setUpdating(true);
      await removeItemFromCard(card.id, itemId);

      // Обновляем список предметов локально
      setItems(items.filter(item => item.id !== itemId));
      
      setError(null);
    } catch (err) {
      console.error('Ошибка удаления предмета:', err);
      setError('Не удалось удалить предмет. Пожалуйста, попробуйте позже.');
    } finally {
      setUpdating(false);
    }
  };

  // Проверка прав на редактирование
  const canEdit = () => {
    if (!card) return false;
    if (isAdmin) return true;
    if (isDungeonMaster) return true;
    // Владелец карточки может редактировать свои предметы
    return card.userId === (JSON.parse(localStorage.getItem('user'))?.id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если в карточке нет предметов, и пользователь не может их добавлять, не показываем секцию
  if (items.length === 0 && !canEdit()) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ mr: 1 }} /> Предметы {items.length > 0 && `(${items.length})`}
        </Typography>
        {canEdit() && isEditable && (
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            size="small"
          >
            Добавить предмет
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          У карточки пока нет предметов
          {canEdit() && isEditable && (
            <Box sx={{ mt: 1 }}>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Добавить
              </Button>
            </Box>
          )}
        </Typography>
      ) : (
        <List sx={{ width: '100%' }}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {item.name}
                      </Typography>
                      {item.CardItem && item.CardItem.quantity > 1 && (
                        <Chip 
                          label={`x${item.CardItem.quantity}`} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                      {item.CardItem && item.CardItem.equipped && (
                        <Chip 
                          label="Экипировано" 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      {item.content && item.content.item_type && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          Тип: {item.content.item_type}
                          {item.content.rarity && ` | Редкость: ${item.content.rarity}`}
                        </Typography>
                      )}
                      {item.CardItem && item.CardItem.notes && (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {item.CardItem.notes}
                        </Typography>
                      )}
                    </>
                  }
                />
                {canEdit() && isEditable && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="edit" 
                      onClick={() => handleOpenEditDialog(item)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleRemoveItem(item.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Диалог добавления предмета */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Добавить предмет</DialogTitle>
        <DialogContent dividers>
          {availableItems.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ py: 2 }}>
              Нет доступных предметов для добавления
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Выберите предмет:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {availableItems.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card 
                      variant={formValues.itemId === item.id ? "elevation" : "outlined"}
                      elevation={3}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: formValues.itemId === item.id ? 'primary.light' : 'background.paper',
                        color: formValues.itemId === item.id ? 'white' : 'inherit',
                      }}
                      onClick={() => setFormValues(prev => ({ ...prev, itemId: item.id }))}
                    >
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        {item.content && item.content.item_type && (
                          <Typography variant="body2">
                            Тип: {item.content.item_type}
                          </Typography>
                        )}
                        {item.content && item.content.rarity && (
                          <Typography variant="body2">
                            Редкость: {item.content.rarity}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Количество"
                  name="quantity"
                  type="number"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.equipped}
                      onChange={handleInputChange}
                      name="equipped"
                    />
                  }
                  label="Экипировано"
                  sx={{ my: 1, display: 'block' }}
                />
                
                <TextField
                  fullWidth
                  label="Заметки к предмету"
                  name="notes"
                  value={formValues.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  margin="normal"
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            color="primary"
            disabled={updating || !formValues.itemId || availableItems.length === 0}
          >
            {updating ? <CircularProgress size={24} /> : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования предмета */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактировать предмет</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Количество"
                  name="quantity"
                  type="number"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.equipped}
                      onChange={handleInputChange}
                      name="equipped"
                    />
                  }
                  label="Экипировано"
                  sx={{ my: 1, display: 'block' }}
                />
                
                <TextField
                  fullWidth
                  label="Заметки к предмету"
                  name="notes"
                  value={formValues.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button 
            onClick={handleUpdateItem} 
            variant="contained" 
            color="primary"
            disabled={updating || !selectedItem}
          >
            {updating ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CardItems;