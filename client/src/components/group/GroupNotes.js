import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Paper, 
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const GroupNotes = ({ groupId }) => {
  const [notes, setNotes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim() === '') return;
    
    const note = {
      id: Date.now(),
      content: newNote,
      createdAt: new Date().toISOString(),
      author: 'Dungeon Master'
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
    setShowAddForm(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Заметки Dungeon Master</Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Отменить' : 'Добавить заметку'}
        </Button>
      </Box>
      
      {showAddForm && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Новая заметка"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            margin="normal"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={handleAddNote}>
              Сохранить заметку
            </Button>
          </Box>
        </Paper>
      )}
      
      {notes.length > 0 ? (
        <List>
          {notes.map((note) => (
            <React.Fragment key={note.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={note.author}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                        {note.content}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {new Date(note.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          Нет заметок
        </Typography>
      )}
    </Box>
  );
};

export default GroupNotes;