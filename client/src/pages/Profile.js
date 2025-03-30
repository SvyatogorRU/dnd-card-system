import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Avatar, Divider, Chip,
  Grid, Card, CardContent, List, ListItem, ListItemText,
  ListItemIcon, CircularProgress, Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  Schedule as ScheduleIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { getUserProfile } from '../api/admin';
import { getUserGroups } from '../api/groups';
import { getUserCards, getCardsByType } from '../api/cards';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка профиля пользователя и связанной информации
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, groupsData, charactersData] = await Promise.all([
          getUserProfile(),
          getUserGroups(),
          getCardsByType('character')
        ]);
        
        setProfile(profileData);
        setGroups(groupsData);
        setCharacters(charactersData);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных профиля:', err);
        setError('Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для получения URL аватара Discord
  const getAvatarUrl = () => {
    if (profile?.avatar && profile?.discordId) {
      return `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`;
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={getAvatarUrl()}
                alt={profile?.username}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {profile?.username?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {profile?.username}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {profile?.isAdmin && (
                  <Chip color="error" label="Администратор" />
                )}
                {profile?.roles?.map(role => (
                  <Chip key={role.id} label={role.name} variant="outlined" />
                ))}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Discord ID" 
                  secondary={profile?.discordId || 'Не указан'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Дата регистрации" 
                  secondary={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Неизвестно'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Последний вход" 
                  secondary={profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Неизвестно'} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} /> Мои персонажи
                </Typography>
                
                {characters.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    У вас пока нет персонажей
                  </Typography>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {characters.map(character => (
                      <Grid item xs={12} sm={6} key={character.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6">{character.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {character.content.race && character.content.class ? 
                                `${character.content.race}, ${character.content.class}` : 
                                'Нет данных о расе и классе'}
                            </Typography>
                            {character.content.level && (
                              <Typography variant="body2" color="text.secondary">
                                Уровень: {character.content.level}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupIcon sx={{ mr: 1 }} /> Мои группы
                </Typography>
                
                {groups.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Вы не состоите ни в одной группе
                  </Typography>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {groups.map(group => (
                      <Grid item xs={12} sm={6} key={group.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6">{group.name}</Typography>
                            {group.GroupMembers?.position && (
                              <Chip 
                                label={group.GroupMembers.position} 
                                size="small" 
                                sx={{ mt: 1 }}
                                color={
                                  group.GroupMembers.position === 'Dungeon Master' ? 'secondary' :
                                  group.GroupMembers.position === 'Капитан Группы' ? 'primary' :
                                  'default'
                                }
                              />
                            )}
                            {group.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {group.description}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} /> Права доступа
                </Typography>
                
                <List>
                  {profile?.roles?.length > 0 ? (
                    profile.roles.map(role => (
                      <ListItem key={role.id}>
                        <ListItemIcon>
                          <BadgeIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={role.name} 
                          secondary={role.description || 'Нет описания'} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="У вас нет специальных ролей" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;