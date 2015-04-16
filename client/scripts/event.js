/* EventManager, v1.0.1
 *
 * Copyright (c) 2009, Howard Rauscher
 * Licensed under the MIT License
 */
define(function(){
    function EventManager() {
        this._listeners = {};
    }
    EventManager.prototype = {
        addListener : function(name, fn) {
            (this._listeners[name] = this._listeners[name] || []).push(fn);
            return this;
        },
        removeListener : function(name, fn) {
            if(arguments.length === 1) { // remove all
                this._listeners[name] = [];
            }
            else if(typeof(fn) === 'function') {
                var listeners = this._listeners[name];
                if(listeners !== undefined) {
                    var foundAt = -1;
                    for(var i = 0, len = listeners.length; i < len && foundAt === -1; i++) {
                        if(listeners[i] === fn) {
                            foundAt = i;
                        }
                    }

                    if(foundAt >= 0) {
                        listeners.splice(foundAt, 1);
                    }
                }
            }

            return this;
        },
        fire : function(name, args, context) {
            var listeners = this._listeners[name];
            // if args is not an array, make it an array
            args = args || [];
            if(!Array.isArray(args)){
                args = [args];
            }
            if(listeners !== undefined) {
                var data = {}, evt;
                for(var i = 0, len = listeners.length; i < len; i++) {
                    evt = new EventManager.EventArg(name, data);

                    listeners[i].apply(context || window, args.concat(evt));

                    data = evt.data;
                    if(evt.removed) {
                        listeners.splice(i, 1);
                        len = listeners.length;
                        --i;
                    }
                    if(evt.cancelled) {
                        break;
                    }
                }
            }
            return this;
        },
        hasListeners : function(name) {
            return (this._listeners[name] === undefined ? 0 : this._listeners[name].length) > 0;
        }
    };
    EventManager.eventify = function(object, manager) {
        var methods = EventManager.eventify.methods;
        manager = manager || new EventManager();

        for(var i = 0, len = methods.length; i < len; i++) (function(method) {
            object[method] = function() {
                return manager[method].apply(manager, arguments);
            };
        })(methods[i]);

        return manager;
    };
    EventManager.eventify.methods = ['addListener', 'removeListener', 'fire'];

    EventManager.EventArg = function(name, data) {
        this.name = name;
        this.data = data;
        this.cancelled = false;
        this.removed = false;
    };
    EventManager.EventArg.prototype = {
        cancel : function() {
            this.cancelled = true;
        },
        remove : function() {
            this.removed = true;
        }
    };

    return EventManager;
});



