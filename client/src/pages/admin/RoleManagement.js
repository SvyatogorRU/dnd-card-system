import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, IconButton, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, CardActions, Accordion, AccordionSummary,
  AccordionDetails, FormControlLabel, Checkbox, Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { getAllRoles, createRole, updateRole, deleteRole } from '../../api/admin';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    permissions: {}
  });

  // Загрузка ролей
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки ролей:', err);
        setError('Не удалось загрузить роли. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Открытие диалога создания роли
  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setCurrentRole(null);
    setFormValues({
      name: '',
      description: '',
      permissions: {
        cards: {
          read: false,
          create: false,
          update: false,
          delete: false,
          character: false,
          npc: false,
          item: false
        },
        groups: {
          read: false,
          manage: false,
          bank: false
        }
      }
    });
    setDialogOpen(true);
  };

  // Открытие диалога редактирования роли
  const handleOpenEditDialog = (role) => {
    setEditMode(true);
    setCurrentRole(role);
    setFormValues({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || {
        cards: {
          read: false,
          create: false,
          update: false,
          delete: false,
          character: false,
          npc: false,
          item: false
        },
        groups: {
          read: false,
          manage: false,
          bank: false
        }
      }
    });
    setDialogOpen(true);
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения прав доступа
  const handlePermissionChange = (category, permission) => (e) => {
    const { checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          [permission]: checked
        }
      }
    }));
  };

  // Сохранение роли
  const handleSaveRole = async () => {
    try {
      if (editMode && currentRole) {
        await updateRole(currentRole.id, formValues);
      } else {
        await createRole(formValues);
      }

      // Обновляем список ролей
      const updatedRoles = await getAllRoles();
      setRoles(updatedRoles);

      handleCloseDialog();
    } catch (err) {
      console.error('Ошибка сохранения роли:', err);
      setError('Не удалось сохранить роль. Пожалуйста, проверьте введенные данные.');
    }
  };

  // Удаление роли
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту роль?')) {
      return;
    }

    try {
      await deleteRole(roleId);

      // Обновляем список ролей
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      console.error('Ошибка удаления роли:', err);
      setError('Не удалось удалить роль.');
    }
  };

  // Проверка, является ли роль системной
  const isSystemRole = (roleName) => {
    return ['Administrator', 'Dungeon Master', 'Player'].includes(roleName);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление ролями
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Создать роль
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">Загрузка...</Typography>
        </Paper>
      ) : roles.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">Роли не найдены</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} key={role.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" component="h2">
                      {role.name}
                    </Typography>
                    {isSystemRole(role.name) && (
                      <Typography variant="caption" color="primary">
                        Системная роль
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {role.description || 'Нет описания'}
                  </Typography>

                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Права доступа</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {role.permissions && Object.entries(role.permissions).map(([category, perms]) => (
                        <Box key={category} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {category === 'cards' ? 'Карточки' : 
                              category === 'groups' ? 'Группы' : category}
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            {Object.entries(perms).map(([perm, value]) => (
                              <Typography key={perm} variant="body2">
                                {perm}: {value ? 'Да' : 'Нет'}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      ))}
                      {(!role.permissions || Object.keys(role.permissions).length === 0) && (
                        <Typography variant="body2">
                          Нет настроенных прав доступа
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditDialog(role)}
                  >
                    Редактировать
                  </Button>
                  {!isSystemRole(role.name) && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      Удалить
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог создания/редактирования роли */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Редактирование роли' : 'Создание новой роли'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название роли"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
              required
              margin="normal"
              disabled={editMode && isSystemRole(currentRole?.name)}
            />
            
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
            />
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Права доступа
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Карточки</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.read || false}
                        onChange={handlePermissionChange('cards', 'read')}
                      />
                    }
                    label="Просмотр"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.create || false}
                        onChange={handlePermissionChange('cards', 'create')}
                      />
                    }
                    label="Создание"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.update || false}
                        onChange={handlePermissionChange('cards', 'update')}
                      />
                    }
                    label="Редактирование"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.delete || false}
                        onChange={handlePermissionChange('cards', 'delete')}
                      />
                    }
                    label="Удаление"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.character || false}
                        onChange={handlePermissionChange('cards', 'character')}
                      />
                    }
                    label="Персонажи"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.npc || false}
                        onChange={handlePermissionChange('cards', 'npc')}
                      />
                    }
                    label="NPC"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.cards?.item || false}
                        onChange={handlePermissionChange('cards', 'item')}
                      />
                    }
                    label="Предметы"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box>
              <Typography variant="subtitle1">Группы</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.groups?.read || false}
                        onChange={handlePermissionChange('groups', 'read')}
                      />
                    }
                    label="Просмотр"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.groups?.manage || false}
                        onChange={handlePermissionChange('groups', 'manage')}
                      />
                    }
                    label="Управление"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.permissions?.groups?.bank || false}
                        onChange={handlePermissionChange('groups', 'bank')}
                      />
                    }
                    label="Банк группы"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleSaveRole} 
            variant="contained" 
            color="primary"
            disabled={!formValues.name}
          >
            {editMode ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoleManagement;