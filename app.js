var app = require('http').createServer(handler), 
io = require('./node_modules/socket.io/lib/socket.io').listen(app), 
fs = require('fs');

app.listen(process.env.PORT, '0.0.0.0');

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.configure(function() {
  io.set('transports', ['xhr-polling']);
  io.set('polling duration', 10);
});

io.sockets.on('connection', function (socket) {  
  io.sockets.emit('this', { will: 'be received by everyone'});
  console.log('Socket connected');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('disconnect', function() {
    console.log('Client disconnected');
  }); 
});
