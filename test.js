var TodoApp = pakka.create('.todoApp'),
    TodoItem = pakka({
        name: 'todo-item',
        html: '<div>' +
            '<input type="text" bind-property="text">' +
            '<span bind-text="text"></span>' +
            '<span class="status" bind-text="status" click-handle="toggleStatus"></span>' +
            '</div>',
        css: '.todo-item .status{ margin:0 5px; color:blue; }',
        controller: function(context) {
            var statuses = [
                'open',
                'in progress',
                'done',
            ]
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
}, 10000);

var asd = {
    a: {
        b: 20
    }
}
TodoApp.$set('asd', asd);
TodoApp.$set('asd.a.c', 30);

