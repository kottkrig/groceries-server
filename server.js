var express = require('express');
var http = require('http');
var socketIo = require('socket.io');

function start(handle) {    
    var app = express();
    var server = http.createServer(app);
    var io = socketIo.listen(server);

    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    
    app.get('/list/:listId', function(request, response) {
        handle.getList(response, request.params.listId);
    });

    app.post('/list', function(request, response) {
        handle.newList(response);
    });
    
    app.post('/list/:listId', function(request, response) {
        handle.add(response, request.params.listId, request.body.item, io.sockets);
    });
    
    app.del('/list/:listId', function(request, response) {
        handle.clearList(response, request.params.listId);
    });
    
    app.del('/list/:listId/:item', function(request, response) {
        handle.remove(response, request.params.listId, request.params.item, io.sockets);
    });

    server.listen(process.env.PORT || 3000);
    console.log("Server has started.");
    
    
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
            console.log('Client connected to list ' + listId);
        });
                
        socket.on('disconnect', function() {
            socket.leave(socket.listId);
            console.log('Client disconnected from list ' + socket.listId);
        });
        
        socket.on('message', function(message) {
            console.log('Server got message: ' + message);    
        });
    });
} 

exports.start = start;