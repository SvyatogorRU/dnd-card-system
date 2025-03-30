import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Tabs, Tab, TextField, Button, Grid, Card, CardContent, Tooltip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { Info as InfoIcon } from '@mui/icons-material';
import { getDbStats, executeSqlQuery } from '../../api/dbStats';

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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Database = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dbStats, setDbStats] = useState({
    users: { count: 0, lastUpdated: new Date() },
    cards: { 
      count: 0, 
      uniqueCount: 0,
      types: { 
        character: { total: 0, unique: 0 }, 
        npc: { total: 0, unique: 0 }, 
        item: { total: 0, unique: 0 } 
      }, 
      lastUpdated: new Date() 
    },
    groups: { count: 0, lastUpdated: new Date() },
    fields: { count: 0, lastUpdated: new Date() },
  });
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  // Загрузка статистики БД
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await getDbStats();
        setDbStats(stats);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить статистику базы данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Изменение вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Обработчик изменения SQL-запроса
  const handleSqlChange = (e) => {
    setSqlQuery(e.target.value);
    setQueryError(null);
  };

  // Выполнение SQL-запроса
  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;

    try {
      setLoading(true);
      setQueryError(null);
      const result = await executeSqlQuery(sqlQuery);
      setQueryResult(result);
    } catch (err) {
      console.error('Ошибка выполнения запроса:', err);
      setQueryError(err.response?.data?.message || 'Ошибка выполнения SQL-запроса');
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Если пользователь не администратор, не показываем страницу
  if (!isAdmin) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Доступ запрещен
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            У вас нет прав для доступа к этому разделу.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление базой данных
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Статистика" />
          <Tab label="SQL-Консоль" />
          <Tab label="Резервное копирование" />
        </Tabs>

        {/* Вкладка статистики */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Пользователи
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {dbStats.users.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Последнее обновление: {new Date(dbStats.users.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Группы
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {dbStats.groups.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Последнее обновление: {new Date(dbStats.groups.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 0, mr: 1 }}>
                        Карточки
                      </Typography>
                      <Tooltip title="Уникальные карточки - это оригинальные карточки без учета копий и дубликатов">
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Typography variant="h3" color="primary">
                          {dbStats.cards.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Всего карточек
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h3" color="secondary">
                          {dbStats.cards.uniqueCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Уникальных карточек
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                          <Typography variant="h6">Персонажи</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Box>
                              <Typography variant="h4">
                                {dbStats.cards.types.character.total}
                              </Typography>
                              <Typography variant="body2">
                                Всего
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="h4">
                                {dbStats.cards.types.character.unique}
                              </Typography>
                              <Typography variant="body2">
                                Уникальных
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                          <Typography variant="h6">NPC</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Box>
                              <Typography variant="h4">
                                {dbStats.cards.types.npc.total}
                              </Typography>
                              <Typography variant="body2">
                                Всего
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="h4">
                                {dbStats.cards.types.npc.unique}
                              </Typography>
                              <Typography variant="body2">
                                Уникальных
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
                          <Typography variant="h6">Предметы</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Box>
                              <Typography variant="h4">
                                {dbStats.cards.types.item.total}
                              </Typography>
                              <Typography variant="body2">
                                Всего
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="h4">
                                {dbStats.cards.types.item.unique}
                              </Typography>
                              <Typography variant="body2">
                                Уникальных
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Последнее обновление: {new Date(dbStats.cards.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Поля
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {dbStats.fields.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Последнее обновление: {new Date(dbStats.fields.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Вкладка SQL-консоли */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" paragraph>
            Эта функция предназначена только для опытных администраторов. Некорректные SQL-запросы могут повредить базу данных.
          </Typography>

          <TextField
            fullWidth
            label="SQL-запрос"
            value={sqlQuery}
            onChange={handleSqlChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
            error={!!queryError}
            helperText={queryError}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleExecuteQuery}
            disabled={!sqlQuery.trim() || loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Выполнить запрос'}
          </Button>

          {queryResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Результат запроса:
              </Typography>

              {queryResult.rows ? (
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} size="small">
                    <TableHead>
                      <TableRow>
                        {queryResult.columns.map((column, index) => (
                          <TableCell key={index}>{column}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {queryResult.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {typeof cell === 'object' ? JSON.stringify(cell) : cell?.toString()}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {queryResult.message} (затронуто строк: {queryResult.rowsAffected})
                </Alert>
              )}
            </Box>
          )}
        </TabPanel>

        {/* Вкладка резервного копирования */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Резервное копирование базы данных
            </Typography>
            <Typography variant="body1" paragraph>
              Создайте резервную копию базы данных для защиты от потери данных. Резервные копии сохраняются на сервере и могут быть загружены при необходимости.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Создать резервную копию
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Восстановление из резервной копии
            </Typography>
            <Typography variant="body1" paragraph>
              Внимание! Восстановление из резервной копии перезапишет все текущие данные в базе данных.
            </Typography>

            <Button
              variant="contained"
              color="error"
              disabled={loading}
            >
              Восстановить из резервной копии
            </Button>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Database;