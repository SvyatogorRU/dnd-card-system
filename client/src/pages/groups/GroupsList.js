import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Grid, CircularProgress, Box, 
  Card, CardContent, CardActions, IconButton, Alert, Avatar, Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Group as GroupIcon, 
  Visibility as VisibilityIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getUserGroups } from '../../api/groups';
import { useAuth } from '../../context/AuthContext';

const GroupsList = () => {
  const { isDungeonMaster } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка групп пользователя
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getUserGroups();
        setGroups(groupsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки групп:', err);
        setError('Не удалось загрузить группы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Функция для отображения позиции пользователя в группе
  const getPositionChip = (position) => {
    let color = 'default';
    
    if (position === 'Dungeon Master') color = 'secondary';
    else if (position === 'Капитан Группы') color = 'primary';
    else if (position === 'Заместитель Капитана') color = 'info';
    
    return (
      <Chip 
        label={position || 'Участник'} 
        size="small" 
        color={color}
        sx={{ mt: 1 }}
      />
    );
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Мои группы
        </Typography>
        {isDungeonMaster && (
          <Button
            component={Link}
            to="/groups/new"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Создать группу
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {groups.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Вы не состоите ни в одной группе
          </Typography>
          {isDungeonMaster ? (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Нажмите "Создать группу", чтобы начать
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Обратитесь к Dungeon Master, чтобы присоединиться к группе
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {group.name}
                  </Typography>
                  
                  {/* Показываем позицию в группе */}
                  {group.GroupMembers && getPositionChip(group.GroupMembers.position)}
                  
                  {group.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {group.description}
                    </Typography>
                  )}
                  
                  {/* Отображаем количество участников, если доступно */}
                  {group.members && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <GroupIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {group.members.length} участник(ов)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton 
                    component={Link} 
                    to={`/groups/${group.id}`} 
                    aria-label="просмотр"
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    component={Link} 
                    to={`/groups/${group.id}/bank`} 
                    aria-label="банк"
                    color="secondary"
                  >
                    <BankIcon />
                  </IconButton>
                  {/* Кнопка редактирования только для DM или капитанов */}
                  {(isDungeonMaster || ['Капитан Группы', 'Заместитель Капитана'].includes(group.GroupMembers?.position)) && (
                    <IconButton 
                      component={Link} 
                      to={`/groups/${group.id}/edit`} 
                      aria-label="редактировать"
                      color="info"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default GroupsList;