zxEvents
========

JavaScript event binding module.


## Highlights:

* Support legacy browsers

* Bind events to any objects

* Bind DOM events and custom events with the same interface

* Event delegation

* Modularized JS programming pattern

* JSHint code quality


## Usage:

    // Dom events
    zxEvents.addEvent(element, "click", logThis);
    zxEvents.addEvent(removeEventLink, "click", function() {
      zxEvents.remnoveEvent(element, "click", logThis);
    });
    
    // Custom events
    zxEvents.addEvent(testObject, "customEvent", logThis);
    zxEvents.addEvent(testObject, "customEvent", logValue);
    zxEvents.triggerEvent(testObject, "customEvent", [1]);
    zxEvents.triggerEvent(testObject, "customEvent", [1], testObject);
    
    // Event delegation
    zxEvents.delegateEvent(document.getElementsByTagName("body")[0], "click", logThis, "#test-delegate-target");


# About event module design

Event binding is never easy.

There are several features that could be considered to support in an event binding module:

* Cross bowser event binding

*	Event delegation

*	Custom events

*	Event listening

*	Mimic events bubbling

Cross browser maybe the lowest hanging fruit. Support for custom binding and mimic events bubbling for event delegation could be very tricky.

Generally, we are there are two kinds of events about event binding:

*	DOM events like 'click', 'keydown'. They are bound to element objects, triggered by browser, and have event bubbling or capturing.

*	Custom events. They can be bound to any object. You could use a subscriber pattern to support event listening.

Most libraries or technics do not support DOM events and custom events at the same time:

*	Gator.js only deal with DOM events.

*	Backbone.Events only support custom bindings actuarially, it delegate DOM event bindings to other libraries like jQuery or Zepto.

**What zxEvents trying to do is to support DOM events and custom events in the same interface.**

This is the addEvent function in zxEvents:

        var addEvent = function(obj, type, fn) {
            var events;
            var useCapture;
        
            // For Microsoft
            // If not DOM event, attach callback to obj as custom events of any object
            if (obj.attachEvent && domEvents['on'+type]) {
                obj['e'+ type + fn] = fn;
                // Use an anonymous function to fix 'this' reference in IE
                obj[type + fn] = function() {
                    // So 'this' points to obj
                    obj['e'+type+fn](window.event);
                }
                obj.attachEvent('on'+ type, obj[type + fn]);
            }
            // For W3C
            else if (obj.addEventListener) {
                // For event delegation
                // Blur and focus do not bubble up, so we need to use event capturing
                useCapture = (type == 'blur'|| type == 'focus');
                obj.addEventListener(type, fn, useCapture);
            }
            // For custom events of any object
            else {
                obj.events || (obj.events = {});
                events = obj.events[type] || (obj.events[type] = []);
                events.push(fn);
            }
        };

With this function, you can bind to any object DOM events or customs, in the same interface.
Other detail explanations could be found in comment of source code.


## About mouseenter/leave

### What Gator.js do to support mouseenter/leave:

It just bind them as mouseover and mouseout. That's not a good implementation.

    Gator.addEvent=function(gator,type,callback){
        if(gator.element.addEventListener){
            returnoldAddEvent(gator,type,callback);
        }
        // internet explorer does not support event capturing
        // but does have fallback events to use that will bubble
        if(type=='focus'){
            type='focusin';
        }
        if(type=='blur'){
            type='focusout';
        }
        gator.element.attachEvent('on'+type,callback);
    };
    

### How jQuery deal with mouseenter/leave:

jQuery create a fix function, and do event-time checks.

    jQuery.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout"
    }, function( orig, fix ) {
            jQuery.event.special[ orig ] = {
                    delegateType: fix,
                    bindType: fix,
    
                    handle: function( event ) {
                            var ret,
                                    target = this,
                                    related = event.relatedTarget,
                                    handleObj = event.handleObj;
    
                            // For mousenter/leave call the handler if related is outside the target.
                            // NB: No relatedTarget if the mouse left/entered the browser window
                            if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
                                    event.type = handleObj.origType;
                                    ret = handleObj.handler.apply( this, arguments );
                                    event.type = fix;
                            }
                            return ret;
                    }
            };
    });


## About mimic event bubbling

Gators.js use a stack to record elements that matches the selector from the event target all the way up to the bound element(or the root element).
Then the callbacks in stack will be invoked level by level, if any of these callbacks returned false or stopped  event bubbling, the process will return.
    
    for (selector in _handlers[id][type]) {
        if (_handlers[id][type].hasOwnProperty(selector)) {
            match = _matchesSelector(target, selector, _gator_instances[id].element);
    
            if (match && Gator.matchesEvent(type, _gator_instances[id].element, match, selector == '_root', e)) {
                _level++;
                _handlers[id][type][selector].match = match;
                matches[_level] = _handlers[id][type][selector];
            }
        }
    }
    
    // stopPropagation() fails to set cancelBubble to true in Webkit
    // @see http://code.google.com/p/chromium/issues/detail?id=162270
    e.stopPropagation = function () {
        e.cancelBubble = true;
    };
    
    for (i = 0; i <= _level; i++) {
        if (matches[i]) {
            for (j = 0; j < matches[i].length; j++) {
                if (matches[i][j].call(matches[i].match, e) === false) {
                    Gator.cancel(e);
                    return;
                }
    
                if (e.cancelBubble) {
                    return;
                }
            }
        }
    }


# Inspirations:

Backbone.js source code

http://backbonejs.org/#Events-on	

Gator.js source code

https://github.com/ccampbell/gator

Dean Edward’s blog

http://dean.edwards.name/weblog/2005/10/add-event/

http://therealcrisp.xs4all.nl/upload/addEvent_dean.html#

John Resig’s blog

http://ejohn.org/projects/flexible-javascript-events/

Event binding Contest

http://www.quirksmode.org/blog/archives/2005/09/addevent_recodi.html

Events models

http://www.quirksmode.org/js/events_advanced.html

Support events

http://www.quirksmode.org/dom/events/index.html

Delegating

http://net.tutsplus.com/tutorials/javascript-ajax/quick-tip-javascript-event-delegation-in-4-minutes/

Custom events

http://stackoverflow.com/questions/5342917/custom-events-in-ie-without-using-libraries

jQuery source code

http://code.jquery.com/jquery-1.10.2.js




