var app = pakka.create({
    elementsSelector: '#todoapp'
});

var todoItem = pakka({
    html: '<div><input type="checkbox" bind-component=""><input type="text"><button click-handle="remove">&times;</button></div>',
    controller: function(context) {
        var removeCallback = function() {};
        context.remove = function(event) {
        	event && event.preventDefault();
            removeCallback(context);
        }
        context.bindRemoveCallback = function(callback) {
        	removeCallback = callback;
        }
    }
})

var todoItems = [];

app.addItem = function(event) {
    event && event.preventDefault();
    var item = new todoItem();
    item.bindRemoveCallback(function(presentItem){
    	var newItems = [];
    	pakka.each(todoItems, function(item){
    		if(presentItem!=item){
    			newItems.push(item);
    		}
    	});
    	todoItems = newItems;
    	app.$set('todoItems', todoItems);
    })
    todoItems.push(item);
    app.$set('todoItems', todoItems);
}


app.clearAll = function(event) {
    event.preventDefault();
    pakka.each(todoItems, function(item) {
        item.$destroy();
        delete item;
    })
    todoItems = [];
    app.$set('todoItems', todoItems);
}

app.addItem();
app.addItem();
app.addItem();