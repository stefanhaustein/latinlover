var language = module.exports = exports = {}

var grammar = require("grammar");

/**
 * @interface 
 */
language.Language = function() {};

/**
 * @param {string} def
 * @return {grammar.Wort}
 */
language.Language.prototype.parse = function(def) {};


/**
 * @enum {string}
 */
language.WortArt = {
  SUBSTANTIV : "Substantiv",
  VERB : "Verb",
  ADJEKTIV : "Adjektiv"
};


/**
 * @constructor
 */
language.Word = function(definition) {
  /** @type {language.WortArt} */
  this.art = null;

  /** @type {grammar.Genus} */
  this.genus = null;

  /** @type {Object.<string, grammar.WortForm>} */
  this.forms = {};

  /** @type {string} The definition of this word */
  this.definition = definition;
};

/**
 * Set the specified form of this word. Used internally
 * by the code that parses the dictionary.
 * 
 * @param {grammar.Form} form
 * @param {string} s
 */
language.Word.prototype.setForm = function(form, s) {
  var key = form.toString();
  form = new grammar.Form(key);
  var wortForm = new language.WordForm(this, form, s);
  this.forms[key] = wortForm;
};


/**
 * @constructor
 * @struct 
 * 
 * @param {grammar.Word} word
 * @param {grammar.Form} form
 * @param {string} string
 */
language.WordForm = function(word, form, string) {
  /** @type{language.Word} */
  this.word = word;
  /** @type{grammar.Form} */
  this.form = form;
  /** @type{string} */
  this.string = string;
};


