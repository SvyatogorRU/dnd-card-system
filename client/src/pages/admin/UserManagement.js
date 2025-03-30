import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, TablePagination, IconButton, Alert
} from '@mui/material';
import { Edit as EditIcon, Key as KeyIcon } from '@mui/icons-material';
import { getAllUsers, getAllRoles, assignRoleToUser, removeRoleFromUser } from '../../api/admin';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Загрузка пользователей и ролей
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([
          getAllUsers(),
          getAllRoles()
        ]);
        setUsers(usersData);
        setRoles(rolesData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Открытие диалога для назначения роли
  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setSelectedRole('');
    setDialogOpen(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  // Изменение выбранной роли
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Назначение роли пользователю
  const handleAssignRole = async () => {
    try {
      await assignRoleToUser(selectedUser.id, selectedRole);
      
      // Обновляем список пользователей, чтобы отобразить новую роль
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Ошибка назначения роли:', err);
      setError('Не удалось назначить роль. Пожалуйста, попробуйте позже.');
    }
  };

  // Удаление роли у пользователя
  const handleRemoveRole = async (userId, roleId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту роль у пользователя?')) {
      return;
    }
    
    try {
      await removeRoleFromUser(userId, roleId);
      
      // Обновляем список пользователей
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (err) {
      console.error('Ошибка удаления роли:', err);
      setError('Не удалось удалить роль. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработка изменения страницы
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Обработка изменения количества строк на странице
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Функция для получения URL аватара Discord
  const getAvatarUrl = (user) => {
    if (user.avatar && user.discordId) {
      return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление пользователями
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="таблица пользователей">
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Роли</TableCell>
                <TableCell>Последний вход</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Загрузка...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Пользователи не найдены</TableCell>
                </TableRow>
              ) : (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={getAvatarUrl(user)} 
                            alt={user.username}
                            sx={{ mr: 2 }}
                          >
                            {user.username?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{user.username}</Typography>
                            {user.isAdmin && (
                              <Chip 
                                label="Администратор" 
                                color="error" 
                                size="small" 
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.roles?.map(role => (
                            <Chip 
                              key={role.id}
                              label={role.name}
                              onDelete={() => handleRemoveRole(user.id, role.id)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <Typography variant="body2" color="text.secondary">
                              Нет ролей
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Никогда'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenRoleDialog(user)}
                          title="Назначить роль"
                        >
                          <KeyIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          // onClick={() => handleEditUser(user.id)}
                          title="Редактировать пользователя"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </Paper>

      {/* Диалог назначения роли */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Назначить роль пользователю</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <Typography variant="body1" gutterBottom>
              Пользователь: {selectedUser?.username}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Роль</InputLabel>
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                label="Роль"
              >
                <MenuItem value="" disabled>
                  Выберите роль
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem 
                    key={role.id} 
                    value={role.id}
                    disabled={selectedUser?.roles?.some(r => r.id === role.id)}
                  >
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleAssignRole} 
            variant="contained" 
            color="primary"
            disabled={!selectedRole}
          >
            Назначить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;