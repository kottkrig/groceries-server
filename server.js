var http = require("http");
var socketIo = require('socket.io'); 
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var postData = '';
        var pathname = url.parse(request.url).pathname;
        var paths = pathname.split('/');
        paths.shift(); //Remove first elem (empty because pathname starts with '/')
        
        console.log("Request for " + pathname + " received.");
        
        request.setEncoding('utf8');
        request.addListener('data', function(data) {
            postData += data;
        });
        request.addListener('end', function() {
            if(pathname == '/')
                handle['/'](response, postData);
            else
                route(handle, paths, request.method, response, postData);
        });
    }
    
    var app = http.createServer(onRequest);
    var port = process.env.PORT;
    app.listen(port);
    console.log("Server has started.");

    var io = socketIo.listen(app);
/*
    // Socket config for Heroku
    io.configure(function() {
        io.set('transports', ['xhr-polling']);
        io.set('polling duration', 10);
    });
*/
    io.sockets.on('connection', function(socket) {
        socket.on('connectToList', function(listId) {
            socket.join(listId);
            socket.listId = listId;
            socket.broadcast.to(listId).send('I have joined the list');
        });
        
        socket.on('disconnect', function() {
            socket.leave(socket.listId);
            console.log('Client disconnected');
        });
        
        socket.on('listChanged', function(listId) {
            console.log('List ' + listId + ' changed');
            socket.broadcast.to(listId).emit('update');
        });
        
        socket.on('message', function(message) {
            console.log('Server got message: ' + message);    
        });
    });
} 

exports.start = start;