var TodoApp = pakka.create('.todoApp'),
    TodoItem = pakka({
        html: '<div>' +
            '<input type="text" bind-property="text">' +
            '<span class="status" bind-text="status" click-handle="toggleStatus"></span>' +
            '</div>',
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
