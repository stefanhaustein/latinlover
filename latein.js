var latein = module.exports = exports = {};

var string = require("string");
var language = require("language");

latein.VOKALE = 'aeiouAEIOU';
latein.KONSONANTEN = 'bcdfghjklmnpqrstvwxyz' + 
                     'BCDFGHJKLMNPQRSTVWXYZ';

latein.FAELLE = [language.Kasus.NOMINATIV, 
                 language.Kasus.DATIV, 
                 language.Kasus.GENITIV,
                 language.Kasus.AKKUSATIV,
                 language.Kasus.ABLATIV,
                 language.Kasus.VOKATIV];
                 
latein.NUMERI = [language.Numerus.SINGULAR, language.Numerus.PLURAL];

latein.GENERA = [language.Genus.MASCULINUM, language.Genus.FEMININUM, language.Genus.NEUTRUM];

/**
 * Checks wether all characters in s are consonants.
 * 
 * @param {string} s
 * @return {boolean}
 */
latein.konsonanten = function(s) {
  for (var i = 0; i < s.length; i++) {
    if (latein.KONSONANTEN.indexOf(s.charAt(i)) == -1) {
      return false;
    }
  }
  return true;
};

latein.silben = function(s) {
  var silben = 0;
  for (var i = 0; i < s.length; i++) {
    if (latein.VOKALE.indexOf(s.charAt(i)) != -1) {
      silben++;
    }
  }
  return silben;
};

/**
 * @constructor 
 * @implements {language.Language}
 */
latein.Latein = function() {
};

/**
 * Initialisiert ein Wort incl. aller Formen aus der gegebenen Definition.
 * 
 * @param {string} def
 * @return {language.Word}
 */
latein.Latein.prototype.parse = function(def) {
  var word = new language.Word(def);
  var parts = def.split(':');
  var subParts = parts[0].split(',');
  switch(subParts[subParts.length - 1].trim().toUpperCase()) {
  case 'M': 
  case 'F': 
  case 'N': 
    this.initSubstantiv(word, subParts);
    break;
  default:
    this.initVerb(word, subParts);
    break;
  }
  return word;
};


/**
 * Bildet alle Formen eines Substantivs.
 * 
 * @param {language.Word} word
 * @param {Array.<string>} parts
 */
latein.Latein.prototype.initSubstantiv = function(word, parts) {
  word.wortArt = language.WortArt.SUBSTANTIV;
  switch(parts[parts.length - 1].toUpperCase().trim()) {
    case 'F': word.genus = language.Genus.FEMININUM; break;
    case 'M': word.genus = language.Genus.MASCULINUM; break;
    case 'N': word.genus = language.Genus.NEUTRUM; break;
    default: 
      throw ('Unrecognized genus "' + parts[parts.length - 1] + '"');
  }
  var nominativ = parts[0].trim();
  var genitiv = parts.length <= 2 ? nominativ : parts[1].trim();
  
  var bastelStamm = '';
  var form = new language.Form();
  
  if (genitiv.charAt(0) == '-') {
    if (latein.KONSONANTEN.indexOf(genitiv.charAt(1)) != -1) {
      var i = nominativ.length - 1;
      while (i >= 0 && nominativ.charAt(i) != genitiv.charAt(1)) {
        i--;
      }
      if (i === 0) throw ('Kann nominativendung nicht abtrennen in "' + nominativ + '"');
      bastelStamm = nominativ.substr(0, i);
    } else if (latein.VOKALE.indexOf(nominativ.charAt(nominativ.length - 1)) != -1) {
      bastelStamm = nominativ.substr(0, nominativ.length - 1);
    } else {
      bastelStamm = nominativ.substr(0, nominativ.length - 2);
    }
    
    genitiv = bastelStamm + genitiv.substr(1);
  } 
 
  var stamm = genitiv.substr(0, genitiv.length - 
      (string.endsWith(genitiv, 'i') && !string.endsWith(genitiv, 'ei') ? 1 : 2));
    
  if (bastelStamm === '') {
    bastelStamm = stamm;
  }

  var genitivEndung = genitiv.substr(stamm.length);
  
  var endungen = null;
  if (genitivEndung == 'is') {  // Konsonantische
    var r2 = nominativ.charAt(nominativ.length - 1) == 'e' ? 
        'e' : nominativ.substring(nominativ.length - 2);
    if (latein.konsonanten(stamm.substring(stamm.length - 2)) ||  // misch
        ((r2 == 'is' || r2 == 'es') && latein.silben(stamm + 'is') == latein.silben(nominativ))) {
      endungen = [['1','is','i','em','e','1'],
                  ['es','ium','ibus','es','ibus','es']];
    } else if ((r2 == 'is' || r2 == 'e' || r2 == 'al' || r2 == 'ar') &&  // i-stamm
        nominativ.substring(0, nominativ.length - r2.length) == stamm) {
      endungen = [['1', 'is', 'i', 'im/e', 'i', '1'],
                  ['es/ia', 'ium', 'ibus', 'es/ia', 'ibus', 'es/ia']];
    } else {  // reine konsonantische
      endungen = [['1' , 'is', 'i', 'em/1', 'e','1'], 
                  ['es/a', 'um', 'ibus', 'es/a', 'ibus', 'es/a']];
    }
  } else if (genitivEndung == 'us') {  // U
    endungen = [['1','us','ui/u','um/u','u','1'], 
                ['us/ua','uum','ibus','us/ua','ibus','us/ua']];
    
  } else if (genitivEndung == 'ei') {  // E
    endungen = [['1','ei','ei','em','e','1'],
                ['es','erum','ebus','es','ebus','es']];
  } else if (genitivEndung == 'i') {  // O
    if (string.endsWith(nominativ, 'us')) {
      endungen = [['1','i','o','um','o','e'],
                  ['a/i','orum','is','a/os','is','a/i']];
    } else {
      endungen = [['1','i','o','um','o','1'],
                  ['a/i','orum','is','a/os','is','a/i']];
    }
  } else if (genitivEndung == 'ae') { // A
    endungen = [['1','ae','ae','am','a','1'],
                ['ae','arum','is','as','is','ae']];
  } else {
    throw ('Deklination nicht erkannt fuer Genitivendung "' + genitivEndung + "'");
  }

  for (var n = 0; n < 2; n++) {
    form.numerus = n === 0 ? language.Numerus.SINGULAR : language.Numerus.PLURAL;
    var endungenN = endungen[n]; 
    for (var i = 0; i < latein.FAELLE.length; i++) {
      form.kasus = latein.FAELLE[i];
      var s = endungenN[i];
      if (s == '1') {
        s = nominativ;
      } else {
        var cut = s.indexOf('/');
        if (cut == -1) {
          s = stamm + s;
        } else if (form.genus == language.Genus.NEUTRUM) {
          s = stamm + s.substring(cut + 1);
        } else {
          s = stamm + s.substring(0, cut);
        }
      }
      word.setForm(form, s);
    }
  }
  
  // Unregelmaessigkeiten
  for (var i = 2; i < parts.length - 1; i++) {
    var s = parts[i].trim();
    switch(s.charAt(0)) {
    case '1': form.kasus = language.Kasus.NOMINATIV; break;
    case '2': form.kasus = language.Kasus.GENITIV; break;
    case '3': form.kasus = language.Kasus.DATIV; break;
    case '4': form.kasus = language.Kasus.AKKUSATIV; break;
    case '5': form.kasus = language.Kasus.ABLATIV; break;
    case '6': form.kasus = language.Kasus.VOKATIV; break;
    default: throw('Kasus error in "' + s + '"');
    }
    switch(s.charAt(1).toUpperCase()) {
    case 'S': form.numerus = language.Numerus.SINGULAR; break;
    case 'P': form.numerus = language.Numerus.PLURAL; break;
    default: throw('Numerus error in "' + s + '"');
    } 
    if (s.charAt(2) != '=') {
      throw ('"=" expected in "' + s + '" an position 3.');
    }
    s = s.substring(3).trim();
    if (s.charAt(0) == '-') {
      s = stamm + s.substring(1);
    }
    word.setForm(form, s);
  }

};


/**
 * Bildet alle Formen eines Verbs.
 * 
 * @param {language.Word} word
 * @param {Array.<string>} parts
 */
latein.Latein.prototype.initVerb = function(word, parts) {
  word.wortArt = language.WortArt.VERB;
  var cnt = parts.length;

  var s = string.trim(parts[cnt - 1]);
  var stamm1 = string.trim(parts[0]);
  var stamm2;
  var stamm3;
  var klasse;

  if (s != '1' && s != '2' && s != '3' && s != '4') {
    if (stamm1 == 'possum') {
      stamm1 = '';
      klasse = 7;
    } else if (string.endsWith(stamm1, 'sum')) {
      klasse = 6;
      stamm1 = stamm1.substr(0, stamm1.length - 3);
    } else {
      switch(stamm1) {
        case 'ferro': klasse = 8; break;
        case 'volo': klasse = 9; break;
        case 'nolo': klasse = 10; break;
        case 'malo': klasse = 11; break;
        case 'eo': klasse = 12; break;
        case 'fio:': throw 'klasse = 13';
        default: throw 'Syntaxfehler im lexikon: ' + stamm1;
      }
    }
  } else {
    klasse = parseInt(s, 10);

    if (string.endsWith(stamm1, 'r')) {
      stamm1 = stamm1.substring(0, stamm1.length - 1);
    }
    
    if (klasse == 3 && string.endsWith(stamm1, 'io')) {
      klasse = 5;
    }
    stamm1 = stamm1.substring(0, stamm1.length - (klasse == 2 || klasse == 5 ? 2 : 1));
  }
  
  if (cnt == 2 && klasse <= 5) {
    switch (klasse) {
      case 1: 
        stamm2 = stamm1 + 'av';
        stamm3 = stamm1 + 'at';
        break;
      case 2:
        stamm2 = stamm1 + 'ev';
        stamm3 = stamm1 + 'et';
        break;
      case 4: 
        stamm2 = stamm1 + 'v';
        stamm3 = stamm1 + 't';
        break;
      case 3:
      case 5: 
        stamm2 = stamm1 + 'iv';
        stamm3 = stamm1 + 'it';
        break;
    }
  } else {
    stamm2 = string.trim(parts[1]);
    if (string.endsWith(stamm2, ' sum')) {
      stamm3 = stamm2.substring(0, stamm2.length - 6);
      stamm2 = '#';
    } else {
      stamm2 = stamm2.substr(0, stamm2.length - 1);
      if (parts.length > 2) {
        stamm3 = string.trim(parts[2]);
        stamm3 = stamm3.substr(0, stamm3.length - 2);
      } else {
        stamm3 = '#';
      }
    }
  }
  
  var form = new language.Form();
 
  function insertForm(s) {
    if (klasse == 6) {
      if (s == 'proesse') {
        s = 'prodesse';
      } else if (string.startsWith(s, 'adfu')) {
        s += '+affu' + s.substr(6);
      } else if (string.startsWith(s, 'obfu')) {
        s += '+offu' + s.substr(6);
      }
    }
    // Insert (form, s, false);
    word.setForm(form, s);
  }
  
  function add12(s0, s) {
    // console.log('add12(' + s0 + ',' + s + ')');
    var parts = s.split(',');
    var parts0 = s0.split(',');
    var c = parts.length;
    var s1 = parts0[klasse - 1] || '';
    var index = 0;
    
    if (c == 1) {
      form.numerus = null;
      form.person = 0;
      insertForm(stamm1 + s1 + s);
    } else {
      for (var n = 0; n < 2; n++) {
        form.numerus = n === 0 ? language.Numerus.SINGULAR : language.Numerus.PLURAL;
        if (c == 2) {
          form.person = 0;
          insertForm(stamm1 + s1 + parts[index++]);  
        } else {
          for (form.person = 1; form.person <= 3; form.person++) {
            insertForm(stamm1 + s1 + parts[index++]);  
          }
        }
      }
      form.person = 0;
      form.numerus = null;
    }
  }
  
  function add15(s) {
    // console.log('add15('+s+')');
    add12('', s[klasse - 1]);
  }
  
  function add2(s) {
    form.genus = null;
    var parts = s.split(',');
    var index = 0;
    for (var n = 0; n < 2; n++) {
      form.numerus = latein.NUMERI[n];
      for (form.person = 1; form.person <= 3; form.person++) {
        insertForm(stamm2 + parts[index++]);
      }
    }
    form.person = 0;
    form.numerus = null;
  }
  
  function add3(s) {
    var index = 0;
    var parts = s.split(',');
    for (var g = 0; g < latein.GENERA.length; g++) {
      form.genus = latein.GENERA[g];
      for (var n = 0; n < latein.NUMERI.length; n++) {
        form.numerus = latein.NUMERI[n];
        var s1;
        if (form.numerus == language.Numerus.SINGULAR) {
          switch(form.genus) {
            case language.Genus.MASCULINUM: s1 = 'us'; break;
            case language.Genus.FEMININUM: s1 = 'a'; break;
            case language.Genus.NEUTRUM: s1 = 'um'; break;
          }
        } else {
          switch(form.genus) {
            case language.Genus.MASCULINUM: s1 = 'i'; break;
            case language.Genus.FEMININUM: s1 = 'ae'; break;
            case language.Genus.NEUTRUM: s1 = 'a'; break;
          }
        }
        
        for (form.person = 1; form.person <= 3; form.person++) {
          insertForm(stamm3 + s1 +' '+ parts[index++]);
        }
      }
    }
    form.genus = null;
  }
  
  console.log('klasse: ' + klasse);
  
  form.modus = language.Modus.INDIKATIV;
  form.tempus = language.Tempus.PRAESENS;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add15(['o,as,at,amus,atis,ant',
         'eo,es,et,emus,etis,ent',
         'o,is,it,imus,itis,unt',
         'o,s,t,mus,tis,unt',
         'io,is,it,imus,itis,iunt',

         'sum,es,est,sumus,estis,sunt',
         'possum,potes,potest,possumus,potestis,possunt',
         'fero,fers,fert,ferimus,fertis,ferunt',
         'volo,vis,vult,volumus,vultis,volunt',
         'nolo,non vis,non vult,nolumus,non vultis,nolunt',
         'malo,mavis,mavult,malumus,mavultis,malunt',
         'eo,is,it,imus,itis,eunt']);
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add15(['or,aris,atur,amur,amini,antur',
         'eor,eris,etur, emur,emini,entur',
         'or,eris,itur,imur,imini,untur',
         'or,ris,tur,mur,mini,untur',
         'ior,eris,itur,imur,imini,iuntur',

         '#',
         '#',
         'feror,ferris,fertur,ferimur,ferimini,feruntur',
         '#',
         '#',
         '#',
         '#']);

  form.tempus = language.Tempus.IMPERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add12('ab,eb,eb,eb,ieb,er,poter,fereb,voleb,noleb,maleb,ib',
        'am,as,at,amus,atis,ant');
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add12('a,e,e,e,ie,#,#,fere,#,#,#,#',
        'bar,baris,batur,bamur,bamini,bantur');

  form.tempus = language.Tempus.PERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  if (klasse === 12) {
    add12 ('','ii,isti,iit,iimus,istis,ierunt')
  } else {
    add2 ('i,isti,it,imus,istis,erunt');
  }
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add3('sum,es,est,sumus,estis,sunt');

  form.tempus = language.Tempus.PLUSQUAMPERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add2('eram,eras,erat,eramus,eratis,erant');
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add3('eram,eras,erat,eramus,eratis,erant');

  form.tempus = language.Tempus.FUTUR_1;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add15(['abo,abis,abit,abimus,abitis,abunt',
         'ebo,ebis,ebit,ebimus,ebitis,ebunt',
         'am,es,et,emus,etis,ent',
         'am,es,et,emus,etis,ent',
         'iam,ies,iet,iemus,ietis,ient',

         'ero,eris,erit,erimus,eritis,erunt',
         'potero,poteris,poterit,poterimus,poteritis,poterunt',
         'feram,feres,feret,feremus,feretis,ferent',
         'volam,voles,volet,volemus,voletis,volent',
         'nolam,noles,nolet,nolemus,noletis,nolent',
         'malam,males,malet,malemus,maletis,malent',
         'ibo,ibis,ibit,ibimus,ibitis,ibunt']);
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add15(['abor,aberis,abitur,abimur,abimini,abuntur',
         'ebor,eberis,ebitur,ebimur,ebimini,ebuntur',
         'ar,eris,etur,emur,emini,euntur',
         'ar,eris,etur,emur,emini,euntur',
         'iar,ieris,ietur,iemur,iemini,euntur',
         '#',
         '#',
         'ferar,fereris,feretur,feremur,feremini,fereuntur',
         '#',
         '#',
         '#',
         '#']);

  form.tempus = language.Tempus.FUTUR_2;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add2('ero,eris,erit,erimus,eritis,erint');
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add3('ero,eris,erit,erimus,eritis,erunt');

  form.modus = language.Modus.KONJUNKTIV;
  form.tempus = language.Tempus.PRAESENS;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add12 ('e,ea,a,a,ia,si,possi,fera,veli,noli,mali,ea','m,s,t,mus,tis,nt');
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add12 ('e,ea,a,a,ia,#,#,fera,#,#,#,#','r,ris,tur,mur,mini,ntur');

  form.tempus = language.Tempus.IMPERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add12('ar,er,er,r,er,ess,poss,ferr,vell,noll,mall,ir','em,es,et,emus,etis,ent');
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add12('a,e,e,,e,#,#,fer,#,#,#,#','rer,reris,retur,remur,remini,rentur');

  form.empus = language.Tempus.PERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add2('erim,eris,erit,erimus,eritis,erint');
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add3('sim,sis,sit,simus,sitis,sint');

  form.tempus = language.Tempus.PLUSQUAMPERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;
       add2 ('issem,isses,isset,issemus,issetis,issent');
  form.genusVerbi = language.GenusVerbi.PASSIV;
       add3 ('essem,esses,esset,essemus,essetis,essent');

  form.modus = language.Modus.IMPERATIV;

  form.tempus = language.Tempus.PRAESENS;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add15(['#,a,#,#,ate,#',
         '#,e,#,#,ete,#',
         '#,e,#,#,ite,#',
         '#,,#,#,te,#',
         '#,e,#,#,ite,#',
         '#,es,#,#,este,#',
         '#,potes,#,#,poteste,#',
         '#,fer,#,#,ferte,#',
         '#,noli,#,#,nolite,#',
         '#',
         '#',
         '#']);
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add15(['#,are,are,#,amini,amini',
         '#,ere,ere,#,emini,emini',
         '#,ere,ere,#,imini,imini',
         '#,re,re,#,mini,mini',
         '#,ere,ere,#,imini,imini',
         '#',
         '#',
         '#',
         '#',
         '#',
         '#',
         '#']);

  form.tempus = language.Tempus.FUTUR1;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add15(['#,ato,ato,#,atote,anto',
          '#,eto,eto,#,etote,ento',
          '#,ito,ito,#,itote,unto',
          '#,to,to,#,tote,unto',
          '#,ito,ito,#,itote,iunto',
          '#,esto,esto,#,estote,sunto',
          '#',
          '#,ferto,ferto,#,fertote,ferunto',
          '#',
          '#',
          '#',
          '#']);
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add15(['#,ator,ator,#,antor,antor',
         '#,etor,etor,#,entor,entor',
         '#,itor,itor,#,untor,untor',
         '#,tor,tor,#,untor,untor',
         '#,itor,itor,#,iuntor,iuntor',
         '#',
         '#',
         '#',
         '#',
         '#',
         '#',
         '#']);

  form.modus = language.Modus.INFINITIV;
  form.tempus = language.Tempus.PRAESENS;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add15 (['are','ere','ere','re','ere',
          'esse',
          'posse',
          'ferre',
          'velle',
          'nolle',
          'malle',
          'ire']);
  form.genusVerbi = language.GenusVerbi.PASSIV;
  add15 (['ari','eri','i','ri','i',
          '#',
          '#',
          'ferri',
          '#',
          '#',
          '#',
          '#']);
  form.tempus = language.Tempus.PERFEKT;
  form.genusVerbi = language.GenusVerbi.AKTIV;

  form.person = 0;
  form.numerus = null;
  insertForm (stamm2 + 'isse');

  form.genusVerbi = language.GenusVerbi.PASSIV;
  form.genus = language.Genus.MASCULINUM;
  insertForm (stamm3 + 'um esse');
  form.genus = language.Genus.FEMININUM;
  insertForm (stamm3 + 'am esse');
  form.genus = language.Genus.NEUTRUM;
  insertForm (stamm3 + 'um esse');

  form.modus = language.Modus.GERUNDIUM;
  form.tempus = null;
  form.genus = null;
  form.genusVerbi = null;
  add15(['andi','endi','endi','endi','iendi',
         '#',
         '#',
         '#',
         '#',
         '#',
         '#',
         'eundi']);

  form.modus = language.Modus.GERUNDIVUM;
  form.genus = language.Genus.MASCULINUM;
  add15(['andus','endus','endus','endus','iendus',
         '#','#', '#', '#',  '#',  '#',  '#']);
  form.genus = language.Genus.FEMININUM;
  add15(['anda','enda','enda','enda','ienda',
         '#','#', '#', '#',  '#',  '#',  '#']);

  form.genus = language.Genus.NEUTRUM;
  add15(['andum','endum','endum','endum','iendum',
         '#','#', '#', '#',  '#',  '#',  '#']);

  form.modus = language.Modus.SUPINUM;
  form.genus = null;
  insertForm(stamm3 + 'um');

  form.modus = language.Modus.PARTIZIP;
  form.tempus = language.Tempus.PRAESENS;
  form.genusVerbi = language.GenusVerbi.AKTIV;
  add12('a,e,e,e,ie,#,#,#,velens,nolens,#,ie','ns');

  form.tempus = language.Tempus.PERFEKT;
  form.genusVerbi = language.GenusVerbi.PASSIV;

  form.genus = language.Genus.MASCULINUM;
  insertForm(stamm3 + 'us');
  form.genus = language.Genus.FEMININUM;
  insertForm (stamm3 + 'a');
  form.genus = language.Genus.NEUTRUM;
  insertForm (stamm3 + 'um');

  form.tempus = language.Tempus.FUTUR_1;
  form.genusVerbi = language.GenusVerbi.AKTIV;

  form.genus = language.Genus.MASCULINUM;
  insertForm (stamm3+'urus');
  form.genus = language.Genus.FEMININUM;
  insertForm (stamm3+'ura');
  form.genus = language.Genus.NEUTRUM;
  insertForm (stamm3+'urum');
};

