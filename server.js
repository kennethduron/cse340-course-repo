import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';
import { errorHandler, notFoundHandler } from './src/controllers/errors.js';
import flash from './src/middleware/flash.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(flash);

app.use((req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session && req.session.user);
  res.locals.user = req.session.user || null;
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
});
