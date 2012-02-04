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

function add(response, listId, data) {
    console.log('Add data: ' + data);
    var item = querystring.parse(data).item;
    if(item === undefined)
        item = JSON.parse(data).item;
        
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

function notFound(response) {
    response.writeHeader(404, {'Content-Length': '0'});
    response.end();
}

function methodNotAllowed(response, allow) {
    response.writeHeader(405, {'Allow': allow, 'Content-Length': '0'});
    response.end();
}    
    
function respond(response, statusCode, contentType, message) {
    response.writeHead(statusCode, {"Content-Type": contentType});
    response.end(message);
}

function respondWithOK(response, message) {
    respond(response, 200, 'text/plain', message);   
}

function respondWithNoContent(response) {
    response.writeHead(204, {'Content-Length': '0'});
    response.end();
}

function respondWithCreated(response, absoluteURI, message) {
    response.writeHead(201, {'Location': absoluteURI, 'Content-Type': 'text/plain'});
    response.end(message);
}

function respondWithJson(response, message) {
    respond(response, 200, 'application/json', message);
}

function respondWithError(response, message) {
    respond(response, 500, 'text/plain', message);
}

exports.android = android;
exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
exports.newList = newList;
exports.methodNotAllowed = methodNotAllowed;
exports.notFound = notFound;