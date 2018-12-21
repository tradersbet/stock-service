'use strict';

const http = require('http');
const Websocket = require('websocket').server;

const redis = require('redis');
const client = redis.createClient(); 

const binance = require('node-binance-api')().options({
  APIKEY: "yTGrczsnJIxGnlRTkmHW2dMAAcPoHNUtoqC2SgT5yWKnv2UFjQ7YaM4zP5zO1z1Q",
  APISECRET: "CcpnnqTMCu4S5pAEFcHsEMcVwEPuKyoqqo4ySbTm2LzSHRMTysDbtZ8FFIse1t7Z",
  useServerTime: true, 
});

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(index);
});

server.listen(8000, () => {
  console.log('Listen port 8000');
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
      if (connection !== client) {
        client.send(data);
      }
    });
  });
  connection.on('close', (reasonCode, description) => {
    console.log('Disconnected ' + connection.remoteAddress);
    console.dir({ reasonCode, description });
  });
});


binance.websockets.miniTicker(markets => {
  let prices = JSON.stringify(markets);
  client.set('prices', prices, redis.print);
  connections.forEach(client => {
        client.send(prices);
  });
});
