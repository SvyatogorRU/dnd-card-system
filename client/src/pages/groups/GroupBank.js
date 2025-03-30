import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, CircularProgress,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert,
  Card, CardContent, IconButton, Grid
} from '@mui/material';
import {
  MonetizationOn as MoneyIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as BackIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroup, getGroupBank, updateGroupBank } from '../../api/groups';
import { useAuth } from '../../context/AuthContext';
import { getCardsByType } from '../../api/cards';

const GroupBank = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isDungeonMaster } = useAuth();
  const [group, setGroup] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    amount: '',
    description: '',
    type: 'deposit',
    itemId: ''
  });
  const [showForm, setShowForm] = useState(false);

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
        
        // Если пользователь DM или админ, загружаем предметы
        if (isAdmin || isDungeonMaster) {
          const itemsData = await getCardsByType('item');
          setItems(itemsData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные группы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, isAdmin, isDungeonMaster]);

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
      
      let requestData = {
        title: formValues.title,
        amount: finalAmount,
        description: formValues.description
      };
      
      // Если выбран предмет, добавляем его ID
      if (formValues.itemId) {
        requestData.itemId = formValues.itemId;
      }
      
      await updateGroupBank(groupId, requestData);
      
      // Перезагрузка данных банка
      const updatedBankData = await getGroupBank(groupId);
      setBankData(updatedBankData);
      
      // Сброс формы
      setFormValues({
        title: '',
        amount: '',
        description: '',
        type: 'deposit',
        itemId: ''
      });
      
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Ошибка обновления банка:', err);
      setError('Не удалось обновить банк группы. Пожалуйста, попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  // Получение цвета для суммы транзакции
  const getAmountColor = (amount) => {
    return amount >= 0 ? 'success.main' : 'error.main';
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
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Банк группы {group?.name}
          </Typography>
          {(isAdmin || isDungeonMaster) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Скрыть форму' : 'Добавить транзакцию'}
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
            <MoneyIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5">
            Текущий баланс: <span style={{ fontWeight: 'bold' }}>{bankData?.totalBalance || 0}</span> монет
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Форма добавления транзакции */}
        {showForm && (isAdmin || isDungeonMaster) && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Новая транзакция
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Предмет (необязательно)</InputLabel>
                      <Select
                        name="itemId"
                        value={formValues.itemId}
                        onChange={handleInputChange}
                        label="Предмет (необязательно)"
                      >
                        <MenuItem value="">Без предмета</MenuItem>
                        {items.map(item => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name} {item.content.item_type ? `(${item.content.item_type})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Название транзакции"
                      name="title"
                      value={formValues.title}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
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
                  </Grid>
                </Grid>
                
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
                    onClick={() => setShowForm(false)}
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
            </CardContent>
          </Card>
        )}
        
        {/* История транзакций */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          История транзакций
        </Typography>
        
        {bankData?.entries && bankData.entries.length > 0 ? (
          <List>
            {bankData.entries.map((entry) => (
              <React.Fragment key={entry.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: entry.amount >= 0 ? 'success.main' : 'error.main' }}>
                      {entry.amount >= 0 ? <AddIcon /> : <RemoveIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="span">
                          {entry.title}
                        </Typography>
                        {entry.item && (
                          <Chip 
                            icon={<InventoryIcon />}
                            label={entry.item.name}
                            size="small"
                            color="info"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {entry.createdBy ? entry.createdBy.username : 'Система'} - 
                          {' ' + new Date(entry.createdAt).toLocaleString()}
                        </Typography>
                        {entry.description && (
                          <Typography
                            component="p"
                            variant="body2"
                            sx={{ mt: 1 }}
                          >
                            {entry.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: getAmountColor(entry.amount),
                      fontWeight: 'bold' 
                    }}
                  >
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </Typography>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              История банка пуста
            </Typography>
            {(isAdmin || isDungeonMaster) && !showForm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{ mt: 2 }}
              >
                Добавить первую транзакцию
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default GroupBank;