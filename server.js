import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const title = 'Home';
  res.render('home', { title });
});

app.get('/organizations', async (req, res) => {
  const title = 'Our Partner Organizations';
  res.render('organizations', { title });
});

app.get('/projects', async (req, res) => {
  const title = 'Service Projects';
  res.render('projects', { title });
});

app.get('/categories', async (req, res) => {
  const title = 'Service Project Categories';
  res.render('categories', { title });
});

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
});
