const express = require('express');
const path = require('path');
const app = express();

let posts = [
  { id: 0, username: "testuser", content: "This is a test post!", video: null, comments: [{ username: "testuser", text: "Cool post!" }] }
];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  try {
    res.render('index', { posts, user: null });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/lectures', (req, res) => {
  res.send('Lectures page coming soon! <a href="/">Back</a>');
});

app.get('/dashboard', (req, res) => {
  res.send('Dashboard coming soon! <a href="/">Back</a>');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/post', (req, res) => {
  res.render('post');
});

app.post('/post', (req, res) => {
  const { content } = req.body;
  posts.push({
    id: posts.length,
    username: "testuser",
    content,
    video: null,
    comments: []
  });
  res.redirect('/');
});

app.post('/comment/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { comment } = req.body;
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.comments.push({ username: "testuser", text: comment });
  }
  res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));