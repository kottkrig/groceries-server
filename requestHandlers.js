//var exec = require("child_process").exec;
var fs = require('fs');
var redis = require('redis-client');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);

function respond(response, statusCode, message) {
    response.writeHead(statusCode, {"Content-Type": "text/plain"});
    response.end(message);
}

function respondWithAllMembersFromDB(response, listName) {
    db.smembers(listName, function(err, value) {
        if (!err) {
            respond(response, 200, "List " + listName + " from database: " + value);
        } else {
            respond(response, 500, "Error fetching members from database");
        }
    });
}

function start(response, postData) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (!err) {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end(data);
        } else {
            respond(response, 500, 'Error loading index.html');
        } 
    });
}

function add(response, postData) {
    db.sadd("shoppingList", postData);
    respondWithAllMembersFromDB(response, "shoppingList");
}

function remove(response, postData) {
    db.srem("shoppingList", postData);
    respondWithAllMembersFromDB(response, "shoppingList");
}

function clearList(response, postData) {
    db.smembers("shoppingList", function(err, members) {
        if(!err) {
            members = members + '';
            var memberList = members.split(',');
            for(var i = 0; i < memberList.length; i++) {
                db.srem("shoppingList", memberList[i]);
            }
            respondWithAllMembersFromDB(response, "shoppingList");
        } else {
            respond(response, 500, 'Error when clearing list');
        }
    });
}

function getList(response, postData) {
    respondWithAllMembersFromDB(response, "shoppingList");   
}

exports.start = start;
exports.add = add;
exports.remove = remove;
exports.getList = getList;
exports.clearList = clearList;
