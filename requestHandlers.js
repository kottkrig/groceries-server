//var exec = require("child_process").exec;
var fs = require('fs');
var redis = require('redis-client');
var db = redis.createClient(9443, 'stingfish.redistogo.com');
var dbAuth = function() {
  db.auth('eeabd0f6182a690e0c0c1df7556c85ae');
};

db.addListener('connected', dbAuth);
db.addListener('reconnected', dbAuth);

//var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

function start(response, postData) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      response.writeHead(500);
      return response.end('Error loading index.html');
    }

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(data);
    response.end();
  });
}

function add(response, postData) {   
    console.log("Request handler 'add' was called.");
    db.set("message", postData);
    db.get("message", function(err, value) {
        response.writeHead(200, {"Content-Type": "text/plain"});
          response.write("Hello Add!");
          response.write("From database: " + value);
          response.end();
    });
  
}

exports.start = start;
exports.add = add;
