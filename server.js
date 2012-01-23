var http = require("http");
var socketIo = require('socket.io'); 
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var postData = '';
        var uri = url.parse(request.url, true);
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");
        
        request.setEncoding('utf8');
        
        request.addListener('data', function(data) {
            postData += data;
        });
        
        request.addListener('end', function() {
            if(request.method == 'GET') {
                route(handle, pathname, response, uri.query);
            } else {
                route(handle, pathname, response, postData, io);
            }
        });
    }
    
    var app = http.createServer(onRequest);
    var port = process.env.PORT;
    app.listen(port);
    console.log("Server has started.");

    var io = socketIo.listen(app);
    
    // Socket config for Heroku
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
    }
        
    io.sockets.on('connection', onConnection);
}

exports.start = start;