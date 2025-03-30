import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AuthProvider, { useAuth } from './context/AuthContext';

// Импорт компонентов
import Header from './components/common/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CardDetail from './pages/CardDetail';
import CardForm from './components/card/CardForm';
import Home from './pages/Home';
import Admin from './pages/Admin';
import RoleManagement from './pages/admin/RoleManagement';
import UserManagement from './pages/admin/UserManagement';
import FieldManagement from './pages/admin/FieldManagement';
import CharactersList from './pages/cards/CharactersList';
import NpcsList from './pages/cards/NpcsList';
import ItemsList from './pages/cards/ItemsList';
import GroupsList from './pages/groups/GroupsList';
import GroupDetail from './pages/groups/GroupDetail';
import GroupForm from './pages/groups/GroupForm';
import Profile from './pages/Profile';

// Создание темы
const theme = createTheme({
  palette: {
    primary: {
      main: '#7b1fa2', // Фиолетовый - основной цвет для D&D тематики
    },
    secondary: {
      main: '#ff9800', // Оранжевый для акцентов
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

// Защищенный маршрут
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null; // Или показать индикатор загрузки
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Маршрут с проверкой роли
const RoleRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasAnyRole, isAdmin } = useAuth();
  
  if (loading) {
    return null; // Или показать индикатор загрузки
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin && !hasAnyRole(roles)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Админ-маршрут
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null; // Или показать индикатор загрузки
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Защищенные маршруты */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Маршруты для карточек персонажей */}
            <Route path="/characters" element={
              <ProtectedRoute>
                <CharactersList />
              </ProtectedRoute>
            } />
            
            <Route path="/characters/new" element={
              <ProtectedRoute>
                <CardForm type="character" />
              </ProtectedRoute>
            } />
            
            <Route path="/characters/:cardId" element={
              <ProtectedRoute>
                <CardDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/characters/:cardId/edit" element={
              <ProtectedRoute>
                <CardForm type="character" isEdit={true} />
              </ProtectedRoute>
            } />
            
            {/* Маршруты для NPC */}
            <Route path="/npcs" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <NpcsList />
              </RoleRoute>
            } />
            
            <Route path="/npcs/new" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <CardForm type="npc" />
              </RoleRoute>
            } />
            
            <Route path="/npcs/:cardId" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <CardDetail />
              </RoleRoute>
            } />
            
            <Route path="/npcs/:cardId/edit" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <CardForm type="npc" isEdit={true} />
              </RoleRoute>
            } />
            
            {/* Маршруты для предметов */}
            <Route path="/items" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <ItemsList />
              </RoleRoute>
            } />
            
            <Route path="/items/new" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <CardForm type="item" />
              </RoleRoute>
            } />
            
            <Route path="/items/:cardId" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <CardDetail />
              </RoleRoute>
            } />
            
            <Route path="/items/:cardId/edit" element={
              <RoleRoute roles={['Dungeon Master', 'Card Creator']}>
                <CardForm type="item" isEdit={true} />
              </RoleRoute>
            } />
            
            {/* Маршруты для групп */}
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsList />
              </ProtectedRoute>
            } />
            
            <Route path="/groups/new" element={
              <RoleRoute roles={['Dungeon Master']}>
                <GroupForm />
              </RoleRoute>
            } />
            
            <Route path="/groups/:groupId" element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/groups/:groupId/edit" element={
              <RoleRoute roles={['Dungeon Master', 'Group Captain']}>
                <GroupForm isEdit={true} />
              </RoleRoute>
            } />
            
            {/* Админ-маршруты */}
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            
            <Route path="/admin/roles" element={
              <AdminRoute>
                <RoleManagement />
              </AdminRoute>
            } />
            
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            
            <Route path="/admin/fields" element={
              <AdminRoute>
                <FieldManagement />
              </AdminRoute>
            } />
            
            {/* Маршрут "404" */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;