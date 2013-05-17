var language = module.exports = exports = {}

var string = require("string");

/**
 * @interface 
 */
language.Language = function() {};

/**
 * @param {string} def
 * @return {language.Wort}
 */
language.Language.prototype.parse = function(def) {};


/**
 * @enum {string}
 */
language.Numerus = {
  SINGULAR : "Sg.",
  PLURAL : "Pl."
};

/**
 * @enum {number}
 */
language.Person = {
  FIRST : 1,
  SECOND : 2,
  THIRD : 3
};

/**
 * @enum {string}
 */
language.Modus = {
  INDIKARIV : "Ind.",
  IMPERATIV : "Imp.",
  KONJUNKTIV : "Konj.",
  INFINITIV : "Inf.",
  GERUNDIUM : "Gerundium",
  GERUNDIVUM : "Gerundivum",
  PARTIZIP : "Part.",
  SUPINUM : "Supinum"
};

/**
 * @enum {string}
 */
language.Tempus = {
  PRAESENS : "Praes.",
  IMPERFEKT : "Impf.",
  PERFEKT : "Perf",
  PLUSQUAMPERFEKT : "Plusqu.",
  FUTUR_1 : "Fut.1",
  FUTUR_2 : "Fut.2"
};

/**
 * @enum {string}
 */
language.GenusVerbi = {
  AKTIV : "Akt.",
  PASSIV : "Pass."
};

/**
 * @enum {string}
 */
language.Genus = {
  MASCULINUM : "M.",
  FEMININUM : "F.",
  NEUTRUM : "N."
};

/**
 * @enum {string}
 */
language.Kasus = {
  NOMINATIV : "Nom.",
  GENITIV : "Gen.",
  DATIV : "Dat.",
  AKKUSATIV : "Akk.",
  ABLATIV : "Abl.",
  VOKATIV : "Vok.",
};


/**
 * @constructor
 * @param {=string} opt_def
 */
language.Form = function(opt_def) {

  /** @type {Person} */
  this.person = null;

  /** @type {Numerus} */
  this.numerus = null;

  /** @type {Modus} */
  this.modus = null;

  /** @type {Tempus} */
  this.tempus = null;

  /** @type {GenusVerbi} */
  this.genusVerbi = null;

  /** @type {Kasus} */
  this.kasus = null;

  /** @type {Genus} */
  this.genus = null;

  if (opt_def) {
    var parts = opt_def.split(' ');
    for ( var i = 0; i < parts.length; i++) {
      this.set(parts[i]);
    }
  }
};

/**
 * Set a single aspect of the form determined by the given string.
 * @param {string} s
 */
language.Form.prototype.set = function(s) {
  s = s.toLowerCase();
  var found = true;
  switch (s.charAt(0)) {
  case '1':
    this.person = language.Person.FIRST;
    break;
  case '2':
    this.person = language.Person.SECOND;
    break;
  case '3':
    this.person = language.Person.THIRD;
    break;
  case 'a':
    if (string.startsWith(s, "akt")) {
      this.genusVerbi = language.GenusVerbi.AKTIV;
    } else if (string.startsWith(s, "abl")) {
      this.kasus = language.Kasus.ABLATIV;
    } else if (string.startsWith(s, 'abl')) {
      this.kasus = language.Kasus.ABLATIV;
    } else if (string.startsWith(s, 'akk')) {
      this.kasus = language.Kasus.AKKUSATIV;
    } else {
      found = false;
    }
    break;
  case 'd':
    if (string.startsWith(s, 'dat')) {
      this.kasus = language.Kasus.DATIV;
    } else {
      found = false;
    }
    break;
  case 'f':
    if (string.startsWith(s, 'fut')) {
      if (string.endsWith(s, "ii") || string.endsWith(s, '2')) {
        this.tempus = language.Tempus.FUTUR_2;
      } else {
        this.tempus = language.Tempus.FUTUR_1;
      }
    } else {
      this.genus = language.Genus.FEMININUM;
    }
    break;
  case 'g':
    if (string.startsWith(s, 'gerundium')) {
      this.modus = language.Modus.GERUNDIUM;
    } else if (string.startsWith(s, 'gerundivum')) {
      this.modus = language.Modus.GERUNDIVUM;
    } else if (string.startsWith(s, 'gen')) {
      this.kasus = language.Kasus.GENITIV;
    } else {
      found = false;
    }
    break;
  case 'i':
    if (string.startsWith(s, 'ind')) {
      this.modus = language.Modus.INDIKATIV;
    } else if (string.startsWith(s, 'inf')) {
      this.modus = language.Modus.INFINITIV;
    } else if (string.startsWith(s, 'impf')
        || string.startsWith(s, 'imperf')) {
      this.tempus = language.Tempus.IMPERFEKT;
    } else if (string.startsWith(s, 'imp')) {
      if (this.modus || this.person) {
        this.tempus = language.Tempus.IMPERFEKT;
      } else {
        this.modus = language.Modus.IMPERATIV;
      }
    }
    break;
  case 'k':
    if (string.startsWith(s, 'konj')) {
      this.modus = language.Modus.KONJUNKTIV;
    } else {
      found = false;
    }
    break;
  case 'm':
    this.genus = language.Genus.MASCULINUM;
    break;
  case 'n':
    if (string.startsWith(s, 'no')) {
      this.kasus = language.Kasus.NOMINATIV;
    } else {
      this.genus = language.Genus.NEUTRUM;
    }
    break;
  case 'p':
    if (string.startsWith(s, 'pas')) {
      this.genusVerbi = language.GenusVerbi.PASSIV;
    } else if (string.startsWith(s, 'part')) {
      this.modus = language.Modus.PARTIZIP;
    } else if (string.startsWith(s, 'perf')) {
      this.tempus = language.Tempus.PERFEKT;
    } else if (string.startsWith(s, 'plus')) {
      this.tempus = language.Tempus.PLUSQUAMPERFEKT;
    } else if (string.startsWith(s, 'pl')) {
      this.numerus = language.Numerus.PLURAL;
    } else if (string.startsWith(s, 'praes')) {
      this.tempus = language.Tempus.PRAESENS;
    } else if (string.startsWith(s, 'praet')) {
      this.tempus = language.Tempus.IMPERFEKT;
    } else {
      found = false;
    }
    break;
  case 's':
    this.numerus = language.Numerus.SINGULAR;
    break;
  case 'v':
    if (string.startsWith(s, 'vok')) {
      this.kasus = language.Kasus.VOKATIV;
    } else {
      found = false;
    }
    break;
  default:
    found = false;
  } // switch
}; // fn

/**
 * @return {string} .
 */
language.Form.prototype.toString = function() {
  var s = '';
  if (this.person) {
    s += this.person + '. ' + this.numerus + ' ';
  }
  if (this.modus) {
    s += this.modus + ' ';
  }
  if (this.tempus) {
    s += this.tempus + ' ';
  }
  if (this.genusVerbi) {
    s += this.genusVerbi + ' ';
  }
  if (this.kasus) {
    s += this.kasus + ' ';
  }
  if (!this.person && this.numerus) {
    s += this.numerus + ' ';
  }
  if (this.genus) {
    s += this.genus + ' ';
  }
  return s.trim();
};


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

  /** @type {language.Genus} */
  this.genus = null;

  /** @type {Object.<string, language.WortForm>} */
  this.forms = {};

  /** @type {string} The definition of this word */
  this.definition = definition;
};

/**
 * Set the specified form of this word. Used internally
 * by the code that parses the dictionary.
 * 
 * @param {language.Form} form
 * @param {string} s
 */
language.Word.prototype.setForm = function(form, s) {
  var key = form.toString();
  form = new language.Form(key);
  var wortForm = new language.WordForm(this, form, s);
  this.forms[key] = wortForm;
};


/**
 * @constructor
 * @struct 
 * 
 * @param {language.Word} word
 * @param {language.Form} form
 * @param {string} string
 */
language.WordForm = function(word, form, string) {
  /** @type{language.Word} */
  this.word = word;
  /** @type{language.Form} */
  this.form = form;
  /** @type{string} */
  this.string = string;
};

/**
 * @constructor
 * @param {language.Language}
 */
language.Dictionary = function(language) {
  /** @type {language.Language} */
  this.language = language;
  
  /** @type {Object.<string,language.wordForm} */
  this.words = {};
};

/**
 * Adds the given text file to the dictionary, line by line.
 * @param {string} text
 */
language.Dictionary.prototype.load = function(text) {
  var parts = text.split('\n');
  for (var i = 0; i < parts.length; i++) {
    var word = this.language.parse(parts[i]);
    for (var k in word.forms) {
      var wordForm = word.forms[k];
      var formen = this.words[wordForm.string];
      if (!formen) {
        formen = [];
        this.words[wordForm.string] = formen;
      }
      formen.push(wordForm);
    }
  }
  console.log(this.words);
};


language.Dictionary.prototype.find = function(s) {
  return this.words[s];
};
