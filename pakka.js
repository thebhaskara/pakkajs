(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        module.exports = factory(lodash);
    } else {
        root.pakka = factory(_);
    }
}(this, function(lodash) {

    var headEl = document.getElementsByTagName('head')[0],
        componentNameCounter = 0,
        componentIdCounter = 0,

        // this is a list events known to chrome
        // this actually is an overkill.
        // So for performance, 
        // you can set only required events in pakka.eventsList (to apply globally)
        // or even in your personal instance (to apply locally to the instance)
        eventsList = [
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
            "webkitfullscreenchange", "webkitfullscreenerror", "wheel", "touchstart",
            "touchend", "touchmove", "touchcancel",
        ],

        // Base Class for all instances
        pakka = function(options) {

            // components name is being set
            // you can specify it in the options
            // or we would set a random component name
            var componentName = options.name ||
                'component-' + componentNameCounter++,
                // well this helps us in checking whether
                // the components style is added or not
                componentStyleElement;

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
                        // return eval('context.$properties.' + prop);
                        return lodash.get(context.$properties, prop);
                    } catch (e) {}
                };

                // setter to set property's value
                // and also evaluates the bindings to the html
                // associated with this property
                context.$set = function(prop, value) {
                    // eval('context.$properties.' + prop + '= value;');
                    lodash.set(context.$properties, prop, value);
                    apply(context, prop, value, true, true);
                };

                context.$getSet = function(prop, callback) {
                    var val = context.$get(prop);
                    context.$set(prop, callback(val));
                    return context;
                };

                context.$clear = function(prop) {
                    context.$set(prop, undefined);
                    return context;
                };

                context.$push = function(prop, val) {
                    context.$getSet(prop, function(list) {
                        if (lodash.isArray(list)) {
                            list.push(val);
                        }
                        return list;
                    });
                    return context;
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

                // personal function to attach an event
                context.$attachEvent = function(event, element,
                    handler, namespace) {
                    attachEvent(event, element,
                        handler, context, namespace);
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

                    lodash.isFunction(context.beforeDestroy) && context.beforeDestroy();

                    each(childComponents, function(comp) {
                        comp && comp.$destroy && comp.$destroy();
                    })

                    detachEvents(context);

                    context.$stopListening();

                    removePropertyBindings(context);

                    each(context.$propertyBindings, function(bindings, prop) {
                        context.$set(prop, undefined);
                    });

                    each(context.$elements, function(el) {
                        el.remove();
                    })

                    var afterDestroy = lodash.isFunction(context.afterDestroy) && context.afterDestroy;

                    // deleting remaining stuff
                    each(context, function(val, key) {
                        delete context[key];
                    });
                    delete context;

                    delete component;

                    afterDestroy && afterDestroy();
                }

                // watcher
                context.$watch = function(propertyName, callback) {
                    // linkerFunction = pakka.linkerFunction = 
                    // function(element, context, namespace, callback, name) {
                    // }
                    return linkerFunction(null, context, 'watch', function(el, prop, ctx) {
                        var oldValue = ctx.$get(prop);
                        return function(newValue) {
                            callback && callback(newValue, oldValue);
                            oldValue = newValue;
                        }
                    }, propertyName);
                }

                // watcher
                context.$unwatch = function(handle) {
                    // linkerFunction = pakka.linkerFunction = 
                    // function(element, context, namespace, callback, name) {
                    // }
                    unlinkerFunction(context, handle);
                };

                context.$getWatch = function(prop, callback) {
                    callback(context.$get(prop));
                    return context.$watch(prop, callback);
                }

                var listenHandlers = [];
                context.$listen = function(component, prop, callback) {
                    if (lodash.isFunction(component.$watch)) {
                        var handle = {
                            component: component,
                            handle: component.$watch(prop, callback)
                        }
                        listenHandlers.push(handle);
                        return handle;
                    }
                };
                context.$stopListening = function(handle) {
                    if (handle) {
                        // incase of component already destroyed
                        if (handle.component && lodash.isFunction(handle.component.$unwatch)) {
                            handle.component.$unwatch(handle.handle);
                        }
                        listenHandlers = lodash.filter(listenHandlers, function(handler) {
                            return handle != handler;
                        });
                    } else {
                        each(listenHandlers, function(handle) {
                            // incase of component already destroyed
                            if (handle.component && lodash.isFunction(handle.component.$unwatch)) {
                                handle.component.$unwatch(handle.handle);
                            }
                        });
                        listenHandlers = [];
                    }
                };

                var childComponents = [];
                context.$createChild = function(factory, options) {
                    var instance = new factory(options);
                    context.$addChild(instance);
                    return instance;
                };
                context.$addChild = function(component) {
                    childComponents.push(component);
                    return context;
                };
                context.$removeChild = function(component) {
                    childComponents = lodash.filter(childComponents, function(comp) {
                        return comp != component;
                    });
                    return context;
                };

                context.$createCallback = function(callback) {
                    return function() {
                        if (context && context.$set) {
                            callback.apply(callback, arguments);
                        }
                    }
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

                // this function is available on the instance 
                // for setting html dynamically
                // but it is your responsibility to 
                // append these elements to DOM
                context.$setHtml = function(html) {
                    var div = document.createElement('div');
                    div.innerHTML = options.html || '<div></div>';

                    // bug-fix
                    // the HTMLCollection returned was acting weird 
                    // incase of bind-components sorting.
                    context.$setElements(select(div.children));
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

                // initializing the controller
                // you can see that we are passing the context
                // so all the above functionalities are available 
                // to the controller.
                var component = new options.controller(context);
            }
        }
    pakka.version = "1.2.3";
    var select = pakka.select = function(elements) {
            if (isString(elements)) {
                elements = document.querySelectorAll(elements);
            }
            var result = [];
            each(elements, function(element) {
                result.push(element);
            });
            return result;
        },
        create = pakka.create = function(options) {
            if (!options) {
                options = {};
            } else if (isString(options)) {
                options = {
                    elements: select(options)
                };
            } else if (options.elementsSelector) {
                options.elements = select(options.elementsSelector);
            }
            var obj = pakka(options);
            return new obj();
        },

        createMany = pakka.createMany = function(selector) {
            var collection = [],
                elements = select(selector);
            each(elements, function(element) {
                var options = { elements: [] };
                options.elements.push(element);
                collection.push(create(options));
            });
            return collection;
        },

        // from underscorejs
        isString = pakka.isString = lodash.isString,

        // from underscorejs
        isUndefined = pakka.isUndefined = lodash.isUndefined,
        isNil = pakka.isNil = lodash.isNil,

        // from underscorejs
        isObject = pakka.isObject = lodash.isObject,

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
        isArray = pakka.isArray = lodash.isArray,

        // source https://github.com/toddmotto/foreach/blob/master/src/foreach.js
        each = pakka.each = lodash.each,

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
        apply = pakka.apply = function(context, prop, value, propagateToChildren, propagateToParent) {
            if (isUndefined(prop)) {
                // in case prop is not provided
                // evaluates everything
                each(context.$propertyBindings, function(list, propName) {
                    apply(context, propName, context.$get(propName));
                })
            } else {
                each(context.$propertyBindings[prop], function(binding) {
                    binding.callback(value);
                });

                if (propagateToChildren === true) {
                    if (isArray(value)) {
                        each(value, function(v, i) {
                            apply(context, prop + '[' + i + ']', v, true, false);
                        })
                    } else if (isSimpleObject(value)) {
                        each(value, function(v, k) {
                            apply(context, prop + '.' + k, v, true, false);
                        })
                    }
                }
                if (propagateToParent === true) {
                    var propList = prop.split('.');
                    propList.pop();
                    if (propList.length > 0) {
                        var propName = propList.join('.');
                        apply(context, propName, context.$get(propName), false, true);
                    }
                }
            }
        },

        // addClass function from youmightnotneedjquery.com
        // addClass = pakka.addClass = function(el, className) {
        //     if (el.classList) {
        //         addClass = function(el, className) {
        //             el.classList.add(className);
        //         }
        //     } else {
        //         addClass = function(el, className) {
        //             el.className += ' ' + className;
        //         }
        //     }
        //     addClass(el, className);
        // },

        // empty function from youmightnotneedjquery.com
        empty = pakka.empty = function(el) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        },

        // can bind all the binders given by add binder
        linkBinders = pakka.linkBinders = function(element, context, namespace) {
            each(binders, function(callback, name) {
                var els = element.querySelectorAll('[' + name + ']');
                if (element.hasAttribute(name)) {
                    linkerFunction(element, context, namespace, callback, name);
                }
                each(els, function(el) {
                    linkerFunction(el, context, namespace, callback, name);
                });
            });
        },

        linkerFunction = pakka.linkerFunction = function(element, context, namespace, callback, name) {
            var prop = element ? element.getAttribute(name) : name;
            var bindingsList = context.$propertyBindings[prop] || [];
            var binding = {
                namespace: namespace,
                callback: callback(element, prop, context)
            };
            bindingsList.push(binding);
            context.$propertyBindings[prop] = bindingsList;
            return {
                prop: prop,
                binding: binding
            };
        },

        unlinkerFunction = pakka.unlinkerFunction = function(context, handler) {
            var bindingsList = context.$propertyBindings[handler.prop];
            if (bindingsList) {
                context.$propertyBindings[handler.prop] = lodash.filter(bindingsList, function(binding) {
                    return binding != handler.binding;
                });
            }
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

    addBinder('bind-repeat', function(el, prop, context) {
        var tempElement = document.createElement('div'),
            nameAttr = el.getAttribute('var-name'),
            keyAttr = el.getAttribute('var-key'),
            indexAttr = el.getAttribute('var-index'),
            _map = {},
            _valuesMap = {},
            BaseComponent = pakka({
                html: el.innerHTML,
            });
        el.innerHTML = '';

        return function(input) {
            var isArrayInput = isArray(input),
                isObjectInput = isObject(input);
            if (isNil(input) || (!isArrayInput && !isObjectInput)) {
                return;
            }

            var map = {},
                valuesMap = {};
            each(input, function(value, key) {
                var component = map[value] = _map[value];
                delete _map[value];
                if (!component) {
                    component = map[value] = new BaseComponent();
                    component.$parent = context;
                    var watchProp, attr;
                    if (isArrayInput) {
                        watchProp = prop + '[' + key + ']';
                        attr = indexAttr;
                    } else {
                        watchProp = prop + '.' + key;
                        attr = keyAttr;
                    }
                    context.$watch(watchProp, function(val) {
                        component.$set(nameAttr, val);
                    });
                    component.$set(attr, key);
                }
                each(component.$elements, function(element) {
                    el.appendChild(element);
                });
            })

            each(_map, function(component) {
                each(component.$elements, function(element) {
                    el.removeChild(element);
                });
            });
            _map = map;
        }
    });

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

    var propertyBinderCounter = 0,
        getValueText = function(element) {
            return element.value;
        },
        setValueText = function(element, value) {
            element.value = value;
        },
        getValueCheckbox = function(element) {
            return element.checked;
        },
        setValueCheckbox = function(element, value) {
            element.checked = value;
        },
        getValueSelect = function(element) {
            return element.values;
        },
        setValueSelect = function(element, value) {
            element.values = value;
        },
        getValueDiv = function(element) {
            return element.innerText;
        },
        setValueDiv = function(element, value) {
            element.innerText = value;
        };
    addBinder('bind-property', function(el, prop, context) {
        var binderId = 'bind-property-' + propertyBinderCounter++,
            isHandlerCalled = false,
            handler = function(event) {
                // console.log(event);
                // executeDelayedOnce(function() {
                var key = event.keyCode;
                if (key != 16 && key != 17 && key != 18) {
                    isHandlerCalled = true;
                    context.$set(prop, getValue(event.target));
                }
                // }, binderId);
            },
            getValue = getValueText,
            setValue = setValueText;
        each(el.attributes, function(attribute) {
            if (attribute.name == "type" && attribute.value == "checkbox") {
                getValue = getValueCheckbox;
                setValue = setValueCheckbox;
                return false;
            }
        })
        if (el.tagName == "SELECT") {
            getValue = getValueSelect;
            setValue = setValueSelect;
        } else if (el.tagName == "DIV") {
            getValue = getValueDiv;
            setValue = setValueDiv;
        }
        each(['change', 'keyup'], function(eventName) {
            attachEvent(eventName, el, handler, context, binderId);
        });
        return function(value) {
            // fix for firefox
            if (isHandlerCalled) {
                isHandlerCalled = false;
            } else {
                if (!isNil(value)) {
                    setValue(el, value);
                }
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
            empty(el);
            if (!isNil(value)) {
                each(value.$elements, function(element) {
                    el.appendChild(element);
                })
            }
        }
    });

    addBinder('bind-components', function(el, prop, context) {
        var _map = {};
        empty(el);
        return function(components) {
            if (isNil(components) || !isArray(components)) {
                components = [];
                // return;
            }
            var map = {};
            each(components, function(component) {
                var id = component.$id;
                delete _map[id];
                map[id] = component;
                each(component.$elements, function(element) {
                    el.appendChild(element);
                });
            });
            each(_map, function(component) {
                each(component.$elements, function(element) {
                    el.removeChild(element);
                });
            });
            _map = map;
        }
    });

    var addClass = pakka.addClass = function(el, className) {
        // add class
        if (el.classList) {
            addClass = pakka.addClass = function(el1, className1) {
                el1.classList.add(className1);
            }
        } else {
            addClass = pakka.addClass = function(el1, className1) {
                el1.className += ' ' + className1;
            }
        }
        addClass(el, className);
    }

    var removeClass = pakka.removeClass = function(el, className) {
        // remove class
        if (el.classList) {
            removeClass = pakka.removeClass = function(el1, className1) {
                el1.classList.remove(className1);
            }
        } else {
            removeClass = pakka.removeClass = function(el1, className1) {
                el1.className = el1.className.replace(new RegExp('(^|\\b)' +
                    className1.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }
        removeClass(el, className);
    }

    pakka.addBinder('bind-class', function(el, prop, context) {
        var classesMap = {};
        return function(value) {
            each(classesMap, function(v, key) {
                classesMap[key] = false;
            })
            if (isArray(value)) {
                each(value, function(item) {
                    classesMap[item] = true;
                })
            } else if (isString(value)) {
                classesMap[value] = true;
            } else if (isObject(value)) {
                each(value, function(v, key) {
                    classesMap[key] = v;
                });
            }
            each(classesMap, function(isTrue, key) {
                if (isTrue === true) {
                    addClass(el, key);
                } else {
                    removeClass(el, key);
                }
            })
        }
    });

    pakka.addBinder('bind-element', function(el, prop, context) {
        context.$set(prop, el);
        return function() {}
    });

    pakka.addBinder('bind-attributes', function(el, prop, context) {
        return function(attributes) {
            if (isObject(attributes)) {
                each(attributes, function(value, key) {
                    el.setAttribute(key, value);
                });
            }
        };
    });

    pakka.addBinder('bind-href', function(el, prop, context) {
        return function(value) {
            el.href = value;
        }
    });

    return pakka;
}));
