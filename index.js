const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

let posts = [
  { id: 0, username: "testuser", content: "This is a test post!", video: null, comments: [{ username: "testuser", text: "Cool post!" }] }
];
let stocks = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const API_KEY = process.env.API_KEY || 'X4KI94CXTRUWDGHR'; // Use env var for Vercel, fallback for Replit

app.get('/', (req, res) => {
  try {
    res.render('index', { posts, stocks, user: null });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/search', async (req, res) => {
  const ticker = req.query.ticker.toUpperCase();
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`);
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    const quote = data['Global Quote'] || {};
    const stockData = {
      ticker,
      price: quote['05. price'] || 'N/A',
      change: quote['10. change percent'] || 'N/A',
      comments: []
    };
    const existingStock = stocks.find(s => s.ticker === ticker);
    if (!existingStock) {
      stocks.push(stockData);
    } else {
      existingStock.price = stockData.price;
      existingStock.change = stockData.change;
    }
    res.render('index', { posts, stocks, user: null });
  } catch (error) {
    console.error('Search error:', error.message);
    stocks.push({ ticker, price: 'Error', change: 'N/A', comments: [] });
    res.render('index', { posts, stocks, user: null });
  }
});

app.post('/stock-comment/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const { comment } = req.body;
  try {
    const stock = stocks.find(s => s.ticker === ticker);
    if (stock) {
      stock.comments.push({ username: "testuser", text: comment });
    }
    res.redirect('/');
  } catch (error) {
    console.error('Stock comment error:', error);
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
  try {
    res.render('login');
  } catch (error) {
    console.error('Login render error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/signup', (req, res) => {
  try {
    res.render('signup');
  } catch (error) {
    console.error('Signup render error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/post', (req, res) => {
  try {
    res.render('post');
  } catch (error) {
    console.error('Post render error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/post', (req, res) => {
  const { content } = req.body;
  try {
    posts.push({
      id: posts.length,
      username: "testuser",
      content,
      video: null,
      comments: []
    });
    res.redirect('/');
  } catch (error) {
    console.error('Post error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/comment/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { comment } = req.body;
  try {
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.comments.push({ username: "testuser", text: comment });
    }
    res.redirect('/');
  } catch (error) {
    console.error('Post comment error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));