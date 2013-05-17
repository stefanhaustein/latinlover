// Some fake closure stuff to avoid depending on closure for now.

var goog = module.exports = exports = {
  string: {}
};

goog.string.endsWith = function(s, w) {
  return s.indexOf(w, s.length - w.length) != -1;
};

goog.string.startsWith = function(s, w) {
  return s.lastIndexOf(w, 0) != -1;
};

goog.string.trim = function(s) {
  return s.trim();
};
