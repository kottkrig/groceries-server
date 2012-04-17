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

function newList(response) {
    db.incr(LAST_LIST_ID, function(err, newListId) {
        if(err)
            return response.send('Could not create new list', 500);
        db.hset(newListId, ACTIVE_ID, newListId + '_active');
        db.hset(newListId, DONE_ID, newListId + '_done');     
        LAST_LIST_ID = newListId;
        response.header('Location', 'http://groceries-server.akire.c9.io/list/' + newListId);
        response.send(201);
    });
}    

function add(response, listId, item, serverSocket) {
    console.log('Item: ' + item);
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return response.send('Could not find list', 500);
        db.zcard(activeListId, function(err, cardinality) {
            if(err)
                return response.send('Internal server error', 500);
            db.zadd(activeListId, cardinality, item, function(err) {
                if(err)
                    return response.send('Could not add item', 500);
                response.send();
                serverSocket.to(listId).emit('add', { "item": item });
            });
        });
    });
}

function remove(response, listId, item, serverSocket) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return response.send('Could not find list', 500);
        db.hget(listId, DONE_ID, function(err, doneListId) {
            if(err)
                return response.send('Could not find list', 500);
            db.zrem(activeListId, item, function(err, value) {
                if(err)
                    return response.send('Could not remove item', 500);
                if(value != 1)
                    return response.send(); 
                db.zadd(doneListId, 0, item, function(err) {
                    if(err)
                        return response.send('Could not add item to DONE', 500);    
                    response.send();
                    serverSocket.to(listId).emit('remove', { "item": item });
                }); 
            });
        });
    });
}

function getList(response, listId) {    
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return response.send('Could not find list', 500);   
        db.zrange(activeListId, FIRST_ITEM, LAST_ITEM, function(err, items) {
            if(err)
                return response.send('Error when fetching list from database', 500);   
            response.json(items);
        });  
    });
}

function clearList(response, listId) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return response.send('Could not find list', 500);
        db.zinterstore(activeListId, 2, activeListId, EMPTY_SET, function(err) {
            if(err)
                return response.send('Could not clear list', 500);    
            response.send();
        });
    });
}

exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
exports.newList = newList;