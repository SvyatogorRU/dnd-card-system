import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Switch, FormControlLabel, 
  Typography, Grid, MenuItem, Select, FormControl, 
  InputLabel, Checkbox, FormGroup, CircularProgress, Paper, Alert,
  Container // Добавляем импорт Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllFields } from '../../api/admin';
import { createCard, updateCard, getCard } from '../../api/cards';
import { useAuth } from '../../context/AuthContext';

const CardForm = ({ type = 'character', isEdit = false }) => {
  const { cardId } = useParams();
  const { isAdmin, isDungeonMaster } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({
    name: '',
    type,
    content: {},
    public: false
  });

  // Проверка прав доступа на основе типа карточки
  useEffect(() => {
    if ((type === 'npc' || type === 'item') && !isAdmin && !isDungeonMaster) {
      navigate('/dashboard');
    }
  }, [type, isAdmin, isDungeonMaster, navigate]);

  // Загрузка полей и данных карточки (при редактировании)
  useEffect(() => {
    const initialize = async () => {
      try {
        // Загрузить доступные поля для данного типа карточки
        const fieldsData = await getAllFields(type);
        setFields(fieldsData);

        // Если это редактирование, загрузить данные карточки
        if (isEdit && cardId) {
          const cardData = await getCard(cardId);
          
          setFormValues({
            name: cardData.name,
            type: cardData.type,
            content: cardData.content || {},
            public: cardData.public
          });
        }

        setError(null);
      } catch (err) {
        console.error('Ошибка инициализации формы:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isEdit, cardId, type]);

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'public') {
      setFormValues({
        ...formValues,
        [name]: checked
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  // Обработчик изменения значений настраиваемых полей
  const handleFieldChange = (key, value) => {
    setFormValues({
      ...formValues,
      content: {
        ...formValues.content,
        [key]: value
      }
    });
  };

  // Получение значения поля
  const getFieldValue = (key) => {
    return formValues.content[key] !== undefined ? formValues.content[key] : '';
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateCard(cardId, formValues);
      } else {
        await createCard(formValues);
      }
      
      // Переход на страницу с соответствующими карточками
      navigate(`/${type === 'character' ? 'characters' : type === 'npc' ? 'npcs' : 'items'}`);
    } catch (err) {
      console.error('Ошибка сохранения карточки:', err);
      setError('Не удалось сохранить карточку. Пожалуйста, проверьте введенные данные и попробуйте снова.');
      setSubmitting(false);
    }
  };

  // Функция для отрисовки полей разных типов
  const renderFieldInput = (field) => {
    const value = getFieldValue(field.key);

    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            margin="normal"
          />
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
            required={field.required}
            margin="normal"
          />
        );
      
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            margin="normal"
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth margin="normal" required={field.required}>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              label={field.name}
            >
              <MenuItem value="">Выберите...</MenuItem>
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              />
            }
            label={field.name}
            margin="normal"
          />
        );
      
      default:
        return <Typography color="error">Неизвестный тип поля: {field.type}</Typography>;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Получение заголовка формы на основе типа карточки
  const getFormTitle = () => {
    let entityName = 'карточки';
    if (type === 'character') entityName = 'персонажа';
    else if (type === 'npc') entityName = 'NPC';
    else if (type === 'item') entityName = 'предмета';
    
    return `${isEdit ? 'Редактирование' : 'Создание'} ${entityName}`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {getFormTitle()}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            required
            fullWidth
            label="Название"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formValues.public}
                onChange={handleInputChange}
                name="public"
              />
            }
            label="Публичная карточка"
            sx={{ my: 2 }}
          />

          {fields.length > 0 && (
            <>
              {/* Группировка полей по категориям */}
              {Array.from(new Set(fields.map(field => field.category))).map(category => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    {category}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {fields
                      .filter(field => field.category === category)
                      .sort((a, b) => a.order - b.order)
                      .map(field => (
                        <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field.id}>
                          {renderFieldInput(field)}
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              ))}
            </>
          )}

         <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(`/${type === 'character' ? 'characters' : type === 'npc' ? 'npcs' : 'items'}`)}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : (isEdit ? 'Сохранить' : 'Создать')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CardForm;