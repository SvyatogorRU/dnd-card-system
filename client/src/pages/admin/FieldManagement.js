import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, IconButton, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel,
  Checkbox, Tabs, Tab, Card, CardContent, Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { getAllFields, createField, updateField, deleteField } from '../../api/admin';

// Компонент панели с контентом вкладки
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FieldManagement = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formValues, setFormValues] = useState({
    name: '',
    type: 'text',
    category: '',
    options: '',
    defaultValue: '',
    required: false,
    cardType: 'all'
  });

  // Типы карточек для вкладок
  const cardTypes = ['character', 'npc', 'item', 'all'];

  // Загрузка полей
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fieldsData = await getAllFields();
        setFields(fieldsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки полей:', err);
        setError('Не удалось загрузить поля. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Изменение вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Открытие диалога создания поля
  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setCurrentField(null);
    setFormValues({
      name: '',
      type: 'text',
      category: '',
      options: '',
      defaultValue: '',
      required: false,
      cardType: cardTypes[tabValue]
    });
    setDialogOpen(true);
  };

  // Открытие диалога редактирования поля
  const handleOpenEditDialog = (field) => {
    setEditMode(true);
    setCurrentField(field);
    setFormValues({
      name: field.name,
      type: field.type,
      category: field.category,
      options: field.options ? field.options.join(', ') : '',
      defaultValue: field.defaultValue || '',
      required: field.required || false,
      cardType: field.cardType || 'all'
    });
    setDialogOpen(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'required') {
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Сохранение поля
  const handleSaveField = async () => {
    try {
      // Подготовка данных
      const fieldData = {
        ...formValues,
        options: formValues.type === 'select' ? 
          formValues.options.split(',').map(opt => opt.trim()).filter(opt => opt) : 
          []
      };

      if (editMode && currentField) {
        await updateField(currentField.id, fieldData);
      } else {
        await createField(fieldData);
      }

      // Обновляем список полей
      const updatedFields = await getAllFields();
      setFields(updatedFields);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Ошибка сохранения поля:', err);
      setError('Не удалось сохранить поле. Пожалуйста, проверьте введенные данные.');
    }
  };

  // Удаление поля
  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это поле?')) {
      return;
    }
    
    try {
      await deleteField(fieldId);
      
      // Обновляем список полей
      setFields(fields.filter(field => field.id !== fieldId));
    } catch (err) {
      console.error('Ошибка удаления поля:', err);
      setError('Не удалось удалить поле.');
    }
  };

  // Фильтрация полей по типу карточки для текущей вкладки
  const getFilteredFields = () => {
    const currentCardType = cardTypes[tabValue];
    if (currentCardType === 'all') {
      return fields;
    }
    return fields.filter(field => 
      field.cardType === currentCardType || field.cardType === 'all'
    );
  };

  // Группировка полей по категориям
  const getFieldsByCategory = () => {
    const filteredFields = getFilteredFields();
    const categories = {};
    
    filteredFields.forEach(field => {
      if (!categories[field.category]) {
        categories[field.category] = [];
      }
      categories[field.category].push(field);
    });
    
    // Сортировка полей в каждой категории по порядку
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.order - b.order);
    });
    
    return categories;
  };

  // Получение названия типа карточки для отображения
  const getCardTypeName = (type) => {
    switch (type) {
      case 'character': return 'Персонаж';
      case 'npc': return 'NPC';
      case 'item': return 'Предмет';
      case 'all': return 'Все типы';
      default: return type;
    }
  };

  // Получение названия типа поля для отображения
  const getFieldTypeName = (type) => {
    switch (type) {
      case 'text': return 'Текст';
      case 'number': return 'Число';
      case 'select': return 'Выпадающий список';
      case 'checkbox': return 'Флажок';
      case 'textarea': return 'Многострочный текст';
      default: return type;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление полями карточек
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Добавить поле
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Персонажи" />
          <Tab label="NPC" />
          <Tab label="Предметы" />
          <Tab label="Все поля" />
        </Tabs>

        {loading ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1">Загрузка...</Typography>
          </Box>
        ) : (
          <TabPanel value={tabValue} index={tabValue}>
            {Object.entries(getFieldsByCategory()).length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1">
                  Поля не найдены. Создайте новое поле для карточек типа "{getCardTypeName(cardTypes[tabValue])}".
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {Object.entries(getFieldsByCategory()).map(([category, categoryFields]) => (
                  <Grid item xs={12} key={category}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {category}
                        </Typography>
                        <List>
                          {categoryFields.map((field) => (
                            <React.Fragment key={field.id}>
                              <ListItem>
                                <DragIcon color="action" sx={{ mr: 2 }} />
                                <ListItemText
                                  primary={field.name}
                                  secondary={
                                    <>
                                      Тип: {getFieldTypeName(field.type)}
                                      {field.required && ' • Обязательное'}
                                      {field.cardType !== 'all' && field.cardType !== cardTypes[tabValue] && 
                                        ` • Тип карточки: ${getCardTypeName(field.cardType)}`}
                                    </>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleOpenEditDialog(field)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleDeleteField(field.id)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              <Divider component="li" />
                            </React.Fragment>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        )}
      </Paper>

      {/* Диалог создания/редактирования поля */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Редактирование поля' : 'Создание нового поля'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название поля"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип поля</InputLabel>
                <Select
                  name="type"
                  value={formValues.type}
                  onChange={handleInputChange}
                  label="Тип поля"
                >
                  <MenuItem value="text">Текст</MenuItem>
                  <MenuItem value="number">Число</MenuItem>
                  <MenuItem value="select">Выпадающий список</MenuItem>
                  <MenuItem value="checkbox">Флажок</MenuItem>
                  <MenuItem value="textarea">Многострочный текст</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Категория"
                name="category"
                value={formValues.category}
                onChange={handleInputChange}
                required
                helperText="Для группировки полей в карточке"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип карточки</InputLabel>
                <Select
                  name="cardType"
                  value={formValues.cardType}
                  onChange={handleInputChange}
                  label="Тип карточки"
                >
                  <MenuItem value="all">Все типы</MenuItem>
                  <MenuItem value="character">Персонаж</MenuItem>
                  <MenuItem value="npc">NPC</MenuItem>
                  <MenuItem value="item">Предмет</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formValues.type === 'select' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Варианты выбора"
                  name="options"
                  value={formValues.options}
                  onChange={handleInputChange}
                  helperText="Введите варианты через запятую"
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Значение по умолчанию"
                name="defaultValue"
                value={formValues.defaultValue}
                onChange={handleInputChange}
                helperText="Необязательно"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.required}
                    onChange={handleInputChange}
                    name="required"
                  />
                }
                label="Обязательное поле"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleSaveField} 
            variant="contained" 
            color="primary"
            disabled={!formValues.name || !formValues.category || (formValues.type === 'select' && !formValues.options)}
          >
            {editMode ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FieldManagement;