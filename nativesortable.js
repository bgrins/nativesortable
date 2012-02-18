
// nativesortable
// Author: Brian Grinstead MIT License
// Originally based on code found here:
// http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-examples

// Usage:
// var list = document.getElementByID("list");
// nativesortable(list, "li" [, { change: onchange }]);

nativesortable = (function() {
    
    function hasClassName(el, name) {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }

    function addClassName (el, name) {
        if (!hasClassName(el, name)) {
          el.className = el.className ? [el.className, name].join(' ') : name;
        }
    }
    
    function removeClassName(el, name) {
        if (hasClassName(el, name)) {
          var c = el.className;
          el.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
        }
    }
    
    function matchesSelector(el, selector) {
        if (el.matchesSelector)
            return el.matchesSelector(selector);
        if (el.webkitMatchesSelector)
            return el.webkitMatchesSelector(selector);
        if (el.mozMatchesSelector)
            return el.mozMatchesSelector(selector);
        if (el.msMatchesSelector)
            return el.msMatchesSelector(selector);
        return false;
    }
    
    function isBelow(el1, el2) {
    
        var parent = el1.parentNode;
        if (el2.parentNode != parent) {
            return false;
        }
        
        var cur = el1.previousSibling;
        while (cur && cur.nodeType !== 9) {
            if (cur === el2) {
                return true;
            }
            cur = cur.previousSibling;
        }
        return false;
    }
    
    function closest(child, selector) {
        var cur = child;
        while (cur) {
            if (matchesSelector(cur, selector)) {
                return cur;
            }
            cur = cur.parentNode;
            if ( !cur || !cur.ownerDocument || cur.nodeType === 11 ) {
                break;
            }
        }
        return null;
    }
    
    function dragenterData(element, val) {
        if (arguments.length == 1) {
            return parseInt(element.getAttribute("data-child-dragenter")) || 0;
        }
        else if (!val) {
            element.removeAttribute("data-child-dragenter");
        }
        else {
            element.setAttribute("data-child-dragenter", val);
        }
    }
    
    return function(element, childSelector, opts) {
        if (!opts) {
            opts = { }; 
        }
        
        var currentlyDraggingElement = null;
        
        function handleDragStart(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', "*"); // Need to set to something or else drag doesn't start
            
            currentlyDraggingElement = this;
            addClassName(currentlyDraggingElement, 'moving');
        }
        function handleDragOver(e) {
            if (!currentlyDraggingElement) {
                return true;
            }
            
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }
        
        function handleDragEnter(e) {
            if (!currentlyDraggingElement) {
                return true;
            }
            
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            addClassName(this, 'over');
            return false;
        }
        
        function handleDragLeave(e) {
            // This is a fix for child elements firing dragenter before the parent fires dragleave
            if (!dragenterData(this)) {
                removeClassName(this, 'over');
                dragenterData(this, false);
            }
        }
        
        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            if (this == currentlyDraggingElement) {
                return;
            }
            
            if (isBelow(currentlyDraggingElement, this)) {
                // Insert before.
                this.parentNode.insertBefore(currentlyDraggingElement, this);
            
            }
            else {
                // Insert after.
                this.parentNode.insertBefore(currentlyDraggingElement, this.nextSibling);
            }
            
            if (opts.change) {
                opts.change(this, currentlyDraggingElement);
            }
        }
        
        function handleDragEnd(e) {
            currentlyDraggingElement = null;
            [].forEach.call(element.querySelectorAll(childSelector), function(el) {
                removeClassName(el, 'over');
                removeClassName(el, 'moving');
                dragenterData(el, false);
            });
        }
        
        function delegate(fn) {
        
            return function(e) {
                if (matchesSelector(e.target, childSelector)) {
                    fn.apply(e.target, [e]);
                }
                else if (e.target !== element) {
                    
                    context = closest(e.target, childSelector);
                    
                    if (context) {
                    
                        // Prevent dragenter on a child from allowing a dragleave on the container
                        var previousCounter = dragenterData(context);
                        if (e.type === "dragenter") {
                            dragenterData(context, previousCounter + 1);
                        }
                        if (e.type === "dragleave") {
                            dragenterData(context, previousCounter - 1);
                        }
                        
                        // If a child is initiating the event or ending it, then use the callback for the container.
                        if (e.type !== "dragleave") {
                            fn.apply(context, [e]);
                        }
                    }
                }
            }
        }
        
        element.addEventListener('dragstart', delegate(handleDragStart), false);
        element.addEventListener('dragenter', delegate(handleDragEnter), false)
        element.addEventListener('dragover', delegate(handleDragOver), false);
        element.addEventListener('dragleave', delegate(handleDragLeave), false);
        element.addEventListener('drop', delegate(handleDrop), false);
        element.addEventListener('dragend', delegate(handleDragEnd), false);

        [].forEach.call(element.querySelectorAll(childSelector), function(el) {
            el.setAttribute("draggable", "true");
        });
    }
})();
