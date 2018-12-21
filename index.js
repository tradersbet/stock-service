const binance = require('node-binance-api')().options({
  APIKEY: "yTGrczsnJIxGnlRTkmHW2dMAAcPoHNUtoqC2SgT5yWKnv2UFjQ7YaM4zP5zO1z1Q",
  APISECRET: "CcpnnqTMCu4S5pAEFcHsEMcVwEPuKyoqqo4ySbTm2LzSHRMTysDbtZ8FFIse1t7Z",
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true // If you want to use sandbox mode where orders are simulated
});

const redis = require('redis');
const client = redis.createClient(); // this creates a new client

client.on('connect', function() {
    console.log('Redis client connected');
});

client.set('my test key', 'my test value', redis.print);
client.get('my test key', function (error, result) {
    if (error) {
        console.log(error);
        throw error;
    }
    console.log('GET result ->' + result);
});