import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, CircularProgress, Paper, 
  Grid, Divider, Chip, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, ListItemSecondaryAction, IconButton, Tabs, Tab,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  MonetizationOn as MoneyIcon,
  AccountBalance as BankIcon,
  Email as EmailIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroup, getGroupBank } from '../../api/groups';
import { useAuth } from '../../context/AuthContext';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isDungeonMaster } = useAuth();
  const [group, setGroup] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

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
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные группы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  // Изменение вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Проверка, является ли пользователь владельцем группы или имеет особую роль
  const canManageGroup = () => {
    if (!group || !user) return false;
    if (isAdmin || isDungeonMaster) return true;
    
    // Проверяем, является ли пользователь капитаном или заместителем
    const member = group.members?.find(m => m.id === user.id);
    if (!member) return false;
    
    return ['Капитан Группы', 'Заместитель Капитана'].includes(member.GroupMembers?.position);
  };

  // Получение цвета для позиции в группе
  const getPositionColor = (position) => {
    switch (position) {
      case 'Dungeon Master': return 'secondary';
      case 'Капитан Группы': return 'primary';
      case 'Заместитель Капитана': return 'info';
      default: return 'default';
    }
  };

  // Получение URL аватара Discord
  const getAvatarUrl = (member) => {
    if (member.avatar && member.discordId) {
      return `https://cdn.discordapp.com/avatars/${member.discordId}/${member.avatar}.png`;
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
        <Button 
          variant="contained" 
          component={Link} 
          to="/groups" 
          sx={{ mt: 2 }}
        >
          Вернуться к списку групп
        </Button>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Группа не найдена</Alert>
        <Button 
          variant="contained" 
          component={Link} 
          to="/groups" 
          sx={{ mt: 2 }}
        >
          Вернуться к списку групп
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        {/* Заголовок группы */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {group.name}
            </Typography>
            
            {canManageGroup() && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/groups/${groupId}/edit`}
                  sx={{ mr: 1 }}
                >
                  Редактировать
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PersonAddIcon />}
                  component={Link}
                  to={`/groups/${groupId}/members/add`}
                >
                  Добавить участника
                </Button>
              </Box>
            )}
          </Box>
          
          {group.description && (
            <Typography variant="body1" paragraph>
              {group.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              icon={<BankIcon />} 
              label={`Банк: ${bankData?.totalBalance || 0} монет`} 
              color="primary"
              variant="outlined"
            />
            <Chip 
              icon={<PersonAddIcon />} 
              label={`${group.members?.length || 0} участников`} 
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Divider />
        
        {/* Вкладки */}
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Состав группы" />
            <Tab label="Банк группы" />
          </Tabs>
          
          {/* Вкладка состава группы */}
          <TabPanel value={tabValue} index={0}>
            <List>
              {group.members?.length > 0 ? (
                group.members.map((member) => (
                  <ListItem key={member.id} divider>
                    <ListItemAvatar>
                      <Avatar src={getAvatarUrl(member)}>
                        {member.username?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {member.username}
                          {member.GroupMembers?.position && (
                            <Chip 
                              label={member.GroupMembers.position} 
                              size="small"
                              color={getPositionColor(member.GroupMembers.position)}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="email">
                        <EmailIcon />
                      </IconButton>
                      {canManageGroup() && member.id !== user.id && (
                        <IconButton edge="end" aria-label="delete" color="error" sx={{ ml: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="В группе нет участников" />
                </ListItem>
              )}
            </List>
          </TabPanel>
          
          {/* Вкладка банка группы */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Баланс группы: {bankData?.totalBalance || 0} монет
              </Typography>
              
              {(isAdmin || isDungeonMaster) && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MoneyIcon />}
                  component={Link}
                  to={`/groups/${groupId}/bank/add`}
                >
                  Добавить транзакцию
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {bankData?.entries?.length > 0 ? (
              <List>
                {bankData.entries.map((entry) => (
                  <ListItem key={entry.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: entry.amount >= 0 ? 'success.main' : 'error.main' }}>
                        <MoneyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={entry.title}
                      secondary={
                        <>
                          {entry.description && (
                            <Typography variant="body2" component="span" display="block">
                              {entry.description}
                            </Typography>
                          )}
                          <Typography variant="caption" component="span" display="block">
                            Добавлено {new Date(entry.createdAt).toLocaleString()} пользователем {entry.createdBy?.username || 'Система'}
                          </Typography>
                        </>
                      }
                    />
                    <Typography variant="h6" color={entry.amount >= 0 ? 'success.main' : 'error.main'}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                История банка пуста
              </Typography>
            )}
          </TabPanel>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          component={Link}
          to="/groups"
        >
          Вернуться к списку групп
        </Button>
      </Box>
    </Container>
  );
};

export default GroupDetail;