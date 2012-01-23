var fs = require('fs');
var querystring = require('querystring');
var redis = require('redis');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);
dbAuth();

var ACTIVE_LIST = "list";
var COMPLETED = "completed";
var EMPTY_SET = 'empty';

function start(response, postData) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (!err) {
            respond(response, 200, 'text/html', data);
        } else {
            respondWithError(response, 'Error loading index.html');
        } 
    });
}

function add(response, postData) {
    var json = querystring.parse(postData);
    db.sadd(ACTIVE_LIST, json.item, function(err, value) {
        if(!err) {
            respondWithOK(response, 'Successfully added item');  
        } else {
            respondWithError(response, 'Could not add item');    
        }
    });
    //io.sockets.emit('update', { hello: 'world' });
}

function remove(response, postData) {
    var json = querystring.parse(postData);
    db.smove(ACTIVE_LIST, COMPLETED, json.item, function(err, value) {
        if(!err) {
            respondWithOK(response, 'Successfully removed item');  
        } else {
            respondWithError(response, 'Could not remove item');    
        }
    });
}

function getList(response, query) {
    db.smembers(ACTIVE_LIST, function(err, members) {
        if(!err) {
            var jsonString = querystring.stringify(members);
            var json = querystring.parse(jsonString);
            
            var items = [];
            for(var i = 0; i < members.length; i++) {
                items[i] = json[i];
            }
            var itemsJsonString = JSON.stringify({'items': items});
            
            respondWithOK(response, 'List ' + ACTIVE_LIST + ': ' + itemsJsonString);
        } else {
            respondWithError(response, 'Error when fetching list from database');   
        }
    });
}

function clearList(response, postData) {
    db.sinterstore(ACTIVE_LIST, EMPTY_SET, function(err, value) {
        if(!err) {
            respondWithOK(response, 'Successfully cleared list');  
        } else {
            respondWithError(response, 'Could not clear list');    
        }
    });
}   

function respond(response, statusCode, contentType, message) {
    response.writeHead(statusCode, {"Content-Type": contentType});
    response.end(message);
}

function respondWithOK(response, message) {
    respond(response, 200, 'text/plain', message);   
}

function respondWithError(response, message) {
    respond(response, 500, 'text/plain', message);
}    

exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
