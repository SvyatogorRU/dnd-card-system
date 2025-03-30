import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AuthProvider, { useAuth } from './context/AuthContext';

// Импорт компонентов
import Header from './components/common/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CardDetail from './pages/CardDetail';
import Admin from './pages/Admin';
import CardForm from './components/card/CardForm';
import Home from './pages/Home';

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
            
            <Route path="/cards/:cardId" element={
              <ProtectedRoute>
                <CardDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/cards/new" element={
              <ProtectedRoute>
                <CardForm />
              </ProtectedRoute>
            } />
            
            <Route path="/cards/:cardId/edit" element={
              <ProtectedRoute>
                <CardForm isEdit={true} />
              </ProtectedRoute>
            } />
            
            {/* Админ-маршруты */}
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
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