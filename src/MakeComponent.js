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
    //var bodyEl = document.getElementsByTagName('body')[0];
    var headEl = document.getElementsByTagName('head')[0];
    var each = _.each;

    var tempDiv = document.createElement('div');
    var eventsList = ["abort", "beforecopy", "beforecut", "beforepaste", "blur", "cancel", "canplay", "canplaythrough", "change", "click", "close", "contextmenu", "copy", "cuechange", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "emptied", "ended", "error", "focus", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "mousewheel", "paste", "pause", "play", "playing", "progress", "ratechange", "reset", "resize", "scroll", "search", "seeked", "seeking", "select", "selectstart", "show", "stalled", "submit", "suspend", "timeupdate", "toggle", "volumechange", "waiting", "webkitfullscreenchange", "webkitfullscreenerror", "wheel"];

    // addClass function from youmightnotneedjquery.com
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

    var MakeComponent = function(options) {
        var componentName = options.name ||
            'component-' + componentNameCounter++;

        // personal stylesheet adding function
        var addStyleSheet = function() {
            if (options.css) {
                var styleEl = document.createElement('style');
                styleEl.innerHTML = options.css;
                headEl.appendChild(styleEl);
            }
            // making it work for only one time per component
            addStyleSheet = function() {};
        }

        return function() {

            addStyleSheet();

            var that = this,
                properties = that.$properties = {};

            that.get = function(prop) {
                return properties[prop];
            };

            that.set = function(prop, value) {
                properties[prop] = value;
                evaluatePropertyBindings(prop, value);
            };

            var propertyBindings = that.$propertyBindings = {};

            // binding evaluator
            var evaluatePropertyBindings = function(prop, value) {
                if (prop) {
                    var bindingsList = propertyBindings[prop];
                    each(bindingsList, function(bindingCallback) {
                        bindingCallback(value);
                    })
                } else {
                    // in case prop is not provided
                    // evaluates everything
                    each(propertyBindings, function(list, propName) {
                        evaluatePropertyBindings(propName, that.get(propName));
                    })
                }
            }

            // setting elements
            var div = document.createElement('div');
            div.innerHTML = options.html || '<div></div>';

            // just in case the internal elements are multiple
            var elements = that.$elements = div.children;
            each(elements, function(element) {

                // adding this components personalized class
                addClass(element, componentName);

                // generates property bindings
                MakeComponent.linkBinders(element, that);

                // attaching known events
                MakeComponent.attachEvents(element, that);
            });

            // initializing the controller
            var component = new options.controller(that);

            // evaluate all bindings after controller initialization
            evaluatePropertyBindings();
        }
    }


    MakeComponent.linkBinders = function(element, that) {
        each(MakeComponent.binders, function(callback, name) {
            var els = element.querySelectorAll('[' + name + ']');
            each(els, function(el) {
                var prop = el.getAttribute(name);
                var bindingsList = that.$propertyBindings[prop] || [];
                bindingsList.push(callback(el, prop, that));
                that.$propertyBindings[prop] = bindingsList;
            })
        });
    };

    MakeComponent.attachEvent = function(event, element, handler) {
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

    MakeComponent.attachEvents = function(element, that) {
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

    MakeComponent.binders = {};
    MakeComponent.addBinder = function(name, callback) {
        MakeComponent.binders[name] = callback;
    };

    MakeComponent.addBinder('bind-text', function(el, prop, that) {
        return function(value) {
            el.innerText = value;
        }
    });

    MakeComponent.addBinder('bind-html', function(el, prop, that) {
        return function(value) {
            el.innerHTML = value;
        }
    });

    MakeComponent.addBinder('bind-property', function(el, prop, that) {
        var handler = function(event) {
            that.set(prop, event.target.value);
        }
        MakeComponent.attachEvent('change', el, handler);
        MakeComponent.attachEvent('keydown', el, handler);
        MakeComponent.attachEvent('paste', el, handler);
        MakeComponent.attachEvent('blur', el, handler);
        MakeComponent.attachEvent('focus', el, handler);
        return function(value) {
            if (el.value) {
                el.value = value;
            }
        }
    });

    return MakeComponent;
}));
