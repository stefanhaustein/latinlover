goog.provide('language');

/**
 * @interface 
 */
language.Language = function() {};

/**
 * @param {string} def
 * @return {grammar.Wort}
 */
language.Language.prototype.parse = function(def) {};