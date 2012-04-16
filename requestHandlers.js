var fs = require('fs');
var redis = require('redis');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);
dbAuth();

var ACTIVE_ID = 'activeId';
var DONE_ID = 'doneId';
var EMPTY_SET = 'empty';
var LAST_LIST_ID = 0;

var FIRST_ITEM = 0;
var LAST_ITEM = -1;

function android(response) {
    fs.readFile(__dirname + '/index_android.html', function (err, data) {
        if(err)
            respondWithError(response, 'Error loading index_android.html');
        respond(response, 200, 'text/html', data); 
    });
}

function iphone(response) {
    fs.readFile(__dirname + '/index_iphone.html', function (err, data) {
        if(err)
            respondWithError(response, 'Error loading index_iphone.html');
        respond(response, 200, 'text/html', data); 
    });
}

function start(response) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if(err)
            respondWithError(response, 'Error loading index.html');
        respond(response, 200, 'text/html', data); 
    });
}

function newList(response) {
    db.incr(LAST_LIST_ID, function(err, newListId) {
        if(err)
            return respondWithError(response, 'Could not create new list');
        db.hset(newListId, ACTIVE_ID, newListId + '_active');
        db.hset(newListId, DONE_ID, newListId + '_done');     
        LAST_LIST_ID = newListId;
        var serverListURI = 'http://groceries-server.akire.c9.io/list/';
        var absoluteURI = serverListURI + newListId;
        respondWithCreated(response, absoluteURI, newListId + '');
    });
}    

function add(response, listId, item) {
    console.log('Item: ' + item);
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return respondWithError(response, 'Could not find list');
        db.zcard(activeListId, function(err, cardinality) {
            if(err)
                return respondWithError(response, '500 Internal server error');
            db.zadd(activeListId, cardinality, item, function(err, value) {
                if(err)
                    return respondWithError(response, 'Could not add item');
                respondWithNoContent(response);
            });
        });
    });
}

function remove(response, listId, item) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return respondWithError(response, 'Could not find list');
        db.hget(listId, DONE_ID, function(err, doneListId) {
            if(err)
                return respondWithError(response, 'Could not find list');
            db.zrem(activeListId, item, function(err, value) {
                if(err)
                    return respondWithError(response, 'Could not remove item');
                if(value != 1)
                    return respondWithNoContent(response); 
                db.zadd(doneListId, 0, item, function(err, value) {
                    if(err)
                        return respondWithError(response, 'Could not add item to DONE');    
                    respondWithNoContent(response);
                }); 
            });
        });
    });
}

function getList(response, listId) {    
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return respondWithError(response, 'Could not find list');   
        db.zrange(activeListId, FIRST_ITEM, LAST_ITEM, function(err, members) {
            if(err)
                return respondWithError(response, 'Error when fetching list from database');   
            var items = [];
            for(var i = 0; i < members.length; i++)
                items[i] = members[i];
            var itemsJsonString = JSON.stringify({'items': items});
            console.log('Items json string: ' + itemsJsonString);
            respondWithJson(response, itemsJsonString);
        });  
    });
}

function clearList(response, listId) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return respondWithError(response, 'Could not find list');
        db.zinterstore(activeListId, 2, activeListId, EMPTY_SET, function(err, value) {
            if(err)
                return respondWithError(response, 'Could not clear list');    
            respondWithNoContent(response);
        });
    });
}

function emitUpdateToRoom(serverSocket, listId) {
    serverSocket.to(listId).emit('update');
    console.log('List ' + listId + ' changed');
}

function notFound(response) {
    var headers = {};
    headers['Content-Length'] = '0';
    respond(response, 404, headers);
}

function methodNotAllowed(response, allow) {
    var headers = {};
    headers['Content-Length'] = '0';
    headers['Allow'] = allow;
    respond(response, 405, headers);
}    
    
function respond(response, statusCode, headers, message) {
    response.writeHead(statusCode, headers);
    if(message !== undefined)
        response.write(message);
    response.end();
}

function respondWithOK(response, message) {
    var headers = {};
    headers['Content-Type'] = 'text/plain';
    headers['Content-Length'] = message.length;
    respond(response, 200, headers, message);   
}

function respondWithNoContent(response) {
    var headers = {};
    headers['Content-Length'] = '0';
    respond(response, 204, headers);
}

function respondWithCreated(response, absoluteURI, message) {
    var headers = {};
    headers['Content-Type'] = 'text/plain';
    headers['Content-Length'] = message.length;
    headers['Location'] = absoluteURI;
    respond(response, 201, headers, message);
}

function respondWithJson(response, message) {
    var headers = {};
    headers['Content-Type'] = 'application/json, charset=utf-8';
    // TODO When Content-Length is set, the whole message is not sent.
    // NO IDEA WHY?!?!?!?!?!
    //headers['Content-Length'] = message.length;
    respond(response, 200, headers, message);
}

function respondWithError(response, message) {
    var headers = {};
    headers['Content-Type'] = 'text/plain';
    headers['Content-Length'] = message.length;
    respond(response, 500, headers, message);
}

exports.android = android;
exports.iphone = iphone;
exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
exports.newList = newList;
exports.methodNotAllowed = methodNotAllowed;
exports.notFound = notFound;