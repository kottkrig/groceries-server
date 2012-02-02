function route(handle, paths, httpMethod, response, item) {
    console.log('About to route a ' + httpMethod + ' request.');
    
    if(paths[0] == 'list') {
        if(paths.length == 1) {
            if(httpMethod =='POST')
                handle.newList(response);
            else
                handle.badRequest(response, 405);
        } else if(paths.length == 2) {
            var listId = paths[1];
            switch (httpMethod) {
            case 'DELETE':
                handle.remove(response, listId, item);
                break;
            case 'GET':
                handle.getList(response, listId);
                break;
            case 'POST':
                handle.add(response, listId, item);
                break;
            default:
                handle.badRequest(response, 405);
                break;
            }
        } else {
            handle.badRequest(response, 404);
        }
    } else {
        handle.badRequest(response, 404);
    }        
}

exports.route = route;