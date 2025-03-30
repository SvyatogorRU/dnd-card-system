import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, CircularProgress,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import {
  MonetizationOn as MoneyIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroup, getGroupBank, updateGroupBank } from '../../api/groups';
import { useAuth } from '../../context/AuthContext';

const GroupBank = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isDungeonMaster } = useAuth();
  const [group, setGroup] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    amount: '',
    description: '',
    type: 'deposit'
  });

  // Загрузка данных группы и банка
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupData, bankResponse] = await Promise.all([
          getGroup(groupId),
          getGroupBank(groupId)
        ]);
        
        setGroup(groupData);
        setBankData(bankResponse);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные группы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  // Проверка прав доступа
  useEffect(() => {
    if (!loading && !isAdmin && !isDungeonMaster) {
      navigate(`/groups/${groupId}`);
    }
  }, [loading, isAdmin, isDungeonMaster, navigate, groupId]);

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Преобразуем сумму в число и меняем знак в зависимости от типа
      const amount = parseInt(formValues.amount);
      const finalAmount = formValues.type === 'withdraw' ? -Math.abs(amount) : Math.abs(amount);
      
      await updateGroupBank(groupId, {
        title: formValues.title,
        amount: finalAmount,
        description: formValues.description
      });
      
      // Перенаправляем на страницу группы
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error('Ошибка обновления банка:', err);
      setError('Не удалось обновить банк группы. Пожалуйста, попробуйте позже.');
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
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          component={Link}
          to={`/groups/${groupId}`}
        >
          Вернуться к группе
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Банк группы {group?.name}
        </Typography>
        
        <Box sx={{ mt: 2, mb: 4, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <MoneyIcon />
          </Avatar>
          <Typography variant="h5">
            Текущий баланс: {bankData?.totalBalance || 0} монет
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Typography variant="h5" gutterBottom>
          Добавить транзакцию
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип транзакции</InputLabel>
            <Select
              name="type"
              value={formValues.type}
              onChange={handleInputChange}
              label="Тип транзакции"
              required
            >
              <MenuItem value="deposit">Пополнение</MenuItem>
              <MenuItem value="withdraw">Списание</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Название транзакции"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Сумма (монеты)"
            name="amount"
            type="number"
            value={formValues.amount}
            onChange={handleInputChange}
            required
            margin="normal"
            InputProps={{
              startAdornment: formValues.type === 'deposit' ? <AddIcon /> : <RemoveIcon />,
              inputProps: { min: 1 }
            }}
          />
          
          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            margin="normal"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(`/groups/${groupId}`)}
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !formValues.title || !formValues.amount}
            >
              {submitting ? <CircularProgress size={24} /> : 'Добавить транзакцию'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default GroupBank;