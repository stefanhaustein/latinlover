goog.require("goog.string");

goog.provide("grammar");


/**
 * @enum {string}
 */
grammar.Numerus = {
  SINGULAR : "Sg.",
  PLURAL : "Pl."
};

/**
 * @enum {number}
 */
grammar.Person = {
  FIRST : 1,
  SECOND : 2,
  THIRD : 3
};

/**
 * @enum {string}
 */
grammar.Modus = {
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
grammar.Tempus = {
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
grammar.GenusVerbi = {
  AKTIV : "Akt.",
  PASSIV : "Pass."
};

/**
 * @enum {string}
 */
grammar.Genus = {
  MASCULINUM : "M.",
  FEMININUM : "F.",
  NEUTRUM : "N."
};

/**
 * @enum {string}
 */
grammar.Kasus = {
  NOMINATIV : "Nom.",
  GENITIV : "Gen.",
  DATIV : "Dat.",
  AKKUSATIV : "Akk.",
  ABLATIV : "Abl.",
  VOKATIV : "Vok.",
};

/**
 * @enum {string}
 */
grammar.WortArt = {
  SUBSTANTIV : "Substantiv",
  VERB : "Verb",
  ADJEKTIV : "Adjektiv"
};

/**
 * @constructor
 * @param {=string} opt_def
 */
grammar.Form = function(opt_def) {

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
 * @param {string}
 *            s
 */
grammar.Form.prototype.set = function(s) {
  s = s.toLowerCase();
  var found = true;
  switch (s.charAt(0)) {
  case '1':
    this.person = grammar.Person.FIRST;
    break;
  case '2':
    this.person = grammar.Person.SECOND;
    break;
  case '3':
    this.person = grammar.Person.THIRD;
    break;
  case 'a':
    if (goog.string.startsWith(s, "akt")) {
      this.genusVerbi = grammar.GenusVerbi.AKTIV;
    } else if (goog.string.startsWith(s, "abl")) {
      this.kasus = grammar.Kasus.ABLATIV;
    } else if (goog.string.startsWith(s, 'abl')) {
      this.kasus = grammar.Kasus.ABLATIV;
    } else if (goog.string.startsWith(s, 'akk')) {
      this.kasus = grammar.Kasus.AKKUSATIV;
    } else {
      found = false;
    }
    break;
  case 'd':
    if (goog.string.startsWith(s, 'dat')) {
      this.kasus = grammar.Casus.DATIV;
    } else {
      found = false;
    }
    break;
  case 'f':
    if (goog.string.startsWith(s, 'fut')) {
      if (goog.string.endsWith(s, "ii") || goog.string.endsWith(s, '2')) {
        this.tempus = grammar.Tempus.FUTUR_2;
      } else {
        this.tempus = grammar.Tempus.FUTUR_1;
      }
    } else {
      this.genus = grammar.Genus.FEMININUM;
    }
    break;
  case 'g':
    if (goog.string.startsWith(s, 'gerundium')) {
      this.modus = grammar.Modus.GERUNDIUM;
    } else if (goog.string.startsWith(s, 'gerundivum')) {
      this.modus = grammar.Modus.GERUNDIVUM;
    } else if (goog.string.startsWith(s, 'gen')) {
      this.kasus = grammar.Kasus.GENITIV;
    } else {
      found = false;
    }
    break;
  case 'i':
    if (goog.string.startsWith(s, 'ind')) {
      this.modus = grammar.Modus.INDIKATIV;
    } else if (goog.string.startsWith(s, 'inf')) {
      this.modus = grammar.Modus.INFINITIV;
    } else if (goog.string.startsWith(s, 'impf')
        || goog.string.startsWith(s, 'imperf')) {
      this.tempus = grammar.Tempus.IMPERFEKT;
    } else if (goog.string.startsWith(s, 'imp')) {
      if (this.modus || this.person) {
        this.tempus = grammar.Tempus.IMPERFEKT;
      } else {
        this.modus = grammar.Modus.IMPERATIV;
      }
    }
    break;
  case 'k':
    if (goog.string.startsWith(s, 'konj')) {
      this.modus = grammar.Modus.KONJUNKTIV;
    } else {
      found = false;
    }
    break;
  case 'm':
    this.genus = grammar.Genus.MASCULINUM;
    break;
  case 'n':
    this.genus = grammar.Genus.NEUTRUM;
    break;
  case 'p':
    if (goog.string.startsWith(s, 'pas')) {
      this.genusVerbi = grammar.GenusVerbi.PASSIV;
    } else if (goog.string.startsWith(s, 'part')) {
      this.modus = grammar.Modus.PARTIZIP;
    } else if (goog.string.startsWith(s, 'perf')) {
      this.tempus = grammar.Tempus.PERFEKT;
    } else if (goog.string.startsWith(s, 'plus')) {
      this.tempus = grammar.Tempus.PLUSQUAMPERFEKT;
    } else if (goog.string.startsWith(s, 'pl')) {
      this.numerus = grammar.Numerus.PLURAL;
    } else if (goog.string.startsWith(s, 'praes')) {
      this.tempus = grammar.Tempus.PRAESENS;
    } else if (goog.string.startsWith(s, 'praet')) {
      this.tempus = grammar.Tempus.IMPERFEKT;
    } else {
      found = false;
    }
    break;
  case 's':
    this.numerus = grammar.Numerus.SINGULAR;
    break;
  case 'v':
    if (goog.string.startsWith(s, 'vok')) {
      this.kasus = grammar.Kasus.VOKATIV;
    } else {
      found = false;
    }
    brek;
  default:
    found = false;
  } // switch
}; // fn

/**
 * @return {string} .
 */
grammar.Form.prototype.toString = function() {
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
 * @constructor
 */
grammar.Wort = function() {
  /** @type {grammar.WorArt} */
  this.art = null;

  /** @type {grammar.Genus} */
  this.genus = null;

  /** @type {Object.<string, string>} */
  this.formen = {};

  /** @type {string} The definition of this word */
  this.definition = '';
};

/**
 * @param grammar.Form form;
 * 
 */
grammar.Wort.prototype.setForm = function(form, s) {
  this.formen[form.toString()] = s;
  window.console.log(form.toString() + ": " + s);
};

