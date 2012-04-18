var redis = require('redis');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);
dbAuth();

var EMPTY_SET = 'empty';
var LAST_LIST_ID = 0;

var FIRST_ITEM = 0;
var LAST_ITEM = -1;

function newList(callback) {
    db.incr(LAST_LIST_ID, function(err, newListId) {
        if(err)
            return callback('Could not create new list');
        LAST_LIST_ID = newListId;
        return callback(null, newListId);
    });
}    

function add(listId, item, callback) {
    db.zcard(activeList(listId), function(err, cardinality) {
        if(err)
            return callback('Internal server error');
        db.zadd(activeList(listId), cardinality, item, function(err) {
            if(err)
                return callback('Could not add item');
            return callback(null, listId, item);
        });
    });
}

function remove(listId, item, callback) {
    db.zrem(activeList(listId), item, function(err, value) {
        if(err)
            return callback('Could not remove item');
        if(value != 1)
            return callback(null, listId, item); 
        db.zadd(doneList(listId), 0, item, function(err) {
            if(err)
                return callback('Could not add item to DONE');    
            return callback(null, listId, item);
        }); 
    });
}

function getList(listId, callback) {    
    db.zrange(activeList(listId), FIRST_ITEM, LAST_ITEM, function(err, items) {
        if(err)
            return callback('Error when fetching list from database');   
        return callback(null, items);
    });  
}

function clearList(listId, callback) {
    db.zinterstore(activeList(listId), 2, activeList(listId), EMPTY_SET, function(err) {
        if(err)
            return callback('Could not clear list');    
        return callback(null);
    });
}

function activeList(listId) {
    return listId + '_active';
}

function doneList(listId) {
    return listId + '_done';
}

exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
exports.newList = newList;