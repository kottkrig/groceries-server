var io = require('socket.io');
var socket;
var listUri = '/list';
var listId;

function initSocket() {
    socket = io.connect();
    
    socket.on('connect', function() {
        socket.emit('connectToList', listId);
    }); 
    
    socket.on('add', function(data) {
        // Add item to list
        console.log('Add ' + data.item + ' to list');
    });
    
    socket.on('remove', function(data) {
        // Remove item from list
        console.log('Remove ' + data.item + ' from list');
    });
    
    socket.on('message', function(message) {
        console.log('Got message: ' + message);    
    });
}

function getListId() {
    $.post(listUri, function(data) {
        console.log("New list created: "+data);
        localStorage.listId = data;
    });
}
    
function getList() {
    var url = listUri + '/' + localStorage.listId;
    $.getJSON(
        url, 
        function(items) {
            // Show list in GUI
            console.log('Got list from server');
        }
    );
}

function addItem(item) {
    var url = listUri + '/' + localStorage.listId;
    $.post(
        url, 
        { "item": item }, 
        addItemToGUI(item)
    );
}

function addItemToGUI(item) {
    // Add item to GUI
    console.log('Added ' + item + ' to GUI');
}

function removeItem(item) {
    var url = listUri + '/' + localStorage.listId + '/' + item;
    $.ajax({
        type: 'DELETE',
        url: url,
        success: removeItemFromGUI(item)
    });
}

function removeItemFromGUI(item) {
    // Remove item from GUI list
    console.log('Removed ' + item + ' from GUI');
}

function connectToList(listId) {
    socket.emit('connectToList', listId);
    console.log('Connected to list ' + listId);
} 