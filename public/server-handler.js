var listUri = '/list';

function getListId() {
    $.post(listUri, function(data) {
        console.log("New list created: "+data);
        listId = data;
    });
}

function getListFromServer() {
    var url = listUri + '/' + listId;
    $.getJSON(url, initList);
}

function addItemToServer(item) {
    var url = listUri + '/' + listId;
    $.post(url, {item: item});
}

function removeItemFromServer(item) {
    var url = listUri + '/' + listId + '/' + item;
    $.ajax({
        type: 'DELETE',
        url: url
    });
}

function clearList() {
    var url = listUri + '/' + listId;
    $.ajax({
        type: 'DELETE',
        url: url
    });
}

function setListId() {
    localStorage.listId = $('#setListInput').val();
    socket.emit('connectToList', listId);
    console.log('Connected to list ' + listId);
    getList();
}    