// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const profileRouter = require('./routes/profile');
const portfolioRouter = require('./routes/portfolio');
const investmentRouter = require('./routes/investment');
const exploreRouter = require('./routes/explore');
const askExpertsRouter = require('./routes/askExperts');
const watchlistRouter = require('./routes/watchlist');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect('your-mongodb-connection-string', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

// Mount routers
app.use('/api/profile', profileRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/investment', investmentRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/ask-experts', askExpertsRouter);
app.use('/api/watchlist', watchlistRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
