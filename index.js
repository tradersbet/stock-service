const http = require('http');
const Websocket = require('websocket').server;

const redis = require('redis');
const client = redis.createClient(); 

const config = require('./config');

//Binance API
const { APIKEY, APISECRET } = config.Binance;
const { CURRENCY } = config.Currency;
const binance = require('node-binance-api')().options({
  APIKEY, 
  APISECRET, 
  useServerTime: true, 
});

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(index);
});

server.listen(8080, () => {
  console.log('Listen port 8080');
});

const ws = new Websocket({
  httpServer: server,
  autoAcceptConnections: false
});

client.on('connect', function() {
    console.log('Redis client connected');
});

const connections = [];

ws.on('request', req => {
  const connection = req.accept('', req.origin);
  connections.push(connection);
  console.log('Connected ' + connection.remoteAddress);
  connection.on('message', message => {
    const dataName = message.type + 'Data';
    const data = message[dataName];
    console.log('Received: ' + data);
    connections.forEach(client => {
      //When new connection to socket 
      if (connection == client) {
        //send information about previous day
        binance.prevDay(CURRENCY, (error, prevDay, symbol) => {
        client.send( prevDay);
        });
      }
    });
  });
  connection.on('close', (reasonCode, description) => {
    console.log('Disconnected ' + connection.remoteAddress);
    console.dir({ reasonCode, description });
  });
});

binance.websockets.candlesticks([CURRENCY], '1m', (candlesticks) => {
  const { 
    e:eventType, 
    E:eventTime, 
    s:symbol, 
    k:ticks, 
  } = candlesticks;
  const price = { 
    open: ticks.o,
    high: ticks.h,
    low: ticks.l, 
    close: ticks.c, 
    volume: ticks.v, 
    trades: ticks.n, 
    interval: ticks.i, 
    isFinal: ticks.x, 
    quoteVolume: ticks.q, 
    buyVolume: ticks.V, 
    quoteBuyVolume: ticks.Q, 
  };
  const prices = JSON.stringify(price);
  client.set('prices', prices, redis.print);
  connections.forEach(client => {
        client.send(prices);
  });
});
