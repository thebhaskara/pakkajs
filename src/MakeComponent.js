(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.MakeComponent = factory();
    }
}(this, function() {

    var componentNameCounter = 0;
    var componentIdCounter = 0;
    var bodyEl = document.getElementsByTagName('body')[0];
    var headEl = document.getElementsByTagName('head')[0];

    var addClass = function(el, className) {
        if (el.classList) {
            addClass = function(el, className) {
                el.classList.add(className);
            }
        } else {
            addClass = function(el, className) {
                el.className += ' ' + className;
            }
        }
        addClass(el, className);
    };

    var property = function(key) {
        return function(obj) {
            return obj == null ? void 0 : obj[key];
        };
    };
    var getLength = property('length');
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var isArrayLike = function(collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    var each = function(obj, iteratee, context) {
        var i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };

    var MakeComponent = function(options) {
        var componentName = options.name ||
            'component-' + componentNameCounter++;

        var addStyleSheet = function() {
            if (options.css) {
                var styleEl = document.createElement('style');
                styleEl.innerHTML = options.css;
                headEl.appendChild(styleEl);
            }
            // making it work for only one time
            addStyleSheet = function() {};
        }

        var binders = {};
        this.addBinder = function(name, callback) {
            binders[name] = callback;
        }

        return function() {
            var that = this;
            addStyleSheet();
            var component = new options.controller();
            var div = document.createElement('div');

            div.innerHTML = options.html || '<div></div>';
            var elements = that.$elements = div.children;

            var bound = [];
            // finish this afterwards
            each(that.$elements, function(element) {
                addClass(element, componentName);
                each(binders, function(callback, name) {
                    var els = element.querySelectorAll('[' + name + ']');
                    each(els, function(el) {
                        var funcName = element.getAttribute(name);
                        var func = component[funcName];
                        // finish this afterwards
                    })
                })
            });

        }
    }


    return MakeComponent;
}));
