// nativesortable
// Autho: Brian Grinstead MIT License
// Originally based on code found here:
// http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-examples

// Usage:
// var list = document.getElementByID("list");
// nativesortable(list, "li");

nativesortable = (function() {
    
    // Utilities
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
    
    return function(element, childSelector) {
    
        
        var currentlyDraggingElement = null;
        var placeholder = null;
        
        function handleDragStart(e) {
        
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', "*"); // Need to set to something
            
            currentlyDraggingElement = this;
            addClassName(currentlyDraggingElement, 'moving');
            
            // Code to deal with placeholders (see demo here for an idea: http://jqueryui.com/demos/sortable/)
            //placeholder = currentlyDraggingElement.cloneNode();
            //placeholder.style.visibility = "hidden";
            //placeholder.removeAttribute("draggable");
            //addClassName(placeholder, "placeholder");
            
        }
        function handleDragOver(e) {
            if (!currentlyDraggingElement) {
                return true;
            }
            
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            //e.dataTransfer.dropEffect = 'move';
            
            //e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
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
            removeClassName(this, 'over');
        }
        
        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            if (isBelow(currentlyDraggingElement, this)) {
                // Insert before.
                this.parentNode.insertBefore(currentlyDraggingElement, this);
            
            }
            else {
                // Insert after.
                this.parentNode.insertBefore(currentlyDraggingElement, this.nextSibling);
            }
            
            //placeholder.parentNode.removeChild(placeholder);
        }
        
        function delegate(fn) {
            return function(e) {
            
                // Images and links are draggable by default.  Make them trigger events for the parent.
                if (matchesSelector(e.target, childSelector)) {
                    fn.apply(e.target, [e]);
                }
                /*
                else if (e.target.tagName === "IMG" || e.target.tagName === "A") {
                    context = closest(e.target, childSelector);
                    
                    if (context) {
                        fn.apply(context, [e]);
                        
                        if (e.type == "dragover" || e.type == "dragleave") {
                            addClassName(context, 'over');
                        }
                    }
                }
                */
            }
        }
        
        function handleDragEnd(e) {
            
            //[].forEach.call(element.querySelectorAll(".placeholder"), function(el) {
            //    el.parentNode.removeChild(el);
            //});
            currentlyDraggingElement = null;
            [].forEach.call(element.querySelectorAll(childSelector), function(el) {
                removeClassName(el, 'over');
                removeClassName(el, 'moving');
            });
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
