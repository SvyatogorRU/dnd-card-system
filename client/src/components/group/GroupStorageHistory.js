import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, 
  ListItemText, Avatar, Divider, CircularProgress, Alert
} from '@mui/material';
import {
  MonetizationOn as MoneyIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { getGroupStorageHistory } from '../../api/groups';

const GroupStorageHistory = ({ groupId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historyData = await getGroupStorageHistory(groupId);
        setHistory(historyData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки истории хранилища:', err);
        setError('Не удалось загрузить историю хранилища. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [groupId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          История действий с хранилищем
        </Typography>
        <Typography variant="body1" align="center" sx={{ py: 3 }}>
          История действий с хранилищем пуста
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        История действий с хранилищем
      </Typography>
      
      <List>
        {history.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: item.action === 'add' ? 'success.main' : 'error.main' }}>
                  {item.type === 'item' ? <InventoryIcon /> : <MoneyIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {item.action === 'add' ? 'Добавление' : 'Удаление'}: {item.title || 'Транзакция'}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span" display="block">
                      {item.type === 'item' ? (
                        <>Предмет: {item.itemName || 'Неизвестно'}</>
                      ) : (
                        <>Сумма: {item.amount || 0} монет</>
                      )}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" component="span" display="block">
                        {item.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.timestamp).toLocaleString()} • {item.username || 'Система'}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default GroupStorageHistory;