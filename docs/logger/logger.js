var app = pakka.create({
    elements: [document.body]
});

var bus = pakka.create();
bus.$watch('start', function(id) {
    _.each(logs, function(log) {
        if (log.$get('data.state') == 'started') {
            log.pauseTimer();
        }
    })
});

bus.$watch('stop', function(id) {
    var item, maxTime = 0;
    _.each(logs, function(log) {
        var time = _.last(log.pausedList);
        if (time > maxTime) {
            maxTime = time;
            item = log;
        }
    });

    if (item) {
        item.startTimer();
    }

});

var formatDurationText = function(duration) {

    if (!_.isNumber(duration)) '0s';

    var millis = duration % 1000,
        totalSeconds = (duration - millis) / 1000,
        seconds = totalSeconds % 60,
        totalMinutes = (totalSeconds - seconds) / 60,
        minutes = totalMinutes % 60,
        totalHours = (totalMinutes - minutes) / 60,
        hours = totalHours % 60,
        totalDays = (totalHours - hours) / 60,
        str = [];

    if (totalDays > 0) {
        str.push(totalDays + 'd');
    }
    if (hours > 0) {
        str.push(hours + 'h');
    }
    if (minutes > 0) {
        str.push(minutes + 'm');
    }
    if (seconds > 0) {
        str.push(seconds + 's');
    }
    // if (millis > 0) {
    //     str.push(millis + 'ms');
    // }

    return str.join(' ');
}

var logController = function(context) {

    context.$watch('data.state', function(state) {
        states = {};
        states[state] = true;
        context.$set('states', states);
    })

    context.$set('data.state', 'open');

    var el = context.$get('textElement');

    context.checkEnter = function(event) {
        if (event.keyCode == 13) {
            app.addLog().focus();
        }
        save();
    }

    context.focus = function() {
        el.focus();
    }

    var times = [];
    context.$set('data.times', times);
    context.$watch('data.times', function(_times) {
        times = _times;
    });


    context.startTimer = function() {
        if (times.length == 0 || _.last(times).end) {
            times.push({
                start: new Date().getTime(),
            });
            updateText();
            bus.$set('start', context.$id);
            context.$set('data.state', 'started');
        }
        save();
    }

    context.pausedList = [];
    context.$set('data.pausedList', context.pausedList);
    context.$watch('data.pausedList', function(_pausedList) {
        context.pausedList = _pausedList;
    });

    context.pauseTimer = function() {
        var lastTime = _.last(times);
        if (lastTime && !lastTime.end) {
            lastTime.end = new Date().getTime();
            updateText();
            context.pausedList.push(new Date().getTime());
            bus.$set('pause', context.$id);
            context.$set('data.state', 'paused');
        }
        save();
    }

    context.stopTimer = function() {
        var lastTime = _.last(times);
        if (lastTime && !lastTime.end) {
            lastTime.end = new Date().getTime();
            updateText();
            context.pausedList.pop();
            bus.$set('stop', context.$id);
            context.$set('data.state', 'stopped');
        }
        save();
    }

    var updateText = context.updateText = function() {
        var totalTime = 0;
        var durationComps = context.$get('durationComps') || [];
        if (durationComps.length < times.length) {
            for (var i = 0, len = times.length - durationComps.length; i < len; i++) {
                durationComps.push(context.$createChild(DurationComponent));
            }
        }
        _.each(times, function(time, index) {
            totalTime += (time.end || new Date().getTime()) - time.start;
            durationComps[index].$set('data', time);
        });

        context.$set('durationText', formatDurationText(totalTime));
        context.$set('durationComps', durationComps);
    }

    context.deleteItem = function() {
    	logs = _.filter(logs, function(log){
    		return log.$id != context.$id;
    	});
    	app.$set('logs', logs);
    	context.$destroy();
    	save();
    }
}

var Log = pakka({
    html: app.$get('logTemplate').innerHTML,
    name: 'log-section',
    controller: logController
});

var DurationComponent = pakka({
    html: app.$get('durationTemplate').innerHTML,
    name: 'duration-section',
    controller: function(context) {
        var format = function(date) {
            if (!date) return '';
            return new Date(date).toString('HH:mm:ss');
        };
        context.$watch('data', function(data) {
            context.$set('startText', format(data.start));

            end = data.end || new Date().getTime();
            context.$set('endText', format(end));

            context.$set('durationText', formatDurationText(end - data.start));
        })
    }
});

var logs = [];
app.$set('logs', logs);

app.addLog = function(logData) {
    var item = new Log();
    if (logData) {
        item.$set('data', logData);
    }
    app.$push('logs', item);
    return item;
}

storage = localStorage || sessionStorage;
var loggerData = storage.getItem('loggerData');
if (loggerData) {

    var logsData = JSON.parse(loggerData);
    _.each(logsData, function(logData) {
        app.addLog(logData);
    });

} else {
    app.addLog();
}

var updateText = function() {
    _.each(logs, function(log) {
        log.updateText();
    });
}
var save = function() {
    storage = localStorage || sessionStorage;
    if (storage) {
        var data = [];
        _.each(logs, function(log) {
            data.push(log.$get('data'));
        });
        storage.setItem('loggerData', JSON.stringify(data));
    }
}
var updateAndSave = function() {
    updateText();
    // save();
}
setInterval(updateAndSave, 1000);
