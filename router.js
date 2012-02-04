function route(handle, paths, httpMethod, response, data) {
    console.log('About to route a ' + httpMethod + ' request.');
    
    var listId;
    var item;
    
    if(paths[0] == 'list') {
        if(paths.length == 1) {
            if(httpMethod =='POST')
                handle.newList(response);
            else
                handle.notFound(response);
        } else if(paths.length == 2) {
            listId = decodeURIComponent(paths[1]);
            switch (httpMethod) {
            case 'DELETE':
                handle.clearList(response, listId);
                break;
            case 'GET':
                handle.getList(response, listId);
                break;
            case 'POST':
                handle.add(response, listId, data);
                break;
            default:
                handle.methodNotAllowed(response, ['DELETE', 'GET', 'POST']);
                break;
            }
        } else if(paths.length == 3) {
            listId = decodeURIComponent(paths[1]);
            item = decodeURIComponent(paths[2]);
            if(httpMethod == 'DELETE')
                handle.remove(response, listId, item);
            else
                handle.methodNotAllowed(response, ['DELETE']);
        } else {
            handle.notFound(response);
        }
    } else {
        handle.notFound(response);
    }        
}

exports.route = route;