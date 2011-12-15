var exec = require("child_process").exec;

function start(response) {
  console.log("Request handler 'start' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Start");
  response.end();
}

function add(response) {
  console.log("Request handler 'add' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Add!");
  response.end();
}


exports.start = start;
exports.add = add;