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
    event.preventDefault();
    for (var i = 0; i < (Math.random() * 100); i++) {
        list1.push(new TodoItem());
    }
    var time = new Date().getTime();
    TodoApp.$set('todoComponents', list1);
    TodoApp.$set('time', new Date().getTime() - time);
    TodoApp.$set('count', list1.length);
}
TodoApp.removeItem = function(event) {
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
TodoApp.$set('todoComponents', list1);
setTimeout(function() {
    TodoApp.$set('todoComponents', list2);
}, 2000);

var asd = {
    a: {
        b: 20
    }
}
TodoApp.$set('asd', asd);
TodoApp.$set('asd.a.c', 30);

TodoApp.$set('myArray', [{ name: 'Bhaskara' }, { name: 'Divakara' }]);
TodoApp.$set('myArray[0].name', 'status');
TodoApp.$set('myArray[0].pappu', 'cant dance');
