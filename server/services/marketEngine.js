// services/marketEngine.js
const Stock = require('../models/Stock');

// In-memory cache for live prices and day changes
const livePriceMap = new Map();
const sseClients = new Set();
let isEngineRunning = false;

// Market Indices (SENSEX & NIFTY 50)
const liveIndices = {
  sensex: { symbol: 'SENSEX', name: 'BSE SENSEX', currentPrice: 78094.64, dayChange: 0.45 },
  nifty: { symbol: 'NIFTY', name: 'NSE NIFTY 50', currentPrice: 24383.60, dayChange: 0.38 }
};

/**
 * Initializes the market engine by fetching initial prices from MongoDB.
 */
const initMarketEngine = async () => {
  try {
    const stocks = await Stock.find({});
    stocks.forEach(stock => {
      const symKey = stock.symbol ? stock.symbol.toUpperCase() : stock._id.toString();
      livePriceMap.set(symKey, {
        id: stock._id.toString(),
        symbol: stock.symbol,
        name: stock.name,
        type: stock.type,
        currentPrice: stock.currentPrice || 50,
        dayChange: stock.dayChange || 0,
      });
      livePriceMap.set(stock._id.toString(), livePriceMap.get(symKey));
    });
    console.log(`Central Market Engine initialized with ${stocks.length} assets + SENSEX & NIFTY 50.`);
  } catch (err) {
    console.error("Error initializing Central Market Engine:", err.message);
  }
};

/**
 * Executes a single market simulation tick with bullish net-positive trend bias.
 */
const tickMarketSimulation = async () => {
  if (livePriceMap.size === 0) {
    await initMarketEngine();
  }

  const updates = [];
  const updatePromises = [];

  // Update Stock & Mutual Fund prices
  for (const [key, asset] of livePriceMap.entries()) {
    if (key !== asset.symbol?.toUpperCase()) continue;

    const isUp = Math.random() < 0.70;
    const changePct = isUp
      ? (Math.random() * 0.0105 + 0.0015) // +0.15% to +1.20%
      : -(Math.random() * 0.0035 + 0.0005); // -0.05% to -0.40%

    const oldPrice = asset.currentPrice;
    const newPrice = Math.max(5, Math.round(oldPrice * (1 + changePct) * 100) / 100);
    const newDayChange = Math.round((asset.dayChange + (changePct * 100)) * 100) / 100;

    asset.currentPrice = newPrice;
    asset.dayChange = newDayChange;

    const payload = {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      currentPrice: newPrice,
      dayChange: newDayChange
    };

    updates.push(payload);

    updatePromises.push(
      Stock.updateOne({ _id: asset.id }, { $set: { currentPrice: newPrice, dayChange: newDayChange } }).catch(() => {})
    );
  }

  // Update Market Indices (SENSEX & NIFTY) with gentle positive trend
  const sensexIsUp = Math.random() < 0.75;
  const sensexChangePct = sensexIsUp ? (Math.random() * 0.002 + 0.0003) : -(Math.random() * 0.001 + 0.0001);
  liveIndices.sensex.currentPrice = Math.round((liveIndices.sensex.currentPrice * (1 + sensexChangePct)) * 100) / 100;
  liveIndices.sensex.dayChange = Math.round((liveIndices.sensex.dayChange + (sensexChangePct * 100)) * 100) / 100;

  const niftyIsUp = Math.random() < 0.75;
  const niftyChangePct = niftyIsUp ? (Math.random() * 0.002 + 0.0003) : -(Math.random() * 0.001 + 0.0001);
  liveIndices.nifty.currentPrice = Math.round((liveIndices.nifty.currentPrice * (1 + niftyChangePct)) * 100) / 100;
  liveIndices.nifty.dayChange = Math.round((liveIndices.nifty.dayChange + (niftyChangePct * 100)) * 100) / 100;

  updates.push({
    id: 'INDEX_SENSEX',
    symbol: 'SENSEX',
    name: 'BSE SENSEX',
    type: 'Index',
    currentPrice: liveIndices.sensex.currentPrice,
    dayChange: liveIndices.sensex.dayChange
  });

  updates.push({
    id: 'INDEX_NIFTY',
    symbol: 'NIFTY',
    name: 'NSE NIFTY 50',
    type: 'Index',
    currentPrice: liveIndices.nifty.currentPrice,
    dayChange: liveIndices.nifty.dayChange
  });

  Promise.all(updatePromises).catch(() => {});

  if (updates.length > 0 && sseClients.size > 0) {
    const dataString = `data: ${JSON.stringify(updates)}\n\n`;
    for (const clientRes of sseClients) {
      try {
        clientRes.write(dataString);
      } catch (err) {
        sseClients.delete(clientRes);
      }
    }
  }
};

/**
 * Starts the central background market engine loop.
 */
const startMarketEngine = () => {
  if (isEngineRunning) return;
  isEngineRunning = true;

  initMarketEngine().then(() => {
    setInterval(tickMarketSimulation, 3000);
    console.log("Central Market Engine live simulation started with SENSEX & NIFTY 50.");
  });
};

/**
 * Subscribes a client HTTP response stream (SSE) to live central market updates.
 */
const subscribeClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  const snapshot = [
    ...Array.from(livePriceMap.values()).filter(a => a.symbol),
    { id: 'INDEX_SENSEX', symbol: 'SENSEX', name: 'BSE SENSEX', currentPrice: liveIndices.sensex.currentPrice, dayChange: liveIndices.sensex.dayChange },
    { id: 'INDEX_NIFTY', symbol: 'NIFTY', name: 'NSE NIFTY 50', currentPrice: liveIndices.nifty.currentPrice, dayChange: liveIndices.nifty.dayChange }
  ];
  res.write(`data: ${JSON.stringify(snapshot)}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
};

/**
 * Gets the authoritative live market price for a symbol or asset ID.
 */
const getLivePrice = (symbolOrId) => {
  if (!symbolOrId) return null;
  const key = symbolOrId.toString().toUpperCase();
  if (key === 'SENSEX') return liveIndices.sensex.currentPrice;
  if (key === 'NIFTY') return liveIndices.nifty.currentPrice;
  const found = livePriceMap.get(key) || livePriceMap.get(symbolOrId.toString());
  return found ? found.currentPrice : null;
};

/**
 * Gets current live market index quotes for SENSEX and NIFTY.
 */
const getLiveIndices = () => {
  return liveIndices;
};

/**
 * Gets all live asset price objects from the central engine.
 */
const getAllLivePrices = () => {
  return Array.from(livePriceMap.values());
};

module.exports = {
  startMarketEngine,
  subscribeClient,
  getLivePrice,
  getLiveIndices,
  getAllLivePrices,
};
