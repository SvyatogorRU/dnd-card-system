import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Button, TextField, CircularProgress,
  Paper, Alert 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createGroup, updateGroup, getGroup } from '../../api/groups';
import { useAuth } from '../../context/AuthContext';

const GroupForm = ({ isEdit = false }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isDungeonMaster } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: ''
  });

  // Проверка прав доступа
  useEffect(() => {
    if (!isAdmin && !isDungeonMaster) {
      navigate('/groups');
    }
  }, [isAdmin, isDungeonMaster, navigate]);

  // Загрузка данных группы для редактирования
  useEffect(() => {
    if (isEdit && groupId) {
      const fetchGroup = async () => {
        try {
          const groupData = await getGroup(groupId);
          
          setFormValues({
            name: groupData.name,
            description: groupData.description || ''
          });
          
          setError(null);
        } catch (err) {
          console.error('Ошибка загрузки группы:', err);
          setError('Не удалось загрузить данные группы. Пожалуйста, попробуйте позже.');
        } finally {
          setLoading(false);
        }
      };

      fetchGroup();
    }
  }, [isEdit, groupId]);

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

// Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateGroup(groupId, formValues);
      } else {
        await createGroup(formValues);
      }
      
      navigate('/groups');
    } catch (err) {
      console.error('Ошибка сохранения группы:', err);
      setError('Не удалось сохранить группу. Пожалуйста, проверьте введенные данные и попробуйте снова.');
      setSubmitting(false);
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEdit ? 'Редактирование группы' : 'Создание новой группы'}
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
            label="Название группы"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/groups')}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !formValues.name}
            >
              {submitting ? <CircularProgress size={24} /> : (isEdit ? 'Сохранить' : 'Создать')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default GroupForm;