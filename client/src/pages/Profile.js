import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Avatar, Divider, Chip,
  Grid, Card, CardContent, List, ListItem, ListItemText,
  ListItemIcon, CircularProgress, Alert, Button, CardActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  Schedule as ScheduleIcon,
  AccountCircle as AccountIcon,
  Inventory as InventoryIcon,
  PeopleAlt as PeopleAltIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../api/admin';
import { getUserGroups } from '../api/groups';
import { getUserCards, getCardsByType } from '../api/cards';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, isAdmin, isDungeonMaster } = useAuth();
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [items, setItems] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка профиля пользователя и связанной информации
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Основные данные профиля
        const profilePromise = getUserProfile();
        const groupsPromise = getUserGroups();
        const charactersPromise = getCardsByType('character');
        
        const promises = [profilePromise, groupsPromise, charactersPromise];
        
        // Если пользователь DM или админ, загружаем также NPC и предметы
        if (isAdmin || isDungeonMaster) {
          promises.push(getCardsByType('npc'));
          promises.push(getCardsByType('item'));
        }
        
        const results = await Promise.all(promises);
        
        setProfile(results[0]);
        setGroups(results[1]);
        setCharacters(results[2]);
        
        if (isAdmin || isDungeonMaster) {
          setNpcs(results[3]);
          setItems(results[4]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных профиля:', err);
        setError('Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, isDungeonMaster]);

  // Функция для получения URL аватара Discord
  const getAvatarUrl = () => {
    if (profile?.avatar && profile?.discordId) {
      return `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`;
    }
    return null;
  };

  // Функция для получения цвета должности в группе
  const getPositionColor = (position) => {
    switch (position) {
      case 'Dungeon Master': return 'secondary';
      case 'Капитан Группы': return 'primary';
      case 'Заместитель Капитана': return 'info';
      default: return 'default';
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Мой профиль
      </Typography>
      
      <Grid container spacing={4}>
        {/* Левая колонка - информация о пользователе */}
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
                {(!profile?.roles || profile?.roles.length === 0) && (
                  <Chip label="Нет ролей" variant="outlined" color="warning" />
                )}
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
          
          {/* Права доступа */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} /> Права доступа
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
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
                  <ListItemText 
                    primary="У вас нет специальных ролей" 
                    secondary="Для получения ролей обратитесь к администратору или Dungeon Master" 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Правая колонка - дополнительная информация */}
        <Grid item xs={12} md={8}>
          {/* Секция персонажей */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                <PersonIcon sx={{ mr: 1 }} /> Мои персонажи
              </Typography>
              <Button 
                component={Link} 
                to="/characters" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                Ко всем персонажам
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {characters.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  У вас пока нет персонажей
                </Typography>
                <Button 
                  component={Link} 
                  to="/characters/new" 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                >
                  Создать персонажа
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {characters.slice(0, 3).map(character => (
                  <Grid item xs={12} sm={6} md={4} key={character.id}>
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
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/characters/${character.id}`}
                        >
                          Открыть
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {characters.length > 3 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Button 
                        component={Link} 
                        to="/characters" 
                        variant="outlined" 
                        size="small"
                      >
                        Показать больше ({characters.length - 3})
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
          
          {/* Секция групп */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                <GroupIcon sx={{ mr: 1 }} /> Мои группы
              </Typography>
              <Button 
                component={Link} 
                to="/groups" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                Ко всем группам
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {groups.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  Вы не состоите ни в одной группе
                </Typography>
                {(isAdmin || isDungeonMaster) && (
                  <Button 
                    component={Link} 
                    to="/groups/new" 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                  >
                    Создать группу
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={2}>
                {groups.slice(0, 3).map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{group.name}</Typography>
                        {group.GroupMembers?.position && (
                          <Chip 
                            label={group.GroupMembers.position} 
                            size="small" 
                            sx={{ mt: 1 }}
                            color={getPositionColor(group.GroupMembers.position)}
                          />
                        )}
                        {group.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {group.description.length > 70 
                              ? `${group.description.substring(0, 70)}...` 
                              : group.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/groups/${group.id}`}
                        >
                          Открыть
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {groups.length > 3 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Button 
                        component={Link} 
                        to="/groups" 
                        variant="outlined" 
                        size="small"
                      >
                        Показать больше ({groups.length - 3})
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
          
          {/* Секция NPC - только для DM и админов */}
          {(isAdmin || isDungeonMaster) && npcs && npcs.length > 0 && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                  <PeopleAltIcon sx={{ mr: 1 }} /> NPC
                </Typography>
                <Button 
                  component={Link} 
                  to="/npcs" 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                >
                  Ко всем NPC
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                {npcs.slice(0, 3).map(npc => (
                  <Grid item xs={12} sm={6} md={4} key={npc.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{npc.name}</Typography>
                        {npc.content.npc_type && (
                          <Chip 
                            label={npc.content.npc_type} 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        )}
                        {npc.content.challenge_rating && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Опасность: {npc.content.challenge_rating}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/npcs/${npc.id}`}
                        >
                          Открыть
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {npcs.length > 3 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Button 
                        component={Link} 
                        to="/npcs" 
                        variant="outlined" 
                        size="small"
                      >
                        Показать больше ({npcs.length - 3})
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
          
          {/* Секция предметов - только для DM и админов */}
          {(isAdmin || isDungeonMaster) && items && items.length > 0 && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                  <InventoryIcon sx={{ mr: 1 }} /> Предметы
                </Typography>
                <Button 
                  component={Link} 
                  to="/items" 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                >
                  Ко всем предметам
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                {items.slice(0, 3).map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        {item.content.item_type && (
                          <Chip 
                            label={item.content.item_type} 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        )}
                        {item.content.rarity && (
                          <Chip 
                            label={item.content.rarity} 
                            size="small"
                            variant="outlined" 
                            sx={{ ml: 1, mt: 1 }}
                          />
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/items/${item.id}`}
                        >
                          Открыть
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {items.length > 3 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Button 
                        component={Link} 
                        to="/items" 
                        variant="outlined" 
                        size="small"
                      >
                        Показать больше ({items.length - 3})
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
          
          {/* Если нет карточек вообще */}
          {characters.length === 0 && groups.length === 0 && 
           (!isAdmin && !isDungeonMaster || (npcs.length === 0 && items.length === 0)) && (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                У вас пока нет активных карточек или групп
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Создайте свою первую карточку персонажа или присоединитесь к группе
              </Typography>
              <Button
                component={Link}
                to="/characters/new"
                variant="contained"
                color="primary"
                sx={{ mx: 1 }}
              >
                Создать персонажа
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;