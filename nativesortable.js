
// nativesortable
// Author: Brian Grinstead MIT License
// Originally based on code found here:
// http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-examples

// Usage:
// var list = document.getElementByID("list");
// nativesortable(list, { change: onchange });

nativesortable = (function() {
    
    var supportsTouch = ('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch);
    var supportsDragAndDrop = !supportsTouch && (function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    })();
    
    
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
          el.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), " ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
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
    
    function closest(child, className) {
        var cur = child;
        while (cur) {
            if (hasClassName(cur, className)) {
                return cur;
            }
            cur = cur.parentNode;
            if ( !cur || !cur.ownerDocument || cur.nodeType === 11 ) {
                break;
            }
        }
        return null;
    }
    function moveUpToChildNode(parent, child) {
        var cur = child;
        if (cur == parent) { return null; }
        
        while (cur) {
            if (cur.parentNode === parent) {
                return cur;
            }
            
            cur = cur.parentNode;
            if ( !cur || !cur.ownerDocument || cur.nodeType === 11 ) {
                break;
            }
        }
        return null;
    }
    function prevent(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.returnValue = false;
    }
    
    function dragenterData(element, val) {
        if (arguments.length == 1) {
            return parseInt(element.getAttribute("data-child-dragenter")) || 0;
        }
        else if (!val) {
            element.removeAttribute("data-child-dragenter");
        }
        else {
            element.setAttribute("data-child-dragenter", Math.max(0, val));
        }
    }
    
    return function(element, opts) {
        if (!opts) {
            opts = { }; 
        }
        
        var warp = !!opts.warp;
        var stop = opts.stop || function() { };
        var start = opts.start || function() { };
        var change = opts.change || function() { };
        
        var currentlyDraggingElement = null;
        
        var handleDragStart = delegate(function(e) {
            if (supportsTouch) {
                prevent(e);
            }
            
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('Text', "*"); // Need to set to something or else drag doesn't start
            }
            
            currentlyDraggingElement = this;
            addClassName(currentlyDraggingElement, 'moving');
            
            [].forEach.call(element.childNodes, function(el) {
                if (el.nodeType === 1) {
                    addClassName(el, 'sortable-child');
                }
            });
            
            
            addFakeDragHandlers();
        });
        
        var handleDragOver = delegate(function(e) {
            if (!currentlyDraggingElement) {
                return true;
            }
            
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        });
        
        var handleDragEnter = delegate(function(e) {
        
            if (!currentlyDraggingElement || currentlyDraggingElement === this) {
                return true;
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            
            // Prevent dragenter on a child from allowing a dragleave on the container
            var previousCounter = dragenterData(this);
            dragenterData(this, previousCounter + 1);
            
            if (previousCounter == 0) {
                
                addClassName(this, 'over');
                
                if (!warp) {
                    if (isBelow(currentlyDraggingElement, this)) {
                        // Insert currently dragging element before.
                        this.parentNode.insertBefore(currentlyDraggingElement, this);
                    
                    }
                    else {
                        // Insert currently dragging element after.
                        this.parentNode.insertBefore(currentlyDraggingElement, this.nextSibling);
                    }
                }
            }
            
            return false;
        });
        
        var handleDragLeave = delegate(function(e) {
            
            // Prevent dragenter on a child from allowing a dragleave on the container
            var previousCounter = dragenterData(this);
            dragenterData(this, previousCounter - 1);
                            
            // This is a fix for child elements firing dragenter before the parent fires dragleave
            if (!dragenterData(this)) {
                removeClassName(this, 'over');
                dragenterData(this, false);
            }
        });
        
        var handleDrop = delegate(function(e) {
        
            if (e.type === 'drop') {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                if (e.preventDefault) {
                    e.preventDefault();
                }
            }
            if (this === currentlyDraggingElement) {
                return;
            }
            
            if (warp) { 
                var thisSibling = currentlyDraggingElement.nextSibling;
                this.parentNode.insertBefore(currentlyDraggingElement, this);
                this.parentNode.insertBefore(this, thisSibling);
            }
            
            change(this, currentlyDraggingElement);
        });
        
        var handleDragEnd = function(e) {

            currentlyDraggingElement = null;
            [].forEach.call(element.childNodes, function(el) {
                if (el.nodeType === 1) {
                    removeClassName(el, 'over');
                    removeClassName(el, 'moving');
                    removeClassName(el, 'sortable-child');
                    dragenterData(el, false);
                }
            });
            
            removeFakeDragHandlers();
        };
        
        function delegate(fn) {
            return function(e) {
                if (hasClassName(e.target, "sortable-child")) {
                    fn.apply(e.target, [e]);
                }
                else if (e.target !== element) {
                    // If a child is initiating the event or ending it, then use the container as context for the callback.
                    var context = closest(e.target, "sortable-child");
                    
                    if (e.type == 'dragstart' || e.type == 'mousedown' || e.type == 'touchstart') {
                        context = moveUpToChildNode(element, e.target);
                    }
                    if (context) {
                        fn.apply(context, [e]);
                    }
                }
            }
        }
        
        // Opera and mobile devices do not support drag and drop.  http://caniuse.com/dragndrop
        // Bind standard mouse/touch events as a polyfill.
        function addFakeDragHandlers() {
            if (!supportsDragAndDrop) {
                element.addEventListener(supportsTouch ? 'touchmove' : 'mouseover', handleDragEnter, false);
                element.addEventListener(supportsTouch ? 'touchmove' : 'mouseout', handleDragLeave, false);
                element.addEventListener(supportsTouch ? 'touchend' : 'mouseup', handleDrop, false);
                document.addEventListener(supportsTouch ? 'touchend' : 'mouseup', handleDragEnd, false);
                document.addEventListener("selectstart", prevent, false);
                document.addEventListener("dragstart", prevent, false);
            
            }
        
        }
        function removeFakeDragHandlers() {
            if (!supportsDragAndDrop) {
                
                element.removeEventListener('mouseover', handleDragEnter, false);
                element.removeEventListener('mouseout', handleDragLeave, false);
                element.removeEventListener(supportsTouch ? 'touchend' : 'mouseup', handleDrop, false);
                document.removeEventListener(supportsTouch ? 'touchend' : 'mouseup', handleDragEnd, false);
                document.removeEventListener("selectstart", prevent, false);
                document.removeEventListener("dragstart", prevent, false);
            }
        }
        
        
        if (supportsDragAndDrop) {
            element.addEventListener('dragstart', handleDragStart, false);
            element.addEventListener('dragenter', handleDragEnter, false);
            element.addEventListener('dragleave', handleDragLeave, false);
            element.addEventListener('drop', handleDrop, false);
            element.addEventListener('dragover', handleDragOver, false);
            element.addEventListener('dragend', handleDragEnd, false);
        }
        else {
            element.addEventListener(supportsTouch ? 'touchstart' : 'mousedown', handleDragStart, false);
        }
        
        [].forEach.call(element.childNodes, function(el) {
            if (el.nodeType === 1) {
                el.setAttribute("draggable", "true");
            }
        });
    }
})();
