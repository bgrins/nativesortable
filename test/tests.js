test( "Basic test", function() {
  ok( typeof window.nativesortable !== "undefined", "nativesortable is defined" );

  var list = document.createElement("ul");
  list.innerHTML = [1, 2, 3, 4, 5, 6].map(function(num) {
    return "<li>" + num + "</li>";
  }).join("\n");

  equal (list.children.length, 6, "Correct number of nodes");

  nativesortable(list, function() {
    // TODO: simulate drag events and test change
  });

  for (var i = 0; i < list.children.length; i++) {
    ok (list.children[i].hasAttribute("draggable"), "Child is draggable");
  }
});