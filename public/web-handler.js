var listId;

$(document).ready(function() {
    if(listId === undefined || listId === "")
        listId = '8';
    initSocket(listId);
    getListFromServer(listId);
});

function initList(items) {
    $('#list').html("<ul></ul>");
    $.each(items, function(key, val) {
        addItem(val);
    });
}

function removeItem(item) {
    $('#list ul #' + item).remove();
}

function addItem(item) {
    $('#list ul').append('<li id="' + clearWhitespace(item) + '"><p>' + item + '</p>' + 
        '<button type="button" class="removeButton">Remove</button></li>');
    addItemToServer(item);
    $(".removeButton").click(function() {
        var item = $(this).parent().attr('id');
        removeItemFromServer(restoreWhitespace(item));
        removeItem(item);
    });
}

function clearWhitespace(text) {
    return text.replace(/ /g, '__');
}

function restoreWhitespace(text) {
    return text.replace('__', ' ');
}

function addButtonClicked() {
    addItem($("#addInput").val());
}

function broadcastAdd(itemId, listId) {
    socket.broadcast.to(listId).emit('add', {itemId: itemId, item:restoreWhitespace(itemId)});
}

function broadcastRemove(itemId, listId) {
    socket.broadcast.to(listId).emit('add', {itemId: itemId});
}