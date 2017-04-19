var TodoApp = pakka.create('.todoApp'),
    globcount = 0,
    TodoItem = pakka({
        name: 'todo-item',
        html: '<li><div>' +
            '<input type="text" bind-property="text">' +
            '<span bind-text="text1"></span>' +
            '<span class="status" bind-text="status" click-handle="toggleStatus"></span>' +
            '</div></li>',
        css: '.todo-item .status{ margin:0 5px; color:blue; }',
        controller: function(context) {
            var statuses = [
                'open',
                'in progress',
                'done',
            ]
            context.$set('text1', globcount++);
            context.toggleStatus = function() {
                var $status = context.$get('status'),
                    $index = -1;
                pakka.each(statuses, function(status, index) {
                    if (status === $status) {
                        $index = index;
                        return false;
                    }
                });
                $index++;
                if ($index == statuses.length) {
                    $index = 0;
                }
                context.$set('status', statuses[$index]);
            }
            context.toggleStatus();
        }
    });
TodoApp.addItem = function(event) {
    // var list1 = TodoApp.$get('todoComponents') || [];
    event.preventDefault();
    for (var i = 0; i < (200); i++) {
        var asdf = new TodoItem();
        list1.push(asdf);
        TodoApp.$listen(asdf, 'text', function() {
            console.log(JSON.stringify(arguments));
        });
    }
    var time = new Date().getTime();
    TodoApp.$set('todoComponents', list1);
    TodoApp.$set('time', new Date().getTime() - time);
    TodoApp.$set('count', list1.length);
}
TodoApp.removeItem = function(event) {
    // var list1 = TodoApp.$get('todoComponents') || [];
    event.preventDefault();
    for (var i = 0; i < (Math.random() * 100); i++) {
        list1.pop();
    }
    var time = new Date().getTime();
    TodoApp.$set('todoComponents', list1);
    TodoApp.$set('time', new Date().getTime() - time);
    TodoApp.$set('count', list1.length);
}
var shuffleTimesTotal = 0,
    shuffleTimesCount = 0,
    shuffleTimer;
TodoApp.shuffleItemsTimer = function(event) {
    if (shuffleTimer) {
        clearInterval(shuffleTimer);
        shuffleTimer = null;
    } else {
        shuffleTimesTotal = 0;
        shuffleTimesCount = 0;
        shuffleTimer = setInterval(TodoApp.shuffleItems, 100);
    }
}
TodoApp.shuffleItems = function(event) {
    event && event.preventDefault();
    var shuffledList = [];
    var arr = getRandomOrderedIndexes(list1.length);
    pakka.each(arr, function(i) {
        shuffledList.push(list1[i]);
    });
    var time = new Date().getTime();
    TodoApp.$set('todoComponents', shuffledList);
    shuffleTimesTotal += new Date().getTime() - time;
    shuffleTimesCount++;
    TodoApp.$set('time', shuffleTimesTotal / shuffleTimesCount);
    TodoApp.$set('count', list1.length);
}
var getRandomOrderedIndexes = function(length) {
    var index, arr = [],
        unique, tempArr = [];
    for (var i = 0; i < length; i++) {
        tempArr.push(i);
    }
    for (i = 0; i < length; i++) {
        index = parseInt(Math.random() * tempArr.length);
        arr.push(tempArr[index]);
        tempArr.splice(index, 1);
    }
    return arr;
}
TodoApp.$set('todoComponent', new TodoItem());
var item1 = new TodoItem(),
    item2 = new TodoItem(),
    item3 = new TodoItem(),
    item4 = new TodoItem(),
    list1 = [item1, item2, item3, item4],
    list2 = [item4, item2, item1, item3];
//TodoApp.$set('todoComponents', list1);
// setTimeout(function() {
//     TodoApp.$set('todoComponents', list2);
// }, 2000);

// var asd = {
//     a: {
//         b: 20
//     }
// }
// var handle = TodoApp.$watch('asd', function(asd) {
//     console.log(JSON.stringify(asd));
// })
// TodoApp.$set('asd', asd);
// TodoApp.$set('asd.a.c', 30);
// TodoApp.$unwatch(handle)
// TodoApp.$set('asd.a.d', 30);


// TodoApp.$set('myArray', [{ name: 'Bhaskara' }, { name: 'Divakara' }]);
// TodoApp.$set('myArray[0].name', 'status');
// TodoApp.$set('myArray[0].pappu', 'cant dance');



// var Model = function(options) {
//     this.options = options;
//     this.attributes = {};
// }

// Model.prototype.set = function(prop, value) {
//     _.set(this.attributes, prop, value);
// }

// Model.prototype.get = function(prop) {
//     return _.get(this.attributes, prop);
// }

// var AjaxModel = function(options) {
//     Model.call(this, options);

//     console.log('function called');
// }

// // AjaxModel.prototype = new Model();
// AjaxModel.prototype = _.extend({}, Model.prototype);
// AjaxModel.prototype.constructor = AjaxModel;

// var cloneFactory = function(constructor, factory, options) {
//     factory = factory || function() {};
//     options = options || {};

//     var child = function() {
//         factory.apply(this, arguments);
//         constructor.apply(this, arguments);
//     }
//     child.prototype = _.extend(options, factory.prototype);
//     child.prototype.constructor = factory;

//     return child;
// }

// AjaxModel.prototype.fetch = function() {
//     console.log('fetch called');
// }

// console.log(AjaxModel);
// var a = new AjaxModel();
// a.set('a', 'bhaskar')
// console.log(a);
// var b = new Model();
// b.set('a', 'rama')
// console.log(b);

TodoApp.beforeDestroy = function() {
    // list1 = [];
    // TodoApp.$set('todoComponents', []);
    var list1 = TodoApp.$get('todoComponents');
    _.each(list1, function(item) { item.$destroy(); });
    console.log('before destroy executed');
}

var anotherTodoApp = pakka.create({
    elements: [document.getElementById('otherApp')],
});

function startAnother() {
    anotherTodoApp.$set('todoComponents', list1);
}
