var redis = require('redis');

// Regular DB
//var db = redis.createClient(9443, 'stingfish.redistogo.com');
//var dbAuth = function() {
//  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
//};

// Test DB
var db = redis.createClient(9396, 'drum.redistogo.com');
var dbAuth = function() {
  db.auth('68685117da7182d2a02298b38e3c06aa');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);
dbAuth();

var EMPTY_SET = 'empty';
var LAST_LIST_ID = 0;

function newList(callback) {
    db.incr(LAST_LIST_ID, function(err, newListId) {
        if(err)
            return callback('Could not create new list');
        LAST_LIST_ID = newListId;
        return callback(null, newListId);
    });
}    

function add(listId, item, callback) {
    db.sadd(activeList(listId), item, function(err) {
        if(err)
            return callback('Could not add item');
        return callback(null, listId, item);
    });
}

function remove(listId, item, callback) {
    db.smove(activeList(listId), doneList(listId), item, function(err) {
        if(err)
            return callback('Could not add item to DONE');    
        return callback(null, listId, item);
    }); 
}

function getList(listId, callback) {    
    db.smembers(activeList(listId), function(err, items) {
        if(err)
            return callback('Error when fetching list from database');   
        return callback(null, items);
    });  
}

function clearList(listId, callback) {
    db.sinter(activeList(listId), EMPTY_SET, function(err) {
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