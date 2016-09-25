(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.pakka = factory();
    }
}(this, function() {

    // this element is needed to insert stylesheets dynamically
    var headEl = document.getElementsByTagName('head')[0],
        // this lets us assign unique names to components
        componentNameCounter = 0,
        // this lets us assign unique names to each instances of components
        componentIdCounter = 0;

    // this is a list events known to chrome
    // this actually is an overkill,
    // so we gave another optimal solution to this. 
    // you can set only required events in pakka.eventsList (to apply globally)
    // or even in your personal instance (to apply locally to the instance)
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

    // this is the base pakka function you have been looking for
    var pakka = function(options) {

        // components name is being set
        // you can specify it in the options
        // or we would set a random component name
        var componentName = options.name ||
            'component-' + componentNameCounter++;

        // well this helps us in checking whether
        // the components style is added or not
        var componentStyleElement;

        if (!options.controller) {
            options.controller = function() {};
        }

        return function() {

            // instance of the context
            var context = this,

                // well this helps us in checking whether
                // the components instances style is added or not
                instanceStyleElement,

                // initializing the properties object
                properties = context.$properties = {};

            // getter to get property's value
            context.$get = function(prop) {
                try {
                    return eval('context.$properties.' + prop);
                } catch (e) {}
            };

            // setter to set property's value
            // and also evaluates the bindings to the html
            // associated with this property
            context.$set = function(prop, value) {
                eval('context.$properties.' + prop + '= value;');
                apply(context, prop, value);
            };

            // initializing components name and id into its context
            context.$name = componentName;
            context.$options = options;
            var contextId = context.$id = componentName + '-' + componentIdCounter++;

            // you can provide css from options to add components personal style.
            // this adds components style sheet if it has not already loaded.
            if (isUndefined(componentStyleElement)) {
                componentStyleElement = addStyleSheet(options.css || '',
                    componentName, componentStyleElement);
            }

            // a function is provided in the context to 
            // set instances personal style dynamically
            context.$setCss = function(css) {
                instanceStyleElement = addStyleSheet(css || '',
                    context.$componentId, instanceStyleElement);
            }


            // this function is available on the instance 
            // for setting elements dynamically
            context.$setElements = function(elements) {

                // in case these things are already set
                detachEvents(context);
                removePropertyBindings(context);

                // this keeps the map of properties along with their
                // list of element and bindings respectively.
                // this acts as cache for fast execution of binings
                context.$propertyBindings = {};

                // this keeps the list of listeners that are attached
                // this acts as a cache and also will be used to detach 
                // listeners while destroying the object
                context.$listeners = [];

                // elements noticed are available on the context
                context.$elements = elements;

                // following code is responsible to glue stuff up
                each(elements, function(element) {

                    // adding this components personalized class
                    addClass(element, componentName);
                    addClass(element, contextId);

                    // generates property bindings
                    linkBinders(element, context, contextId);

                    // attaching known events
                    attachEvents(element, context, contextId);
                });
            }

            // personal function to attach an event
            context.$attachEvent = function(event, element,
                handler, namespace) {
                attachEvent(event, element,
                    handler, context, namespace);
            }

            // this function is available on the instance 
            // for setting html dynamically
            // but it is your responsibility to 
            // append these elements to DOM
            context.$setHtml = function(html) {
                var div = document.createElement('div');
                div.innerHTML = options.html || '<div></div>';

                context.$setElements(div.children);
            }

            if (!isUndefined(options.elements)) {

                // you can provide elements using document.querySelectorAll(selector)
                // in order to bind with existing DOM
                // don't worry document.querySelectorAll works for IE8 too.
                // in cases where elements is not set from options 
                // following code takes care of it
                context.$setElements(options.elements);

            } else {

                // you can provide html string in the options
                // and the following makes the DOM elements for you
                // Note that this will create elements only.
                // you are responsible to attach it where you need.
                context.$setHtml(options.html);

            }

            // detaches all the attached DOM events
            context.$detachEvents = function(namespace) {
                detachEvents(context, namespace);
            }

            // removes all the bindings
            context.$removePropertyBindings = function() {
                removePropertyBindings(context);
            }

            // destroys the object
            context.$destroy = function() {

                detachEvents(context);
                removePropertyBindings(context);

                // deleting remaining stuff
                each(context, function(val, key) {
                    delete context[key];
                })
                delete context;
            }

            // initializing the controller
            // you can see that we are passing the context
            // so all the above functionalities are available 
            // to the controller.
            var component = new options.controller(context);
        }
    }

    var create = pakka.create = function(options) {
            if (isString(options)) {
                options = {
                    elements: document.querySelectorAll(options)
                };
            } else if (options.elementsSelector) {
                options.elements = document.querySelectorAll(options.elementsSelector);
            }
            var obj = pakka(options);
            return new obj();
        },

        createMany = pakka.createMany = function(selector) {
            var collection = [],
                elements = document.querySelectorAll(selector);
            each(elements, function(element) {
                var options = { elements: [] };
                options.elements.push(element);
                collection.push(create(options));
            });
            return collection;
        },

        // from underscorejs
        isString = pakka.isString = function(obj) {
            return Object.prototype.toString.call(obj) === '[object String]';
        },

        // from underscorejs
        isUndefined = pakka.isUndefined = function(obj) {
            return obj === void 0;
        },

        // from underscorejs
        isObject = pakka.isObject = function(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        },

        // from underscorejs
        simpleObject = {},
        simpleObjectToString = simpleObject.constructor.toString(),
        isSimpleObject = pakka.isSimpleObject = function(obj) {
            if (isObject(obj)) {
                return obj.constructor.toString() == simpleObjectToString;
            }
            return false;
        },

        // from underscorejs
        isArray = pakka.isArray = function(obj) {
            return toString.call(obj) === '[object Array]';
        },

        // source https://github.com/toddmotto/foreach/blob/master/src/foreach.js
        each = pakka.each = function(collection, callback, scope) {
            if (!isUndefined(collection)) {
                if (Object.prototype.toString.call(collection) === '[object Object]') {
                    for (var prop in collection) {
                        if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                            if (callback.call(scope, collection[prop], prop, collection) === false) {
                                return;
                            }
                        }
                    }
                } else {
                    for (var i = 0, len = collection.length; i < len; i++) {
                        if (callback.call(scope, collection[i], i, collection) === false) {
                            return;
                        }
                    }
                }
            }
        },

        // you can  detach events completely
        // or you can specify a namespace for only that to be removed
        // you can check the bind-html implementation
        detachEvents = pakka.detachEvents = function(context, namespace) {
            var tempListeners = [];
            each(context.$listeners, function(listener) {
                if (isUndefined(namespace) || listener.namespace === namespace) {
                    detachEvent(listener.event, listener.element, listener.handler, context);
                    delete listener;
                } else {
                    tempListeners.push(listener);
                }
            });
            if (isUndefined(namespace)) delete context.$listeners;
            else context.$listeners = tempListeners;
        },

        // this works on specification of a listener item
        detachEvent = pakka.detachEvent = function(event, element, handler, context) {
            if (element.removeEventListener) { // DOM standard
                detachEvent = pakka.detachEvent = function(event, element, handler, context) {
                    element.removeEventListener(event, handler, false);
                }
            } else if (element.detachEvent) { // IE
                detachEvent = pakka.detachEvent = function(event, element, handler, context) {
                    element.detachEvent('on' + event, handler);
                }
            }
            detachEvent(event, element, handler, context);
        },

        // you can remove all property bindings or 
        // specify a namespace to remove onlyfor that
        removePropertyBindings = pakka.removePropertyBindings =
        function(context, namespace) {
            each(context.$propertyBindings, function(bindings, prop) {
                if (isUndefined(namespace)) {
                    delete context.$propertyBindings[prop];
                } else {
                    var bindings = context.$propertyBindings[prop],
                        tempBindings = [];
                    each(bindings, function(binding) {
                        if (binding.namespace != namespace) {
                            tempBindings.push(binding);
                        }
                    })
                    context.$propertyBindings[prop] = tempBindings;
                }
            });
        },

        // personal stylesheet adding function
        // this would not work correctly outside of this scope 
        addStyleSheet = pakka.addStyleSheet = function(css, id, styleEl) {
            if (isUndefined(styleEl)) {
                styleEl = document.createElement('style');
                styleEl.setAttribute('id', id);
                headEl.appendChild(styleEl);
            }
            styleEl.innerHTML = css;
            return styleEl;
        },

        // binding evaluator
        apply = pakka.apply = function(context, prop, value) {
            if (isUndefined(prop)) {
                // in case prop is not provided
                // evaluates everything
                each(context.$propertyBindings, function(list, propName) {
                    apply(context, propName, context.get(propName));
                })
            } else {
                each(context.$propertyBindings[prop], function(binding) {
                    binding.callback(value);
                });
                if (isArray(value)) {
                    each(value, function(v, i) {
                        apply(context, prop + '[' + i + ']', v);
                    })
                } else if (isSimpleObject(value)) {
                    each(value, function(v, k) {
                        apply(context, prop + '.' + k, v);
                    })
                }
            }
        },

        // addClass function from youmightnotneedjquery.com
        addClass = pakka.addClass = function(el, className) {
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
        },

        // empty function from youmightnotneedjquery.com
        empty = pakka.empty = function(el) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        },

        // can bind all the binders given by add binder
        linkBinders = pakka.linkBinders = function(element, context, namespace) {
            each(binders, function(callback, name) {
                var els = element.querySelectorAll('[' + name + ']'),
                    linkerFunction = function(el) {
                        var prop = el.getAttribute(name);
                        var bindingsList = context.$propertyBindings[prop] || [];
                        bindingsList.push({
                            namespace: namespace,
                            callback: callback(el, prop, context)
                        });
                        context.$propertyBindings[prop] = bindingsList;
                    };
                if (element.hasAttribute(name)) {
                    linkerFunction(element);
                }
                each(els, linkerFunction);
            });
        },

        // attaches events
        attachEvents = pakka.attachEvents = function(element, context, namespace) {
            // to make the event list smaller, user can provide a custom list 
            // at instance level or pakka level
            each(context.eventsList || context.$options.eventsList ||
                pakka.eventsList || eventsList,
                function(name) {
                    var attribute = name + '-handle',
                        els = element.querySelectorAll('[' + attribute + ']'),
                        attacherFunction = function(el) {
                            var prop = el.getAttribute(attribute);
                            attachEvent(name, el, function(event) {
                                context[prop] && context[prop](event);
                            }, context, namespace)
                        };
                    if (element.hasAttribute(attribute)) {
                        attacherFunction(element);
                    }
                    each(els, attacherFunction);
                });
        },

        // attaches one event
        attachEvent = pakka.attachEvent = function(event, element,
            handler, context, namespace) {

            if (element.addEventListener) { // DOM standard

                attachEvent = pakka.attachEvent = function(event, element,
                    handler, context, namespace) {
                    pushListener(event, element, handler, context, namespace);
                    element.addEventListener(event, handler, false)
                }

            } else if (element.attachEvent) { // IE

                attachEvent = pakka.attachEvent = function(event, element,
                    handler, context, namespace) {
                    pushListener(event, element, handler, context, namespace);
                    element.attachEvent('on' + event, handler);
                }

            }
            attachEvent(event, element, handler, context, namespace);
        },

        pushListener = pakka.pushListener = function(event, element, handler, context, namespace) {
            context.$listeners.push({
                element: element,
                event: event,
                handler: handler,
                namespace: namespace
            })
        },

        // binders = pakka.binders = {};
        binders = {},

        addBinder = pakka.addBinder = function(name, callback) {
            binders[name] = callback;
        },

        definitelyGetString = function(value) {
            if (isUndefined(value)) {
                return '';
            } else if (isObject(value)) {
                return JSON.stringify(value);
            } else {
                return value;
            }
        },
        timeoutHandles = {},
        executeDelayedOnce = function(callback, namespace, timeout) {
            namespace = namespace || 'pakka-generic-namespace';
            timeoutHandle = timeoutHandles[namespace]
            if (timeoutHandle) clearTimeout(timeoutHandle);
            timeoutHandle = setTimeout(callback, timeout);
            timeoutHandles[namespace] = timeoutHandle;
        };

    var htmlBinderCounter = 0;
    addBinder('bind-html', function(el, prop, context) {
        var binderId = 'bind-html-' + propertyBinderCounter++;
        return function(value) {

            // in case these things are already set
            detachEvents(context, binderId);
            removePropertyBindings(context, binderId);

            el.innerHTML = definitelyGetString(value);

            // generates property bindings
            linkBinders(el, context, binderId);

            // attaching known events
            attachEvents(el, context, binderId);
        }
    });

    var propertyBinderCounter = 0;
    addBinder('bind-property', function(el, prop, context) {
        var binderId = 'bind-property-' + propertyBinderCounter++,
            handler = function(event) {
                executeDelayedOnce(function() {
                    context.$set(prop, event.target.value);
                }, binderId);
            }
        each(['change', 'keyup', 'paste'], function(eventName) {
            attachEvent(eventName, el, handler, context, binderId);
        });
        return function(value) {
            if (!isUndefined(value)) {
                el.value = value;
            }
        }
    });

    addBinder('bind-text', function(el, prop, context) {
        return function(value) {
            el.innerText = definitelyGetString(value);
        }
    });

    addBinder('bind-component', function(el, prop, context) {
        return function(value) {
            if (!isUndefined(value)) {
                empty(el);
                each(value.$elements, function(element) {
                    el.appendChild(element);
                })
            }
        }
    });

    return pakka;
}));
