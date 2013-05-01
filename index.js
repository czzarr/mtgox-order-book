var io = require('socket.io-client');
// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/bitcoin-db", function(err, db) {
  if(!err) {
    console.log("We are connected");
    var stuff = db.collection('stuff');
    var conn = io.connect('https://socketio.mtgox.com/mtgox?Currency=USD');
    conn.on('message', function(data) {
      var thing;
      // Handle incoming data object.
      switch(data.channel_name) {
        case 'trade.BTC':
          thing = {
            type: 'trade',
            timestamp: data.trade.tid,
            amount: data.trade.amount_int,
            price: data.trade.price_int,
            price_currency: data.trade.price_currency,
            trade_type: data.trade.trade_type,
            primary: data.trade.primary,
            properties: data.trade.properties };
          break;
        case 'ticker.BTCUSD':
          thing = {
            type: 'ticker',
            bid: data.ticker.buy.value_int,
            ask: data.ticker.sell.value_int };
          break;
        case 'depth.BTCUSD':
          thing = {
            type: 'depth',
            timestamp: data.depth.now,
            depth_type: data.depth.type_str,
            total_volume: data.depth.total_volume_int,
            volume: data.depth.volume_int,
            currency: data.depth.currency,
            price: data.depth.price_int };
          break;
      }
      if (thing) {
        stuff.insert(thing, { w: 0 });
      }
    });
  }
});
