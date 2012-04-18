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

function newList(callback) {
    db.incr(LAST_LIST_ID, function(err, newListId) {
        if(err)
            return callback('Could not create new list');
        db.hset(newListId, ACTIVE_ID, newListId + '_active');
        db.hset(newListId, DONE_ID, newListId + '_done');     
        LAST_LIST_ID = newListId;
        return callback(null, newListId);
    });
}    

function add(listId, item, callback) {
    console.log('Item: ' + item);
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return callback('Could not find list');
        db.zcard(activeListId, function(err, cardinality) {
            if(err)
                return callback('Internal server error');
            db.zadd(activeListId, cardinality, item, function(err) {
                if(err)
                    return callback('Could not add item');
                return callback(null, listId, item);
            });
        });
    });
}

function remove(listId, item, callback) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return callback('Could not find list');
        db.hget(listId, DONE_ID, function(err, doneListId) {
            if(err)
                return callback('Could not find list');
            db.zrem(activeListId, item, function(err, value) {
                if(err)
                    return callback('Could not remove item');
                if(value != 1)
                    return callback(null, listId, item); 
                db.zadd(doneListId, 0, item, function(err) {
                    if(err)
                        return callback('Could not add item to DONE');    
                    return callback(null, listId, item);
                }); 
            });
        });
    });
}

function getList(listId, callback) {    
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return callback('Could not find list');   
        db.zrange(activeListId, FIRST_ITEM, LAST_ITEM, function(err, items) {
            if(err)
                return callback('Error when fetching list from database');   
            return callback(null, items);
        });  
    });
}

function clearList(listId, callback) {
    db.hget(listId, ACTIVE_ID, function(err, activeListId) {
        if(err)
            return callback('Could not find list');
        db.zinterstore(activeListId, 2, activeListId, EMPTY_SET, function(err) {
            if(err)
                return callback('Could not clear list');    
            return callback(null);
        });
    });
}

exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
exports.newList = newList;