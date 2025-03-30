require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd-card-system',
  jwtSecret: process.env.JWT_SECRET || 'your_default_jwt_secret',
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/login'
  },
  adminDiscordId: process.env.ADMIN_DISCORD_ID
};