var fs = require('fs');
var redis = require('redis-client');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);

function respond(response, statusCode, contentType, message) {
    response.writeHead(statusCode, {"Content-Type": contentType});
    response.end(message);
}

function respondWithError(response, message) {
    respond(response, 500, 'text/plain', message);
}

function respondWithList(response, listName) {
    db.smembers(listName, function(err, value) {
        if (!err) {
            respond(response, 200, 'text/plain', "List " + listName + " from database: " + value);
        } else {
            respondWithError(response, 'Error fetching members from database');
        }
    });
}

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
    db.sadd("shoppingList", postData);
    respondWithList(response, 'shoppingList');
}

function remove(response, postData) {
    db.smove('shoppingList', 'autoComplete', postData);
    respondWithList(response, 'shoppingList');
}

function getList(response, postData) {
    respondWithList(response, 'shoppingList');   
}

function clearList(response, postData) {
    db.smembers('shoppingList', function(err, members) {
        if(!err) {
            members = members + '';
            var memberList = members.split(',');
            for(var i = 0; i < memberList.length; i++) {
                db.srem("shoppingList", memberList[i]);
            }
            respondWithList(response, "shoppingList");
        } else {
            respondWithError(response, 'Error when clearing list');
        }
    });
}

exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
