import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Button, CircularProgress, Divider,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Alert, Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { 
  getGroupNotes, 
  createGroupNote, 
  updateGroupNote, 
  deleteGroupNote 
} from '../../api/groups';
import { useAuth } from '../../context/AuthContext';

const GroupNotes = ({ groupId }) => {
  const { isAdmin, isDungeonMaster } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    content: '',
    visibility: 'dm_only'
  });

  // Проверяем, имеет ли пользователь право на просмотр заметок
  const canViewNotes = isAdmin || isDungeonMaster;

  // Загрузка заметок группы
  useEffect(() => {
    if (!canViewNotes || !groupId) return;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        const notesData = await getGroupNotes(groupId);
        setNotes(notesData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки заметок:', err);
        setError('Не удалось загрузить заметки группы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [groupId, canViewNotes]);

  // Открытие диалога создания заметки
  const handleOpenCreateDialog = () => {
    setFormValues({
      title: '',
      content: '',
      visibility: 'dm_only'
    });
    setDialogOpen(true);
  };

  // Открытие диалога редактирования заметки
  const handleOpenEditDialog = (note) => {
    setSelectedNote(note);
    setFormValues({
      title: note.title,
      content: note.content || '',
      visibility: note.visibility
    });
    setEditDialogOpen(true);
  };

  // Закрытие всех диалогов
  const handleCloseDialogs = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedNote(null);
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Создание новой заметки
  const handleCreateNote = async () => {
    if (!formValues.title) {
      setError('Заголовок заметки обязателен');
      return;
    }

    try {
      const newNote = await createGroupNote(groupId, formValues);
      setNotes([newNote, ...notes]);
      handleCloseDialogs();
      setError(null);
    } catch (err) {
      console.error('Ошибка создания заметки:', err);
      setError('Не удалось создать заметку. Пожалуйста, попробуйте позже.');
    }
  };

  // Обновление заметки
  const handleUpdateNote = async () => {
    if (!selectedNote || !formValues.title) return;

    try {
      const updatedNote = await updateGroupNote(groupId, selectedNote.id, formValues);
      setNotes(notes.map(note => (note.id === updatedNote.id ? updatedNote : note)));
      handleCloseDialogs();
      setError(null);
    } catch (err) {
      console.error('Ошибка обновления заметки:', err);
      setError('Не удалось обновить заметку. Пожалуйста, попробуйте позже.');
    }
  };

  // Удаление заметки
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      return;
    }

    try {
      await deleteGroupNote(groupId, noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      setError(null);
    } catch (err) {
      console.error('Ошибка удаления заметки:', err);
      setError('Не удалось удалить заметку. Пожалуйста, попробуйте позже.');
    }
  };

  // Форматирование даты создания
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Если пользователь не имеет права на просмотр, не показываем компонент
  if (!canViewNotes) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Заметки группы
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Добавить заметку
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Эти заметки видны только Dungeon Master и администраторам. Используйте их для хранения технической информации о группе или сюжетных заметок.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            У группы пока нет заметок
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ mt: 2 }}
          >
            Создать первую заметку
          </Button>
        </Box>
      ) : (
        <List>
          {notes.map((note) => (
            <React.Fragment key={note.id}>
              <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                      {note.title}
                    </Typography>
                    <Chip
                      icon={note.visibility === 'all' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      label={note.visibility === 'all' ? 'Видна всем' : 'Только для DM'}
                      size="small"
                      color={note.visibility === 'all' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenEditDialog(note)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteNote(note.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Создано: {formatDate(note.createdAt)} • 
                  Автор: {note.createdBy?.username || 'Система'}
                </Typography>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Диалог создания заметки */}
      <Dialog open={dialogOpen} onClose={handleCloseDialogs} fullWidth maxWidth="md">
        <DialogTitle>Создание заметки</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Заголовок"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Содержание"
            name="content"
            value={formValues.content}
            onChange={handleInputChange}
            multiline
            rows={8}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Видимость</InputLabel>
            <Select
              name="visibility"
              value={formValues.visibility}
              onChange={handleInputChange}
              label="Видимость"
            >
              <MenuItem value="dm_only">Только для DM</MenuItem>
              <MenuItem value="all">Видна всем участникам группы</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button
            onClick={handleCreateNote}
            variant="contained"
            color="primary"
            disabled={!formValues.title}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования заметки */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} fullWidth maxWidth="md">
        <DialogTitle>Редактирование заметки</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Заголовок"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Содержание"
            name="content"
            value={formValues.content}
            onChange={handleInputChange}
            multiline
            rows={8}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Видимость</InputLabel>
            <Select
              name="visibility"
              value={formValues.visibility}
              onChange={handleInputChange}
              label="Видимость"
            >
              <MenuItem value="dm_only">Только для DM</MenuItem>
              <MenuItem value="all">Видна всем участникам группы</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Отмена</Button>
          <Button
            onClick={handleUpdateNote}
            variant="contained"
            color="primary"
            disabled={!formValues.title}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GroupNotes;