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

function start(response, postData) {
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
        respondWithOK(response, newListId + '');
    });
}    

function add(response, listId, item) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return respondWithError(response, 'Could not find list');
        db.zadd(activeListId, 0, item, function(err, value) {
            if(err)
                return respondWithError(response, 'Could not add item');
            respondWithOK(response, 'Successfully added item');
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
                    return respondWithOK(response, 'Item not in list'); 
                db.zadd(doneListId, 0, item, function(err, value) {
                    if(err)
                        return respondWithError(response, 'Could not add item to DONE');    
                    respondWithOK(response, 'Successfully removed item'); 
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

function clearList(response, postData) {
    var json = querystring.parse(postData);
    db.hget(json.listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return respondWithError(response, 'Could not find list');
        db.zinterstore(activeListId, 2, activeListId, EMPTY_SET, function(err, value) {
            if(err)
                return respondWithError(response, 'Could not clear list');    
            respondWithOK(response, 'Successfully cleared list');
        });
    });
}

function badRequest(response, statusCode) {
    switch(statusCode) {
    case 404: 
        respond(response, 404, 'text/plain', '404 Not found');
        break;
    case 405:
        respond(response, 405, 'text/plain', '405 Method not allowed');   
        break;
    }
}

function respond(response, statusCode, contentType, message) {
    response.writeHead(statusCode, {"Content-Type": contentType});
    response.end(message);
}

function respondWithOK(response, message) {
    respond(response, 200, 'text/plain', message);   
}

function respondWithJson(response, message) {
    respond(response, 200, 'application/json', message);
}

function respondWithError(response, message) {
    respond(response, 500, 'text/plain', message);
}

exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
exports.newList = newList;
exports.badRequest = badRequest;