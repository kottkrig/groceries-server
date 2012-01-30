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
                route(handle, pathname, response, postData);
                emitUpdate();
            }
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

    io.of('/8').on('connection', function(socket) {
        socket.on('disconnect', function() {
            console.log('Client disconnected');
        });
        
        socket.on('listChanged', function() {
            console.log('List changed');
        });
    });
    
    function emitUpdate() {
        io.of('/8').emit('update');
    }
} 

exports.start = start;