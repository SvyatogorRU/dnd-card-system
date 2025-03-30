module.exports = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'В доступе отказано. Требуются права администратора' });
  }
  next();
};