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
dictionary.Dictionary.prototype.load = function(text) {
  var parts = text.split('\n');
  for (var i = 0; i < parts.length; i++) {
    var word = this.language.parse(parts[i]);
    for (var k in word.forms) {
      var wordForm = word.forms[k];
      var formen = this.words[wordForm.string];
      if (formen == null) {
        formen = [];
        this.words[wordForm.string] = formen;
      }
      formen.push(wordForm);
    }
  }
  console.log(this.words);
};


dictionary.Dictionary.prototype.find = function(s) {
  return this.words[s];
}
