var app = pakka.create({
    elementsSelector: '#todoapp'
});

var todoItem = pakka({
    name: 'todo-item',
    html: document.getElementById('todo-item-template').innerHTML,
    controller: function(context) {
        var removeCallback = function() {};
        context.$set('data', {
            isSelected: false,
            text: '',
            notes: []
        });
        context.remove = function(event) {
            event && event.preventDefault();
            // removeItem(context);
            detach(context);
        }
        context.$watch('data.text', function(value) {
            saveData();
        });
        context.$watch('data.isSelected', function(value) {
            if (value == true) {
                context.$set('stateClass', {
                    'selected': true
                })
            } else {
                context.$set('stateClass', {
                    'selected': false
                })
            }
            saveData();
        });
        context.copyToClipboard = function(event) {
            if (document.selection) {
                var range = document.body.createTextRange();
                range.moveToElementText(context.$get('inputElement'));
                range.select().createTextRange();
                document.execCommand("Copy");
            } else if (window.getSelection) {
                var range = document.createRange();
                range.selectNode(context.$get('inputElement'));
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand("Copy");
            }
        }
        context.checkKey = function(event) {
            var key = event.keyCode || event.charCode;
            if (key == 13) {
                event.preventDefault();
                var item = new todoItem();
                appendAfter(context.parent, item, context);
                item.focus();
                saveData();
                return false;
            } else if ((key == 8 || key == 46) && (!event.target.innerText || event.target.innerText == "")) {
                event.preventDefault();
                var nextItem = context.nextItem,
                    prevItem = context.prevItem;

                detach(context);

                key == 46 && nextItem && nextItem.focus();
                key == 8 && prevItem && prevItem.focus();

                saveData();
                return false;
            } else if (key == 9 && !event.shiftKey) {
                event.preventDefault();
                var parent = context.prevItem;
                if (parent) {
                    detach(context);
                    appendAfter(parent, context);
                }
                context.focus();
                saveData();
                return false;
            } else if (key == 9 && event.shiftKey) {
                event.preventDefault();
                var after = context.parent;
                if (after != app) {
                    var parent = after.parent;
                    if (parent) {
                        detach(context);
                        appendAfter(parent, context, after);
                    }
                }
                context.focus();
                saveData();
                return false;
            } else if (key == 38 && !event.shiftKey) {
                event.preventDefault();
                var prevItem = context.prevItem;
                if (!prevItem) {
                    prevItem = context.parent;
                } else {
                    while (prevItem.lastItem) {
                        prevItem = prevItem.lastItem;
                    }
                }
                prevItem && prevItem != app && prevItem.focus();
                saveData();
                return false;
            } else if (key == 40 && !event.shiftKey) {
                event.preventDefault();
                var nextItem;
                if (!nextItem) {
                    nextItem = context.lastItem;
                    if (nextItem) {
                        while (nextItem.prevItem) {
                            nextItem = nextItem.prevItem;
                        }
                    }
                }
                if (!nextItem) {
                    nextItem = context.nextItem;
                }
                if (!nextItem) {
                    nextItem = context;
                    while (!nextItem.nextItem && nextItem.parent) {
                        nextItem = nextItem.parent;
                    }
                    nextItem = nextItem.nextItem;
                }
                nextItem && nextItem.focus();
                saveData();
                return false;
            } else if (key == 38 && event.shiftKey) {
                event.preventDefault();
                var prevItem = context.prevItem;
                if (prevItem && prevItem != app) {
                    detach(context);
                    appendBefore(prevItem.parent, context, prevItem);
                    context.focus();
                    saveData();
                }
                return false;
            } else if (key == 40 && event.shiftKey) {
                event.preventDefault();
                var nextItem = context.nextItem;
                if (nextItem) {
                    detach(context);
                    appendAfter(nextItem.parent, context, nextItem);
                    context.focus();
                    saveData();
                }
                return false;
            } else if (key == 32 && event.shiftKey) {
                event.preventDefault();
                context.$set('data.isSelected', !context.$get('data.isSelected'));
                return false;
            }
        };
        context.focus = function(isStart) {
            var el = context.$get('inputElement'),
                text = context.$get('data.text') || "",
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
    var item = new todoItem();
    appendAfter(app, item);
    item.focus();
};

var appendBefore = function(parent, item, before) {
    if (!before) {
        before = parent.lastItem;
        while (before.prevItem) {
            before = before.prevItem;
        }
    }
    if (before) {
        item.prevItem = before.prevItem;
        before.prevItem = item;
        item.nextItem = before;
    } else {
        item.prevItem = null;
        item.nextItem = null;
    }
    item.parent = parent;
    renderItems(parent, item);
}

var appendAfter = function(parent, item, after, isSilent) {
    after = after || parent.lastItem;
    if (after) {
        item.nextItem = after.nextItem;
        after.nextItem = item;
        item.prevItem = after;
    } else {
        item.prevItem = null;
        item.nextItem = null;
    }
    if (parent.lastItem == after) {
        parent.lastItem = item;
    }
    item.parent = parent;
    renderItems(parent, item, isSilent);
};

var detach = function(item) {
    var prevItem = item.prevItem,
        nextItem = item.nextItem,
        parent = item.parent;

    item.parent = null;
    prevItem && (prevItem.nextItem = nextItem);
    nextItem && (nextItem.prevItem = prevItem);

    item.nextItem = null;
    item.prevItem = null;
    item.parent = null;

    if (item == parent.lastItem) {
        parent.lastItem = nextItem || prevItem;
    }

    renderItems(parent, prevItem || nextItem || parent.lastItem);
};

var getData = function(item) {
    return item.$properties.data;
};

var renderItems = function(parent, item, isSilent) {
    var list = [],
        data = isSilent ? [] : parent.$properties.data.notes;
    while (data.length > 0) {
        data.pop();
    }
    if (item) {
        var prevItem = item.prevItem,
            nextItem = item.nextItem;
        list.push(item);
        data.push(getData(item));
        while (prevItem) {
            list.unshift(prevItem);
            data.unshift(getData(prevItem));
            prevItem = prevItem.prevItem;
        }
        while (nextItem) {
            list.push(nextItem);
            data.push(getData(nextItem));
            nextItem = nextItem.nextItem;
        }
    }
    parent.$set('todoItems', list);
};

var saveData = function() {},
    setData = function(parent, notes) {
        pakka.each(notes, function(data) {
            var item = new todoItem();
            item.$set('data', data);
            if (data.notes.length > 0) {
                setData(item, data.notes);
            }
            appendAfter(parent, item, null, true);
        })
    },
    startFresh = function() {
        app.$set('data', {
            notes: []
        })
        app.addItem();
    };
if (localStorage) {
    saveData = function() {
        localStorage.setItem('todoapp2', JSON.stringify(app.$properties.data.notes))
    }
    data = localStorage.getItem('todoapp2');
    if (data) {
        data = JSON.parse(data);
        app.$set('data', {
            notes: data
        });
        setData(app, data);
    } else {
        startFresh();
    }
} else {
    startFresh();
}
