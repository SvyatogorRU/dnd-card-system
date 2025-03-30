import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Switch, FormControlLabel, 
  Typography, Grid, MenuItem, Select, FormControl, 
  InputLabel, Checkbox, FormGroup, CircularProgress, Paper 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllFields } from '../../api/admin';
import { createCard, updateCard, getCard } from '../../api/cards';

const CardForm = ({ cardId, isEdit = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({
    name: '',
    fields: [],
    public: false
  });

  // Загрузка полей и данных карточки (при редактировании)
  useEffect(() => {
    const initialize = async () => {
      try {
        // Загрузить доступные поля
        const fieldsData = await getAllFields();
        setFields(fieldsData);

        // Если это редактирование, загрузить данные карточки
        if (isEdit && cardId) {
          const cardData = await getCard(cardId);
          setFormValues({
            name: cardData.name,
            fields: cardData.fields,
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
  }, [isEdit, cardId]);

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
  const handleFieldChange = (fieldId, value) => {
    // Найти поле в массиве, если оно существует
    const existingFieldIndex = formValues.fields.findIndex(
      (field) => field.fieldId === fieldId
    );

    // Создать копию массива полей
    const updatedFields = [...formValues.fields];

    // Обновить или добавить поле
    if (existingFieldIndex >= 0) {
      updatedFields[existingFieldIndex] = {
        ...updatedFields[existingFieldIndex],
        value
      };
    } else {
      updatedFields.push({ fieldId, value });
    }

    setFormValues({
      ...formValues,
      fields: updatedFields
    });
  };

  // Получение значения поля
  const getFieldValue = (fieldId) => {
    const fieldEntry = formValues.fields.find(field => field.fieldId === fieldId);
    return fieldEntry ? fieldEntry.value : '';
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
      navigate('/dashboard');
    } catch (err) {
      console.error('Ошибка сохранения карточки:', err);
      setError('Не удалось сохранить карточку. Пожалуйста, проверьте введенные данные и попробуйте снова.');
      setSubmitting(false);
    }
  };

  // Функция для отрисовки полей разных типов
  const renderFieldInput = (field) => {
    const value = getFieldValue(field._id);

    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.name}
            value={value || ''}
            onChange={(e) => handleFieldChange(field._id, e.target.value)}
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
            value={value || ''}
            onChange={(e) => handleFieldChange(field._id, Number(e.target.value))}
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
            value={value || ''}
            onChange={(e) => handleFieldChange(field._id, e.target.value)}
            required={field.required}
            margin="normal"
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth margin="normal" required={field.required}>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleFieldChange(field._id, e.target.value)}
              label={field.name}
            >
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
                onChange={(e) => handleFieldChange(field._id, e.target.checked)}
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

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEdit ? 'Редактирование карточки' : 'Создание новой карточки'}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          required
          fullWidth
          label="Название карточки"
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
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Характеристики
            </Typography>

            {/* Группировка полей по категориям */}
            {Array.from(new Set(fields.map(field => field.category))).map(category => (
              <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {category}
                </Typography>
                
                <Grid container spacing={2}>
                  {fields
                    .filter(field => field.category === category)
                    .sort((a, b) => a.order - b.order)
                    .map(field => (
                      <Grid item xs={12} sm={field.type === 'textarea' ? 12 : 6} key={field._id}>
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
            onClick={() => navigate('/dashboard')}
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
      </Paper>
    </Box>
  );
};

export default CardForm;