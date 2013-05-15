goog.provide('dictionary');


/**
 * @constructor
 * @param {language.Language}
 */
dictionary.Dictionary = function(language) {
  /** @type {language.Language} */
  this.language = language;
  
  /** @type {Object.<string,language.wordForm} */
  this.words = {};
};

/**
 * Adds the given text file to the dictionary, line by line.
 * @param {string} text
 */
dictionary.Dictionary.load = function(text) {
  var parts = text.split('\n');
  for (var i = 0; i < parts.length; i++) {
    var word = language.parse(parts[i]);
    for (var k in word.forms) {
      var wordForm = word.forms[k];
      this.words[f.string] = wordForm;
    }
  }
};