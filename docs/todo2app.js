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
                context.parent.lastItem = addItem(context);
                return false;
            } else if ((key == 8 || key == 46) && (!event.target.innerText || event.target.innerText == "")) {
                event.preventDefault();
                removeItem(context);
                if (context.parent.lastItem) {
                    renderItems(context.parent.lastItem);
                    if (key != 46 && context.prevItem) {
                        context.prevItem.focus();
                    } else if (key == 46 && context.nextItem) {
                        context.nextItem.focus(true);
                    } else if (context.parent != app && context.parent.lastItem) {
                        context.parent.lastItem.focus(key == 46);
                    }
                } else {
                    setParent(context.parent, []);
                    if (context.parent != app) {
                        context.parent.focus(key == 46);
                    }
                }
                return false;
            } else if (key == 9 && !event.shiftKey) {
                event.preventDefault();
                if (context.prevItem) {
                    var prevItem = context.prevItem,
                        nextItem = context.nextItem,
                        parent = prevItem;
                    prevItem.nextItem = nextItem;
                    nextItem && (nextItem.prevItem = prevItem);

                    context.prevItem = parent.lastItem;
                    context.nextItem = null;
                    context.parent = parent;

                    parent.lastItem = context;

                    renderItems(parent);
                    renderItems(context);
                }
                return false;
            } else if (key == 9 && event.shiftKey) {
                event.preventDefault();
                if (context.parent != app) {
                    var prevItem = context.prevItem,
                        nextItem = context.nextItem,
                        parent = context.parent;

                    if (parent.lastItem == context) {
                        parent.lastItem = prevItem;
                    }

                    prevItem && (prevItem.nextItem = nextItem);
                    nextItem && (nextItem.prevItem = prevItem);

                    context.prevItem = parent;
                    context.nextItem = parent.nextItem;
                    context.parent = parent.parent;

                    parent.nextItem && (parent.nextItem.prevItem = context);
                    parent.nextItem = context;

                    if (parent.lastItem) {
                        renderItems(parent.lastItem);
                    } else {
                        setParent(parent, []);
                    }
                    renderItems(context);
                }
                return false;
            }
        }
        context.focus = function(isStart) {
            var el = context.$get('inputElement'),
                text = context.$get('text') || "",
                textLength = isStart ? 0 : text.length;
            if (textLength > 0) {
                var range = document.createRange(),
                    sel = window.getSelection();
                if (el.childNodes && el.childNodes.length > 0) {
                    range.setStart(el.childNodes[0], textLength);
                }
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            el.focus();
        }
    }
})

var todoItems = [];

app.addItem = function(event) {
    event && event.preventDefault();
    app.lastItem = addItem(app.lastItem);
}

var addItem = function(prevItem) {
    var item = new todoItem();
    item.parent = (prevItem && prevItem.parent) || app;
    item.prevItem = prevItem;
    item.nextItem = prevItem && prevItem.nextItem;
    prevItem && (prevItem.nextItem = item);
    item.nextItem && (item.nextItem.prevItem = item);
    renderItems(item);
    item.focus();
    return item;
}

var renderItems = function(item) {
    var list = [],
        parent = item.parent,
        prevItem = item.prevItem,
        nextItem = item.nextItem;
    list.push(item);
    while (prevItem) {
        list.unshift(prevItem);
        prevItem = prevItem.prevItem;
    }
    while (nextItem) {
        list.push(nextItem);
        nextItem = nextItem.nextItem;
    }
    setParent(parent, list);
}
var setParent = function(parent, list) {
    parent.$set('todoItems', list);
}

var removeItem = function(item) {
    var prevItem = item.prevItem,
        nextItem = item.nextItem;
    prevItem && (prevItem.nextItem = nextItem);
    nextItem && (nextItem.prevItem = prevItem);
    if (item.parent.lastItem == item) {
        item.parent.lastItem = prevItem;
    }
    if (item.parent.lastItem) {
        renderItems(item.parent.lastItem);
    } else {
        setParent(item.parent, []);
    }
}

app.clearAll = function(event) {
    event.preventDefault();
    // pakka.each(todoItems, function(item) {
    //     item.$destroy();
    //     delete item;
    // })
    // todoItems = [];
    // app.$set('todoItems', todoItems);
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
