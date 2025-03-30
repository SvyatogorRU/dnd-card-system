module.exports = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    // Если администратор - пропускаем проверку
    if (req.user.isAdmin) {
      return next();
    }

    // Если требуется массив ролей - проверяем наличие хотя бы одной
    if (Array.isArray(requiredRoles)) {
      const userRoleNames = req.user.roles.map(role => role.name);
      const hasRole = requiredRoles.some(role => userRoleNames.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({ 
          message: 'В доступе отказано. У вас нет необходимых прав.' 
        });
      }
    } 
    // Если требуется конкретная роль
    else if (typeof requiredRoles === 'string') {
      const hasRole = req.user.roles.some(role => role.name === requiredRoles);
      
      if (!hasRole) {
        return res.status(403).json({ 
          message: `В доступе отказано. Требуется роль "${requiredRoles}".` 
        });
      }
    }

    next();
  };
};