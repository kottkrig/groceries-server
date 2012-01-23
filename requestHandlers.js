var fs = require('fs');
var querystring = require('querystring');
var redis = require('redis-client');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);

var ACTIVE_LIST = "list";
var COMPLETED = "completed";

function start(response, postData) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (!err) {
            respond(response, 200, 'text/html', data);
        } else {
            respondWithError(response, 'Error loading index.html');
        } 
    });
}

function add(response, postData, io) {
    var postValues = querystring.parse(postData);
    db.sadd(ACTIVE_LIST, postValues.item);
    
    io.sockets.emit('update', { hello: 'world' });
    respond(response, 200, "text/plain", "successfully added");
}

function remove(response, postData) {
    var postValues = querystring.parse(postData);
    db.smove(postValues.listId, 'autoComplete', postValues.item);
    respondWithList(response, postValues.listId);
}

function getList(response, query) {
    respondWithList(response, ACTIVE_LIST);   
}

function clearList(response, postData) {
    var postValues = querystring.parse(postData);
    db.smembers(postValues.listId, function(err, members) {
        if(!err) {
            members = members + '';
            var memberList = members.split(',');
            for(var i = 0; i < memberList.length; i++) {
                db.srem(postValues.listId, memberList[i]);
            }
            respondWithList(response, postValues.listId);
        } else {
            respondWithError(response, 'Error when clearing list');
        }
    });
}

function respond(response, statusCode, contentType, message) {
    response.writeHead(statusCode, {"Content-Type": contentType});
    response.end(message);
}

function respondWithError(response, message) {
    respond(response, 500, 'text/plain', message);
}

function respondWithList(response, listId) {
    db.smembers(listId, function(err, value) {
        if (!err) {
            respond(response, 200, 'text/plain', "List " + listId + " from database: " + value);
        } else {
            respondWithError(response, 'Error fetching members from database');
        }
    });
}

exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
