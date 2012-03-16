var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle.android = requestHandlers.android;
handle.iphone = requestHandlers.iphone;
handle.add = requestHandlers.add;
handle.remove = requestHandlers.remove;
handle.getList = requestHandlers.getList;
handle.clearList = requestHandlers.clearList;
handle.newList = requestHandlers.newList;
handle.notFound = requestHandlers.notFound;
handle.methodNotAllowed = requestHandlers.methodNotAllowed;

server.start(router.route, handle);