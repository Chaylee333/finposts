const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const app = express();

let users = [];
let posts = [
  {
    id: 0,
    username: "testuser",
    content: "This is a test post!",
    video: null,
    comments: [{ username: "testuser", text: "Cool post!" }]
  }
];

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  console.log('Rendering homepage', { posts, user: req.session.user });
  res.render('index', { posts, user: req.session.user });
});

app.get('/lectures', (req, res) => {
  res.send('Lectures page coming soon! <a href="/">Back</a>');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.send(`Dashboard for ${req.session.user}! <a href="/">Back</a>`);
});

// Existing routes (login, signup, post, etc.) remain unchanged...

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send('Login failed. <a href="/login">Try again</a>');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    res.send('Username taken. <a href="/signup">Try again</a>');
  } else {
    users.push({ username, password });
    req.session.user = username;
    res.redirect('/');
  }
});

app.get('/profile/:username', (req, res) => {
  const profileUser = req.params.username;
  const userPosts = posts.filter(p => p.username === profileUser);
  res.render('profile', { profileUser, userPosts, user: req.session.user });
});

app.get('/post', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('post');
});

app.post('/post', upload.single('video'), (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { content } = req.body;
  const video = req.file ? `/uploads/${req.file.filename}` : null;
  posts.push({
    id: posts.length,
    username: req.session.user,
    content,
    video,
    comments: []
  });
  res.redirect('/');
});

app.post('/comment/:postId', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const postId = parseInt(req.params.postId);
  const { comment } = req.body;
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.comments.push({ username: req.session.user, text: comment });
  }
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(3000, () => console.log('Server running on port 3000'));