var handle = require('./requestHandlers');
var assert = require('assert');

exports["test adding to empty list results in list with one element"] = 
function() {
//    handle.newList(function(err, newListId) {
//        assert.ifError(err);
//        
//        // List is empty to begin with
//        handle.getList(newListId, function(err, items) {
//            assert.ifError(err);
//            assert.strictEquals(items, {"items": []});
//            
//            // Adding one element to the list
//            handle.add(newListId, 'test', function(err) {
//                assert.ifError(err);
//                
//                handle.getList(newListId, function(err, items) {
//                    assert.ifError(err);
//                    assert.strictEquals(items, {"items": ["test"]});
//                });
//            });
//        });
//    });
};