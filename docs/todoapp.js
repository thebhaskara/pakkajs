var app = pakka.create({
    elementsSelector: '#todoapp'
});

var todoItem = pakka({
    name: 'todo-item',
    html: document.getElementById('todo-item-template').innerHTML,
    controller: function(context) {
        var removeCallback = function() {};
        context.remove = function(event) {
            event && event.preventDefault();
            removeItem(context);
        }
        context.$watch('isSelected', function(value) {
            if (value == true) {
                context.$set('stateClass', {
                    'selected': true
                })
            } else {
                context.$set('stateClass', {
                    'selected': false
                })
            }
        });
        context.checkKey = function(event) {
            var key = event.keyCode || event.charCode;

            if (key == 13) {
                event.preventDefault();
                app.addItem(null, context);
                return false;
            } else if ((key == 8 || key == 46) && (!event.target.innerText || event.target.innerText == "")) {
                event.preventDefault();
                removeItem(context);
                return false;
            }
        }
        context.focus = function() {
            var el = context.$get('inputElement'),
                text = context.$get('text') || "",
                textLength = text.length;
            if (textLength > 0) {
                var range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(el.childNodes[0], textLength);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            el.focus();
        }
    }
})

var todoItems = [],
    removeItem = function(presentItem) {
        var newItems = [],
            prevItem;
        pakka.each(todoItems, function(item, index) {
            if (presentItem != item) {
                newItems.push(item);
            } else if (index > 0) {
                prevItem = todoItems[index - 1];
            }
        });
        todoItems = newItems;
        app.$set('todoItems', todoItems);
        prevItem && prevItem.focus();
    };

app.addItem = function(event, currentItem) {
    event && event.preventDefault();
    var item = new todoItem();
    if (currentItem) {
        var newItems = [];
        pakka.each(todoItems, function(i) {
            newItems.push(i);
            if (i == currentItem) {
                newItems.push(item);
            }
        });
        todoItems = newItems;
    } else {
        todoItems.push(item);
    }
    app.$set('todoItems', todoItems);
    item.focus();
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


app.selectAll = function(event) {
    event.preventDefault();
    pakka.each(todoItems, function(item) {
        item.$set('isSelected', true);
    })
}


app.invertSelection = function(event) {
    event.preventDefault();
    pakka.each(todoItems, function(item) {
        item.$set('isSelected', !item.$get('isSelected'));
    })
}


app.deselectAll = function(event) {
    event.preventDefault();
    pakka.each(todoItems, function(item) {
        item.$set('isSelected', false);
    })
}

app.addItem();