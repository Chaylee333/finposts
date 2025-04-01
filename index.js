const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Add this for API calls
const app = express();

let posts = [
  { id: 0, username: "testuser", content: "This is a test post!", video: null, comments: [{ username: "testuser", text: "Cool post!" }] }
];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Alpha Vantage API key (replace with your own)
const API_KEY = 'X4KI94CXTRUWDGHR'; // Get this from alphavantage.co

app.get('/', (req, res) => {
  res.render('index', { posts, user: null, searchResult: null });
});

app.get('/search', async (req, res) => {
  const ticker = req.query.ticker.toUpperCase();
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`);
    const data = await response.json();
    const quote = data['Global Quote'];
    let searchResult;
    if (quote && quote['05. price']) {
      searchResult = {
        ticker,
        price: quote['05. price'], // Current price
        change: quote['10. change percent'] || 'N/A' // Percentage change
      };
    } else {
      searchResult = { ticker, price: 'N/A', change: 'N/A' };
    }
    res.render('index', { posts, user: null, searchResult });
  } catch (error) {
    console.error('API Error:', error);
    res.render('index', { posts, user: null, searchResult: { ticker, price: 'Error', change: 'N/A' } });
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