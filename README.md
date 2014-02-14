An implementation of HTML5 Drag and Drop API to provide a sortable list of items.

No external dependancies.

See demo here: http://bgrins.github.com/nativesortable/

## Usage

    var list = document.getElementByID("list");
    nativesortable(list, { change: onchange });

I would also recommend adding the following CSS:

    [draggable] {
      -moz-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
      user-select: none;
    }
    [draggable] * {
      -moz-user-drag: none;
      -khtml-user-drag: none;
      -webkit-user-drag: none;
      user-drag: none;
    }

This makes sure that

* Text does not get highlighted while dragging
* That native draggable elements (like `img` and `a` tags)
