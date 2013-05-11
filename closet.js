// Some fake closure stuff to avoid depending on closure for now.

goog = {
  provide: function(name) {
    var parts = name.split('.');
    window.console.log(parts);
    var current = window;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!current[p]) current[p] = {};
      current = current[p];
    }
  },
  require: function() {}
};

goog.provide('goog.string');

goog.string.endsWith = function(s, w) {
  return s.indexOf(w, s.length - w.length) != -1;
};

goog.string.startsWith = function(s, w) {
  return s.lastIndexOf(w, 0) != -1;
};

goog.string.trim = function(s) {
  return s.trim();
};
