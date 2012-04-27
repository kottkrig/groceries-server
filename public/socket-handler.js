var socket;

function initSocket(roomId) {
    socket = io.connect();
    console.log('Client is running.');
    socket.emit('connectToList', roomId);
    
    socket.on('message', function(message) {
        console.log('Got message: ' + message);    
    });
    
    socket.on('add', function(itemId) {
        console.log('Received add');
        addItem(itemId);
    });
    
    socket.on('remove', function(itemId) {
        console.log('Received remove');
        removeItem(itemId);
    });
}