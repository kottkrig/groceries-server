var http = require("http");
var socketIo = require('socket.io'); 
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");
    
        route(handle, pathname, response);
    }
    
    var app = http.createServer(onRequest);
    var port = process.env.PORT || 8080;
    app.listen(port);
    console.log("Server has started.");

    var io = socketIo.listen(app);
    
    io.configure(function() {
        io.set('transports', ['xhr-polling']);
        io.set('polling duration', 10);
    });
    
    function onConnection(socket) {
        io.sockets.emit('this', { will: 'be received by everyone'});
        console.log('Socket connected');
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
        socket.on('disconnect', function() {
            console.log('Client disconnected');
        });
        socket.on('set nickname', function(name) {
            socket.set('nickname', name, function() {
                socket.emit('ready');
            });
        });
        socket.on('chat message', function(msg) {
            socket.get('nickname', function(err, name) {
                console.log('Chat message by ' + name + ': ' + msg);
            });
        });
    }
        
    io.sockets.on('connection', onConnection);
}


exports.start = start;
