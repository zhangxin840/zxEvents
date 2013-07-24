/* Author: Zhang Xin */
/* Inspiration form: Backbone.js, Gator.js, jQuery, Dean Edward, John Resig*/

/* For jsHint */
/* global window: false, document: false */
/* jshint devel: true */

;(function() {"use strict";

    // Namespace
    var TESTAPP = TESTAPP || {};
    
    // Module pattern
    TESTAPP.zxEvents = (function() {
        var addEvent = function(obj, type, fn) {
            var events;
            var useCapture;

            // For Microsoft
            // If not DOM event, attach callback to obj as custom events of any object
            if (obj.attachEvent && domEvents['on' + type]) {
                obj['e' + type + fn] = fn;
                // Use an anonymous function to fix 'this' reference in IE
                obj[type + fn] = function() {
                    // So 'this' points to obj
                    obj['e'+type+fn](window.event);
                };
                obj.attachEvent('on' + type, obj[type + fn]);
            }
            // For W3C
            else if (obj.addEventListener) {
                // For event delegation
                // Blur and focus do not bubble up, so we need to use event capturing
                useCapture = (type === 'blur' || type === 'focus');
                obj.addEventListener(type, fn, useCapture);
            }
            // For custom events of any object
            else {
                obj.events = obj.events || {};
                events = obj.events[type] || (obj.events[type] = []);
                events.push(fn);
            }
        };

        var removeEvent = function(obj, type, fn) {
            var events;

            // For Microsoft
            if (obj.detachEvent && domEvents['on' + type]) {
                obj.detachEvent('on' + type, obj[type + fn]);
                obj[type + fn] = null;
            }
            // For W3C
            else if (obj.removeEventListener) {
                obj.removeEventListener(type, fn, false);
            }
            // For custom events of any object
            else {
                obj.events = obj.events || {};
                events = obj.events[type] || (obj.events[type] = []);
                events.splice(events.indexOf(fn), 1);
            }
        };

        var triggerEvent = function(obj, eventName, args, context) {
            var i = 0;
            var event;
            var events;
            var ctx;

            // For W3C
            if (document.createEvent) {
                event = document.createEvent('HTMLEvents');
                event.initEvent(eventName, true, true);
            }
            // For Microsoft
            else if (document.createEventObject) {
                event = document.createEventObject();
                event.eventType = eventName;
            }
            event.eventName = eventName;

            // For W3C
            if (obj.dispatchEvent) {
                obj.dispatchEvent(event);
            }
            // For Microsoft
            else if (obj.fireEvent && domEvents['on' + eventName]) {// IE < 9
                obj.fireEvent('on' + event.eventType, event);
            }
            // For custom events
            else {
                obj.events = obj.events || {};
                events = obj.events[eventName] || (obj.events[eventName] = []);
                ctx = context || this;
                for ( i = 0; i < events.length; i++) {
                    events[i].apply(ctx, args);
                }
            }
        };

        var delegateEvent = function(obj, type, fn, selector) {
            var target;
            var matcher;
            var event;

            addEvent(obj, type, function(e) {
                // Fix IE
                if (e && e.target) {
                    event = e;
                    target = event.target;
                } else {
                    event = window.event;
                    target = event.srcElement;
                }

                matcher = getMatcher(target);
                if (matcher.call(target, selector)) {
                    // Bind 'this' to the target
                    fn.call(target, e);
                }
            });
        };

        // Returns function to use for determining if an element matches a selector
        var getMatcher = function(element) {
            var matchSelector = null;

            if (element.matches) {
                matchSelector = element.matches;
            }

            if (element.webkitMatchesSelector) {
                matchSelector = element.webkitMatchesSelector;
            }

            if (element.mozMatchesSelector) {
                matchSelector = element.mozMatchesSelector;
            }

            if (element.msMatchesSelector) {
                matchSelector = element.msMatchesSelector;
            }

            if (element.oMatchesSelector) {
                matchSelector = element.oMatchesSelector;
            }

            // if it doesn't match a native browser method
            // fall back to the self defined function
            if (!matchSelector) {
                matchSelector = zxMatchSelector;
            }

            return matchSelector;
        };

        var zxMatchSelector = function(selector) {
            // check for class name
            if (selector.charAt(0) === '.') {
                return (' ' + this.className + ' ').indexOf(' ' + selector.slice(1) + ' ') > -1;
            }
            // check for id
            if (selector.charAt(0) === '#') {
                return this.id === selector.slice(1);
            }
            // check for tag
            return this.tagName === selector.toUpperCase();
        };

        // For IE borwsers to support custom event
        var domEvents = {
            //<body> and <frameset> Events
            onload : 1,
            onunload : 1,
            //Form Events
            onblur : 1,
            onchange : 1,
            onfocus : 1,
            onreset : 1,
            onselect : 1,
            onsubmit : 1,
            //Image Events
            onabort : 1,
            //Keyboard Events
            onkeydown : 1,
            onkeypress : 1,
            onkeyup : 1,
            //Mouse Events
            onclick : 1,
            ondblclick : 1,
            onmousedown : 1,
            onmousemove : 1,
            onmouseout : 1,
            onmouseover : 1,
            onmouseup : 1
        };

        // Revealing  module
        var that = {
            addEvent : addEvent,
            remnoveEvent : removeEvent,
            triggerEvent : triggerEvent,
            delegateEvent : delegateEvent
        };

        return that;
    })();

    window.TESTAPP = TESTAPP;
})();



