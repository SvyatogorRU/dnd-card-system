import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, CircularProgress,
  Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Grid, IconButton,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getAllFields, createField, updateField, deleteField } from '../api/admin';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [fieldValues, setFieldValues] = useState({
    name: '',
    type: 'text',
    category: '',
    options: '',
    defaultValue: '',
    required: false
  });

  // Загрузка полей
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getAllFields();
        setFields(data);
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

  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Открытие диалога создания/редактирования поля
  const handleOpenDialog = (field = null) => {
    if (field) {
      // Режим редактирования
      setEditMode(true);
      setCurrentField(field);
      setFieldValues({
        name: field.name,
        type: field.type,
        category: field.category,
        options: field.options ? field.options.join(', ') : '',
        defaultValue: field.defaultValue || '',
        required: field.required || false
      });
    } else {
      // Режим создания
      setEditMode(false);
      setCurrentField(null);
      setFieldValues({
        name: '',
        type: 'text',
        category: '',
        options: '',
        defaultValue: '',
        required: false
      });
    }
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
      setFieldValues({ ...fieldValues, [name]: checked });
    } else {
      setFieldValues({ ...fieldValues, [name]: value });
    }
  };

  // Сохранение поля
  const handleSaveField = async () => {
    try {
      // Подготовка данных
      const fieldData = {
        ...fieldValues,
        options: fieldValues.type === 'select' ? 
          fieldValues.options.split(',').map(opt => opt.trim()).filter(opt => opt) : 
          []
      };

      if (editMode && currentField) {
        await updateField(currentField._id, fieldData);
      } else {
        await createField(fieldData);
      }

      // Обновление списка полей
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
    if (window.confirm('Вы уверены, что хотите удалить это поле? Это действие нельзя отменить.')) {
      try {
        await deleteField(fieldId);
        // Обновление списка полей
        setFields(fields.filter(field => field._id !== fieldId));
      } catch (err) {
        console.error('Ошибка удаления поля:', err);
        setError('Не удалось удалить поле.');
      }
    }
  };
  
  // Рендеринг списка полей по категориям
  const renderFieldsList = () => {
    // Получение уникальных категорий
    const categories = Array.from(new Set(fields.map(field => field.category)));
    
    if (fields.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Поля не найдены. Создайте новое поле.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        {categories.map(category => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {category}
            </Typography>
            <Paper variant="outlined">
              <List>
                {fields
                  .filter(field => field.category === category)
                  .sort((a, b) => a.order - b.order)
                  .map((field, index) => (
                    <React.Fragment key={field._id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem>
                        <ListItemText
                          primary={field.name}
                          secondary={`Тип: ${field.type}${field.required ? ' • Обязательное' : ''}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleOpenDialog(field)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleDeleteField(field._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
              </List>
            </Paper>
          </Box>
        ))}
      </Box>
    );
  };

  // Если пользователь не админ, перенаправляем на главную
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
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
          Панель администратора
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Управление полями" />
          {/* Тут можно добавить другие вкладки для управления системой */}
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                  Поля карточек
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Добавить поле
                </Button>
              </Box>
              
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              
              {renderFieldsList()}
            </>
          )}
        </Box>
      </Paper>
      
      {/* Диалог создания/редактирования поля */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
                value={fieldValues.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип поля</InputLabel>
                <Select
                  name="type"
                  value={fieldValues.type}
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
                value={fieldValues.category}
                onChange={handleInputChange}
                required
                helperText="Для группировки полей в карточке"
              />
            </Grid>
            
            {fieldValues.type === 'select' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Варианты выбора"
                  name="options"
                  value={fieldValues.options}
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
                value={fieldValues.defaultValue}
                onChange={handleInputChange}
                helperText="Необязательно"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fieldValues.required}
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
            disabled={!fieldValues.name || !fieldValues.category || (fieldValues.type === 'select' && !fieldValues.options)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;