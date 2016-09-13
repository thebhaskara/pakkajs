(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.MakeComponent = factory();
    }
}(this, function() {

    var componentNameCounter = 0,
        componentIdCounter = 0,
        headEl = document.getElementsByTagName('head')[0],
        each = _.each,
        isUndefined = _.isUndefined,
        isObject = _.isObject;

    var eventsList = [
        "abort", "beforecopy", "beforecut", "beforepaste",
        "blur", "cancel", "canplay", "canplaythrough", "change", "click",
        "close", "contextmenu", "copy", "cuechange", "cut", "dblclick",
        "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart",
        "drop", "durationchange", "emptied", "ended", "error", "focus",
        "input", "invalid", "keydown", "keypress", "keyup", "load",
        "loadeddata", "loadedmetadata", "loadstart", "mousedown", "mouseenter",
        "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup",
        "mousewheel", "paste", "pause", "play", "playing", "progress",
        "ratechange", "reset", "resize", "scroll", "search", "seeked",
        "seeking", "select", "selectstart", "show", "stalled", "submit",
        "suspend", "timeupdate", "toggle", "volumechange", "waiting",
        "webkitfullscreenchange", "webkitfullscreenerror", "wheel"
    ];

    var definitelyGetString = function(value) {
        if (isUndefined(value)) {
            return '';
        } else if (isObject(value)) {
            return JSON.stringify(value);
        } else {
            return value;
        }
    }


    var MakeComponent = function(options) {
        var componentName = options.name ||
            'component-' + componentNameCounter++;


        return function() {

            addStyleSheet(options);

            var that = this,
                properties = that.$properties = {};

            that.get = function(prop) {
                return properties[prop];
            };

            that.set = function(prop, value) {
                properties[prop] = value;
                evaluatePropertyBindings(that, prop, value);
            };

            that.$propertyBindings = {};

            // setting elements
            var div = document.createElement('div');
            div.innerHTML = options.html || '<div></div>';

            // just in case the internal elements are multiple
            var elements = that.$elements = div.children;
            each(elements, function(element) {

                // adding this components personalized class
                addClass(element, componentName);

                // generates property bindings
                linkBinders(element, that);

                // attaching known events
                attachEvents(element, that);
            });

            // initializing the controller
            var component = new options.controller(that);

            // evaluate all bindings after controller initialization
            evaluatePropertyBindings(that);
        }
    }

    // binding evaluator
    var evaluatePropertyBindings = MakeComponent.evaluatePropertyBindings = function(that, prop, value) {
        if (isUndefined(prop)) {
            // in case prop is not provided
            // evaluates everything
            each(that.$propertyBindings, function(list, propName) {
                evaluatePropertyBindings(that, propName, that.get(propName));
            })
        } else {
            each(that.$propertyBindings[prop], function(bindingCallback) {
                bindingCallback(value);
            })
        }
    }

    // personal stylesheet adding function
    var addStyleSheet = MakeComponent.addStyleSheet = function(options) {
        if (options.css) {
            var styleEl = document.createElement('style');
            styleEl.innerHTML = options.css;
            headEl.appendChild(styleEl);
        }
        // making it work for only one time per component
        addStyleSheet = function() {};
    }

    // addClass function from youmightnotneedjquery.com
    var addClass = MakeComponent.addClass = function(el, className) {
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

    // empty function from youmightnotneedjquery.com
    var empty = MakeComponent.empty = function(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };

    var linkBinders = MakeComponent.linkBinders = function(element, that) {
        each(binders, function(callback, name) {
            var els = element.querySelectorAll('[' + name + ']');
            each(els, function(el) {
                var prop = el.getAttribute(name);
                var bindingsList = that.$propertyBindings[prop] || [];
                bindingsList.push(callback(el, prop, that));
                that.$propertyBindings[prop] = bindingsList;
            })
        });
    };

    var attachEvent = MakeComponent.attachEvent = function(event, element, handler) {
        if (element.addEventListener) { // DOM standard
            attachEvent = function(event, element, handler) {
                element.addEventListener(event, handler, false)
            }
        } else if (element.attachEvent) { // IE
            attachEvent = function(event, element, handler) {
                element.attachEvent('on' + event, handler);
            }
        }
        attachEvent(event, element, handler);
    }

    var attachEvents = MakeComponent.attachEvents = function(element, that) {
        each(eventsList, function(name) {
            var els = element.querySelectorAll('[' + name + '-handle]');
            each(els, function(el) {
                var prop = el.getAttribute(name + '-handle');
                MakeComponent.attachEvent(name, el, function(event) {
                    that[prop] && that[prop](event);
                })
            })
        });
    };

    var binders = MakeComponent.binders = {};
    var addBinder = MakeComponent.addBinder = function(name, callback) {
        binders[name] = callback;
    };

    addBinder('bind-text', function(el, prop, that) {
        return function(value) {
            el.innerText = definitelyGetString(value);
        }
    });

    addBinder('bind-html', function(el, prop, that) {
        return function(value) {
            el.innerHTML = definitelyGetString(value);
        }
    });

    addBinder('bind-property', function(el, prop, that) {
        var handler = function(event) {
            that.set(prop, event.target.value);
        }
        attachEvent('change', el, handler);
        attachEvent('keyup', el, handler);
        attachEvent('paste', el, handler);
        return function(value) {
            if (!isUndefined(value)) {
                el.value = value;
            }
        }
    });

    addBinder('bind-component', function(el, prop, that) {
        return function(value) {
            if (!isUndefined(value)) {
                empty(el);
                each(value.$elements, function(element) {
                    el.appendChild(element);
                })
            }
        }
    });

    return MakeComponent;
}));
