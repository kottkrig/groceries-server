//var exec = require("child_process").exec;
var fs = require('fs');

function start(response) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      response.writeHead(500);
      return res.end('Error loading index.html');
    }

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(data);
    response.end();
  });
}

function add(response) {
  console.log("Request handler 'add' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Add!");
  response.end();
}


exports.start = start;
exports.add = add;