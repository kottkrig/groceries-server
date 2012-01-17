var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/add"] = requestHandlers.add;
handle["/remove"] = requestHandlers.remove;
handle["/getList"] = requestHandlers.getList;
handle["/clearList"] = requestHandlers.clearList;

server.start(router.route, handle);