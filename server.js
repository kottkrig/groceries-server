var express = require('express');

function start(handle) {    
    var app = express.createServer();
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    
    app.get('/list/:listId', function(request, response) {
        console.log('Get list');
        handle.getList(response, request.params.listId);
    });

    app.post('/list', function(request, response) {
        handle.newList(response);
    });
    
    app.post('/list/:listId', function(request, response) {
        handle.add(response, request.params.listId, request.body.item);
    });
    
    app.del('/list/:listId', function(request, response) {
        handle.clearList(response, request.params.listId);
    });
    
    app.del('/list/:listId/:item', function(request, response) {
        handle.remove(response, request.params.listId, request.params.item);
    });

    app.listen(process.env.PORT || 3000);
    console.log("Server has started.");
    
/*
    // Socket config for Heroku
    io.configure(function() {
        io.set('transports', ['xhr-polling']);
        io.set('polling duration', 10);
    });
*/
} 

exports.start = start;