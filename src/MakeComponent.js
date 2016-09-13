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
        headEl = document.getElementsByTagName('head')[0];

    // from underscorejs
    var isUndefined = function(obj) {
        return obj === void 0;
    }

    // from underscorejs
    var isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    }

    // source https://github.com/toddmotto/foreach/blob/master/src/foreach.js
    var each = function(collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };

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

        // personal stylesheet adding function
        // this would not work correctly outside of this scope 
        var addStyleSheet = function(css, id, styleEl) {
            if (isUndefined(styleEl)) {
                styleEl = document.createElement('style');
                styleEl.setAttribute('id', id);
                headEl.appendChild(styleEl);
            }
            styleEl.innerHTML = css;
            return styleEl;
        };

        var componentStyleElement;

        return function() {


            var that = this,
                instanceStyleElement,
                properties = that.$properties = {};

            that.$componentName = componentName;
            that.$componentId = componentName + '-' + componentIdCounter++;

            if (isUndefined(componentStyleElement)) {
                componentStyleElement = addStyleSheet(options.css || '',
                    componentName, componentStyleElement);
            }

            that.setCss = function(css) {
                instanceStyleElement = addStyleSheet(css || '',
                    that.$componentId, instanceStyleElement);
            }

            that.get = function(prop) {
                return properties[prop];
            };

            that.set = function(prop, value) {
                properties[prop] = value;
                evaluatePropertyBindings(that, prop, value);
            };

            that.$propertyBindings = {};
            that.$listeners = [];

            var elements = options.elements;

            if (isUndefined(elements)) {
                // setting elements
                var div = document.createElement('div');
                div.innerHTML = options.html || '<div></div>';

                elements = div.children;
            }

            that.$elements = elements;

            each(elements, function(element) {

                // adding this components personalized class
                addClass(element, componentName);
                addClass(element, that.$componentId);

                // generates property bindings
                linkBinders(element, that);

                // attaching known events
                attachEvents(element, that);
            });

            // initializing the controller
            var component = new options.controller(that);

            // evaluate all bindings after controller initialization
            evaluatePropertyBindings(that);

            that.destroy = function() {
                each(that.$listeners, function(listener) {
                    detachEvent(listener.event, listener.element, listener.handler, that);
                });
                delete that.$listeners;
                each(that.$propertyBindings, function(bindings, prop) {
                    delete that.$propertyBindings[prop];
                });
                each(that, function(val, key) {
                    delete that[key];
                })
                delete that;
            }
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

    var detachEvent = MakeComponent.detachEvent = function(event, element, handler, that) {
        if (element.removeEventListener) { // DOM standard
            detachEvent = function(event, element, handler, that) {
                element.removeEventListener(event, handler, false);
            }
        } else if (element.detachEvent) { // IE
            detachEvent = function(event, element, handler, that) {
                element.detachEvent('on' + event, handler);
            }
        }
        detachEvent(event, element, handler, that);
    }

    var attachEvent = MakeComponent.attachEvent = function(event, element, handler, that) {
        if (element.addEventListener) { // DOM standard
            attachEvent = function(event, element, handler, that) {
                pushListener(event, element, handler, that);
                element.addEventListener(event, handler, false)
            }
        } else if (element.attachEvent) { // IE
            attachEvent = function(event, element, handler, that) {
                pushListener(event, element, handler, that);
                element.attachEvent('on' + event, handler);
            }
        }
        attachEvent(event, element, handler, that);
    }
    var pushListener = MakeComponent.pushListener = function(event, element, handler, that) {
        that.$listeners.push({
            element: element,
            event: event,
            handler: handler
        })
    }

    var attachEvents = MakeComponent.attachEvents = function(element, that) {
        // to make the event list smaller, user can provide a custom list 
        // at instance level or MakeComponent level
        each(that.eventsList || MakeComponent.eventsList || eventsList, function(name) {
            var els = element.querySelectorAll('[' + name + '-handle]');
            each(els, function(el) {
                var prop = el.getAttribute(name + '-handle');
                MakeComponent.attachEvent(name, el, function(event) {
                    that[prop] && that[prop](event);
                }, that)
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
        attachEvent('change', el, handler, that);
        attachEvent('keyup', el, handler, that);
        attachEvent('paste', el, handler, that);
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
