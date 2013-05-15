goog.require("grammar");
goog.require("goog.string");

goog.provide("latein");


latein.VOKALE = 'aeiouAEIOU';
latein.KONSONANTEN = 'bcdfghjklmnpqrstvwxyz' + 
                     'BCDFGHJKLMNPQRSTVWXYZ';

latein.FAELLE = [grammar.Kasus.NOMINATIV, 
                 grammar.Kasus.DATIV, 
                 grammar.Kasus.GENITIV,
                 grammar.Kasus.AKKUSATIV,
                 grammar.Kasus.ABLATIV,
                 grammar.Kasus.VOKATIV];

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
}

latein.silben = function(s) {
  var silben = 0;
  for (var i = 0; i < s.length; i++) {
    if (latein.VOKALE.indexOf(s.charAt(i)) != -1) {
      silben++;
    }
  }
  return silben;
}

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
  var parts = def.split(':');
  var cut = def.indexOf(':');
  var word = new language.Word(def.substring(cut + 1));
  switch(parts[0].trim().toUpperCase()) {
  case 'S': 
    this.initSubstantiv(word, parts[1]);
    break;
  default:
    window.console.log("NYI: Wortart " + parts[0]);
  }
  return word;
};


/**
 * Bildet alle Formen eines Substantivs.
 * 
 * @param {language.Word} wors
 * @param {string} lat
 */
latein.Latein.prototype.initSubstantiv = function(word, lat) {
  word.wortArt = language.WortArt.SUBSTANTIV;
  var parts = lat.split(',');
  switch(parts[parts.length - 1].toUpperCase().trim()) {
    case 'F': word.genus = grammar.Genus.FEMININUM; break;
    case 'M': word.genus = grammar.Genus.MASCULINUM; break;
    case 'N': word.genus = grammar.Genus.NEUTRUM; break;
    default: 
      throw ('Unrecognized genus "' + parts[parts.length - 1] + '" in "' + lat + '"');
  }
  var nominativ = parts[0].trim();
  var genitiv = parts.length <= 2 ? nominativ : parts[1].trim();
  
  var bastelStamm = '';
  var form = new grammar.Form();
  
  if (genitiv.charAt(0) == '-') {
    if (latein.KONSONANTEN.indexOf(genitiv.charAt(1)) != -1) {
      var i = nominativ.length - 1;
      while (i >= 0 && nominativ.charAt(i) != genitiv.charAt(1)) {
        i--;
      }
      if (i == 0) throw ('Kann nominativendung nicht abtrennen in "' + nominativ + '"');
      bastelStamm = nominativ.substring(0, i);
    } else if (latein.VOKALE.indexOf(nominativ.charAt(nominativ.length - 1)) != -1) {
      bastelStamm = nominativ.substring(0, nominativ.length - 1);
    } else {
      bastelStamm = nominativ.substring(0, nominativ.length - 2);
    }
    
    genitiv = bastelStamm + genitiv.substring(1);
  } 
 
  var stamm = genitiv.substring(0, genitiv.length - 
      (goog.string.endsWith(genitiv, 'i') && !goog.string.endsWith(genitiv, 'ei') ? 1 : 2));
    
  if (bastelStamm == '') {
    bastelStamm = stamm;
  }

  var genitivEndung = genitiv.substring(stamm.length);
  
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
    if (goog.string.endsWith(nominativ, 'us')) {
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
    form.numerus = n == 0 ? grammar.Numerus.SINGULAR : grammar.Numerus.PLURAL;
    endungenN = endungen[n]; 
    for (var i = 0; i < latein.FAELLE.length; i++) {
      form.kasus = latein.FAELLE[i];
      var s = endungenN[i];
      if (s == '1') {
        s = nominativ;
      } else {
        var cut = s.indexOf('/');
        if (cut == -1) {
          s = stamm + s;
        } else if (form.genus == grammar.Genus.NEUTRUM) {
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
    s = parts[i].trim();
    switch(s.charAt(0)) {
    case '1': form.kasus = grammar.Kasus.NOMINATIV; break;
    case '2': form.kasus = grammar.Kasus.GENITIV; break;
    case '3': form.kasus = grammar.Kasus.DATIV; break;
    case '4': form.kasus = grammar.Kasus.AKKUSATIV; break;
    case '5': form.kasus = grammar.Kasus.ABLATIV; break;
    case '6': form.kasus = grammar.Kasus.VOKATIV; break;
    default: throw('Kasus error in "' + s + '"');
    }
    switch(s.charAt(1).toUpperCase()) {
    case 'S': form.numerus = grammar.Numerus.SINGULAR; break;
    case 'P': form.numerus = grammar.Numerus.PLURAL; break;
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


/*
uses
  crt, xsystem, xString, collects, xfile, xdos, env,
  allgem;


Type
  tStatistik = Record
    count: Integer;
    ok: real;
  end;


  tLatein = Object (tWort)
    Procedure Dekliniere (Dekl: Char; form: tForm; const nom, stamm: String; gen: tGenus);
    Procedure InitVerb (lat: String); Virtual;
    Procedure InitSubstantiv (lat: String); Virtual;
  end;


const
  Stat: tStatistik = (count: 0; ok: 0);


var
  lexikon: tStringCollection;
  Ident: tLongEnvironment;


function Stat2Str (Stat: tStatistik): String;
  begin
    if stat.count = 0 then
      stat2Str := 'Keine Abfragen'
    else
      Stat2str := 'Abfragen: '+int2str (stat.count,0)+ ' davon richtig: '+real2str (stat.ok,9,2)+ ' = '+
               real2str ((100*stat.ok) / stat.count,9,2)+ ' %';
  end;


Function Silben (const S: String): Integer;
  var
    cnt, i: Integer;
  begin
    cnt := 0;
    for i := 1 to length (s) do
      if s[i] in vokale then
        inc (cnt);

    silben := cnt;
  end;


Procedure tlatein.InitVerb (lat: String);

  Var
    Form: tForm;
    Stamm1, Stamm2, Stamm3: String; {verbstamm}
    Klasse: Integer;                {konjugationsklasse}

  Procedure InsertForm (s: String);
    begin
      if klasse = 6 then
        begin
          if s = 'proesse' then
            s := 'prodesse'
          else if startStr ('adfu', s) then
            s := s + '+affu' + fromStr (s, 5)
          else if StartStr ('obfu', s) then
            s := s + '+offu' + fromStr (s, 5);
        end;

      Insert (form, s, false);
    end;

  Procedure Add12 (const s0:String; s: String);
    var
      s1: string;
      c: Integer;
      n: tNumerus;
      p: tPerson;
    begin
      c := countPartsByChar (s, ',');

      s1 :=  AlltrimStr (GetPartStrByChar (s0, Klasse, ','));

      If c = 1 then
        begin
          form.Numerus := NullNumerus;
          form.Person := 0;
          InsertForm (stamm1 + s1 + s);
        end
      else
        for n := Singular to plural do
          begin
            form.Numerus := N;
            If c = 2 then
              begin
                form.Person := 0;
                InsertForm (stamm1+ s1 + CutStrByChar (s, ','));
              end
            else
              for p := 1 to 3 do
                begin
                  form.person := p;
                  InsertForm (stamm1+ s1 + CutStrByChar (s, ','));
                end;
          end;
      form.person := 0;
      form.Numerus := NullNumerus;
    end;

  Procedure add15 (const S1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12: string);
    begin
      case klasse of
        1: add12 ('', s1);
        2: add12 ('', s2);
        3: add12 ('', s3);
        4: add12 ('', s4);
        5: add12 ('', s5);
        6: add12 ('', s6);
        7: add12 ('', s7);
        8: add12 ('', s8);
        9: add12 ('', s9);
        10: add12 ('', s10);
        11: add12 ('', s11);
        12: add12 ('', s12);
      end;
    end;

  Procedure add2 (s: String);
    var
      n: tNumerus;
      p: tPerson;
    begin
      form.genus := NullGenus;

      for n := singular to plural do
        for p := 1 to 3 do
          begin
            form.numerus := n;
            form.person := p;

            InsertForm (stamm2 + CutStrByChar (s, ','));
          end;

      form.person := 0;
      form.Numerus := NullNumerus;
    end;

  Procedure add3 (const s: String);
    var
      s1, s2: String;
      g: tGenus;
      n: tNumerus;
      p: tPerson;

    begin
      for g := masculinum to neutrum do
        begin
          form.Genus := g;
          s2 := s;
          for n := singular to plural do
            begin
              form.Numerus := n;
              If form.Numerus = singular then
                case form.genus of
                  masculinum: s1 := 'us';
                  femininum:  s1 := 'a';
                  neutrum:    s1 := 'um';
                end
              else
                case form.genus of
                  masculinum: s1 := 'i';
                  femininum:  s1 := 'ae';
                  neutrum:    s1 := 'a';
                end;

              for p := 1 to 3 do
                begin
                  form.Person := p;
                  InsertForm (stamm3 + s1 +' '+ CutStrByChar (s2, ','));
                end;
            end;
        end;

      form.Genus := nullGenus;
    end;

  var
    cnt: Integer;
    s: String;
  begin
    genus := NullGenus;

    cnt := CountPartsByChar (lat, ',');

    s := AlltrimStr (GetPartStrByChar (lat, cnt, ','));

    stamm1 := alltrimStr (GetPartStrByChar (lat, 1, ','));

    if (s < '1') or (s > '4') then
      begin
        if stamm1 = 'possum' then
          begin
            stamm1 := '';
            klasse := 7;
          end
        else if (length (stamm1) >= 3) and (rightstr (stamm1,3) = 'sum') then
          begin
            klasse := 6;
            stamm1 := leftStr (stamm1, length (stamm1) - 3);
          end
        else
          begin
            if stamm1 = 'ferro' then
              klasse := 8
            else if stamm1 = 'volo' then
              klasse := 9
            else if stamm1 = 'nolo' then
              klasse := 10
            else if stamm1 = 'malo' then
              klasse := 11
            else if stamm1 = 'eo' then
              klasse := 12
            else if stamm1 = 'fio' then
              fatal ('klasse := 13')
            else
              fatal ('syntaxfehler im lexikon: '+lat);

            stamm1 := '';
          end;
      end
    else
      begin
        klasse := Str2Int (s);

        if rightStr (stamm1, 1) = 'r' then
          stamm1 := leftStr (stamm1, length (stamm1) - 1);

        if (klasse = 3) and (rightStr (stamm1, 2) = 'io') then
          klasse := 5;

        stamm1 := LeftStr (stamm1, length (stamm1) - ifInt (Klasse in [2, 5], 2, 1));
      end;


    if (cnt = 2) and (klasse <= 5) then
      begin
        case klasse of
          1: begin
               stamm2 := stamm1 + 'av';
               stamm3 := stamm1 + 'at';
             end;
          2: begin
               stamm2 := stamm1 + 'ev';
               stamm3 := stamm1 + 'et';
             end;
          4: begin
               stamm2 := stamm1 + 'v';
               stamm3 := stamm1 + 't';
             end;
          3,5: begin
               stamm2 := stamm1 + 'iv';
               stamm3 := stamm1 + 'it';
             end;
        end;
      end
    else
      begin
        stamm2 := alltrimStr (GetPartStrByChar (lat, 2, ','));

        if rightStr (stamm2, 4) = ' sum' then
          begin
            stamm3 := leftStr (stamm2, length (stamm2) - 6);
            stamm2 := '#';
          end
        else
          begin
            stamm3 := alltrimStr (GetPartStrByChar (lat, 3, ','));
            stamm2 := leftStr (stamm2, length (stamm2) - 1);

            if Stamm3 <> '' then
              stamm3 := leftStr (stamm3, length (stamm3) - 2)
            else
              stamm3 := '#'
          end;
      end;

    if (stamm1 <> '') and (stamm1 <> '#') then
      ident.InsertStr (stamm1);

    if (stamm2 <> '') and (stamm2 <> '#') then
      ident.InsertStr (stamm2);

    if (stamm3 <> '') and (stamm3 <> '#') then
      ident.InsertStr (stamm3);

    with Form do
      begin
        key2Form ('', form);

        Modus := Indikativ;
        Tempus := Praesens;

        GenusVerbi := aktiv;
        add15 ('o,as,at,amus,atis,ant',
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
               'eo,is,it,imus,itis,eunt');
        GenusVerbi := Passiv;
        add15 ('or,aris,atur,amur,amini,antur',
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
               '#');

        Tempus := Imperfekt;

        GenusVerbi := Aktiv;
        add12 ('ab,eb,eb,eb,ieb,er,poter,fereb,voleb,noleb,maleb,ib',
               'am,as,at,amus,atis,ant');
        GenusVerbi := Passiv;
        add12 ('a,e,e,e,ie,#,#,fere,#,#,#,#',
               'bar,baris,batur,bamur,bamini,bantur');

       Tempus := Perfekt;

       GenusVerbi := Aktiv;
       if klasse = 12 then
         add12 ('','ii,isti,iit,iimus,istis,ierunt')
       else
         add2 ('i,isti,it,imus,istis,erunt');

       GenusVerbi := Passiv;

       add3 ('sum,es,est,sumus,estis,sunt');

       Tempus := Plusquamperfekt;

       GenusVerbi := aktiv;
       add2 ('eram,eras,erat,eramus,eratis,erant');
       GenusVerbi := Passiv;
       add3 ('eram,eras,erat,eramus,eratis,erant');

       Tempus := Futur1;

       GenusVerbi := aktiv;
       add15 ('abo,abis,abit,abimus,abitis,abunt',
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
              'ibo,ibis,ibit,ibimus,ibitis,ibunt');
       GenusVerbi := passiv;
       add15 ('abor,aberis,abitur,abimur,abimini,abuntur',
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
              '#');
       Tempus := Futur2;
       GenusVerbi := aktiv;
       add2 ('ero,eris,erit,erimus,eritis,erint');
       GenusVerbi := Passiv;
       add3 ('ero,eris,erit,erimus,eritis,erunt');

       Modus := Konjunktiv;

       Tempus := Praesens;
       GenusVerbi := aktiv;
       add12 ('e,ea,a,a,ia,si,possi,fera,veli,noli,mali,ea','m,s,t,mus,tis,nt');
       GenusVerbi := Passiv;
       add12 ('e,ea,a,a,ia,#,#,fera,#,#,#,#','r,ris,tur,mur,mini,ntur');

       Tempus := Imperfekt;
       GenusVerbi := aktiv;
       add12 ('ar,er,er,r,er,ess,poss,ferr,vell,noll,mall,ir','em,es,et,emus,etis,ent');
       GenusVerbi := passiv;
       add12 ('a,e,e,,e,#,#,fer,#,#,#,#','rer,reris,retur,remur,remini,rentur');

       Tempus := Perfekt;
       GenusVerbi := aktiv;
       add2 ('erim,eris,erit,erimus,eritis,erint');
       GenusVerbi := passiv;
       add3 ('sim,sis,sit,simus,sitis,sint');

       Tempus := Plusquamperfekt;
       GenusVerbi := aktiv;
       add2 ('issem,isses,isset,issemus,issetis,issent');
       GenusVerbi := Passiv;
       add3 ('essem,esses,esset,essemus,essetis,essent');

       Modus := Imperativ;

       Tempus := Praesens;
       GenusVerbi := aktiv;
       add15 ('#,a,#,#,ate,#',
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
              '#');
       GenusVerbi := Passiv;
       add15 ('#,are,are,#,amini,amini',
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
              '#');

       Tempus := Futur1;
       GenusVerbi := aktiv;
       add15 ('#,ato,ato,#,atote,anto',
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
              '#');
       GenusVerbi := Passiv;
       add15 ('#,ator,ator,#,antor,antor',
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
              '#');

        Modus := Infinitiv;
        Tempus := Praesens;
        GenusVerbi := Aktiv;

        add15 ('are','ere','ere','re','ere',
               'esse',
               'posse',
               'ferre',
               'velle',
               'nolle',
               'malle',
               'ire');
        genusVerbi := passiv;
        add15 ('ari','eri','i','ri','i',
               '#',
               '#',
               'ferri',
               '#',
               '#',
               '#',
               '#');
        tempus := Perfekt;
        GenusVerbi := Aktiv;

        Person := 0;
        Numerus := NullNumerus;
        InsertForm (Stamm2+'isse');

        GenusVerbi := passiv;
        Genus := Masculinum;
        InsertForm (Stamm3+ 'um esse');
        Genus := Femininum;
        InsertForm (Stamm3+ 'am esse');
        Genus := Neutrum;
        InsertForm (Stamm3+ 'um esse');

        Modus  := Gerundium;

        Tempus := NullTempus;
        Genus  := NullGenus;
        GenusVerbi := NullGenusVerbi;
        add15 ('andi','endi','endi','endi','iendi',
               '#',
               '#',
               '#',
               '#',
               '#',
               '#',
               'eundi');

        Modus := Gerundivum;

        Genus := Masculinum;
        add15 ('andus','endus','endus','endus','iendus',
               '#','#', '#', '#',  '#',  '#',  '#');

        Genus := Femininum;
        add15 ('anda','enda','enda','enda','ienda',
               '#','#', '#', '#',  '#',  '#',  '#');

        Genus := Neutrum;
        add15 ('andum','endum','endum','endum','iendum',
               '#','#', '#', '#',  '#',  '#',  '#');

        Modus := Supinum;

        Genus := NullGenus;
        InsertForm (stamm3+'um');

        Modus := Partizip;

        tempus := praesens;
        genusVerbi := aktiv;

        add12 ('a,e,e,e,ie,#,#,#,velens,nolens,#,ie','ns');

        tempus := perfekt;
        genusVerbi := passiv;

        Genus := Masculinum;
        InsertForm (stamm3+'us');
        Genus := Femininum;
        InsertForm (stamm3+'a');
        Genus := Neutrum;
        InsertForm (stamm3+'um');

        tempus := futur1;
        genusVerbi := aktiv;

        Genus := Masculinum;
        InsertForm (stamm3+'urus');
        Genus := Femininum;
        InsertForm (stamm3+'ura');
        Genus := Neutrum;
        InsertForm (stamm3+'urum');
     end;
  end;




Procedure tLatein.InitSubstantiv (lat: String);
  var
    Stamm: String;
    Form: tForm;

  var
    s: String;
    cnt, i, endung: integer;
    nom, gen, bastelStamm, etc: string;

  begin
    cnt := CountPartsByChar (lat, ',');

    s := upStr (AlltrimStr (getPartStrByChar (lat, cnt, ',')));

    case UpChar (s[1]) of
      'F': genus := femininum;
      'M': genus := masculinum;
      'N': genus := neutrum;
      else
        fatal (lat+ ': Genus "'+s+'" unbekannt!');
    end;

    nom := AlltrimStr (GetPartStrByChar (lat, 1, ','));

    if cnt = 2 then
      s := nom
    else
      s := AlltrimStr (GetPartStrByChar (lat, 2, ','));

    bastelStamm := '';

    if s [1] = '-' then
      begin
        if s[2] in konsonanten then
          begin
            i := length (nom);
            while (i > 0) and (nom [i] <> s[2]) do
              dec (i);

            if i = 0 then
              fatal ('kann "bastelstamm" f�r Genitiv nicht bilden!');

            bastelStamm := LeftStr (nom, i-1);
          end
        else if nom [length (nom)] in vokale then
          bastelstamm := leftStr (nom, length (nom)-1)
        else
          bastelstamm := leftStr (nom, length (nom)-2);

        s := bastelStamm + fromStr (s, 2);
      end;


    if (rightStr (s, 1) = 'i') and (rightStr (s, 2) <> 'ei') then
      stamm := leftStr (s, length (s) - 1)
    else
      stamm := leftStr (s, length (s) - 2);

    If bastelStamm = '' then
      bastelStamm := Stamm;

    gen := RightStr (s, length (s) - length (stamm));

    ident.InsertStr (stamm);
    key2Form ('', form);

    for i := 3 to cnt-1 do
      begin
        s := alltrimStr (getPartStrByChar (lat, i, ','));

        case s[1] of
          '1': form.Kasus := Nominativ;
          '2': form.Kasus := Genitiv;
          '3': form.Kasus := Dativ;
          '4': form.Kasus := Akkusativ;
          '5': form.Kasus := Ablativ;
          '6': form.Kasus := Vokativ;
          else
            fatal ('Syntax error in '+lat+': '+s);
        end;

        case upChar (s[2]) of
          'S': form.Numerus := Singular;
          'P': form.Numerus := Plural;
          else
            fatal ('Syntax error in '+lat+': '+s);
        end;

        if s[3] <> '=' then
          fatal ('Syntax error in '+lat+': '+s);

        s := allTrimStr (fromStr (s, 4));

        if s [1] = '-' then
          Insert (form, stamm + fromStr (s, 2), false)
        else
          Insert (Form, s, false);
      end;

    if gen = 'is' then
      Dekliniere ('K', form, nom, stamm, genus)
    else if gen = 'us' then
      Dekliniere ('U', form, nom, stamm, genus)
    else if gen = 'ei' then
      Dekliniere ('E', form, nom, stamm, genus)
    else if gen = 'i' then {o-deklination}
      Dekliniere ('O', form, nom, stamm, genus)
    else if gen = 'ae' then
      Dekliniere ('A', form, nom, stamm, genus)
    else
      fatal ('Deklination nicht erkannt!');
  end;


{************************** Deklinationen ***********************************}


Procedure tLatein.Dekliniere (dekl: char; form: tForm; const nom, Stamm: String; gen: tGenus);

  Procedure add1 (e: string);
    var
      k: tKasus;
      s: String;
    begin
      for k := Nominativ to Vokativ do
        begin
          form.Kasus := k;
          s := cutStrByChar (e, ',');
          if s= '1' then
            s := nom
          else if pos ('/', s) = 0 then
            s := stamm + s
          else
            s := stamm + getPartStrByChar (s, ifInt (gen <> neutrum, 1, 2),'/');

          Insert (form, s, false);
        end;
    end;

  Procedure add (const e1, e2: String);
    begin
      form.numerus := singular;
      add1 (e1);
      form.numerus := plural;
      add1 (e2);
    end;

  var r2: String;

  begin
    case upchar (dekl) of
      'K': begin
     {mischklasse?}

             if leftStr (nom, 1) = 'e' then
               r2 := 'e'
             else
               r2 := rightStr (nom, 2);

             if ((stamm [length (stamm)] in konsonanten) and (stamm [length (stamm)-1] in konsonanten)) or
                (((r2 = 'is') or (r2 = 'es')) and (silben (stamm+'is') = silben (nom))) then
               add ('1,is,i,em,e,1', 'es,ium,ibus,es,ibus,es')
    {vielleicht i-Stamm?}
             else if ((r2 = 'is') or (r2 = 'e') or (r2 = 'al') or (r2 = 'ar'))
                   and (leftStr (nom, length (nom) - length (r2)) = Stamm) then

               add ('1,is,i,im/e,i,1', 'es/ia,ium,ibus,es/ia,ibus,es/ia')
    {reine konsonantische}
             else
               add ('1,is,i,em/1,e,1', 'es/a,um,ibus,es/a,ibus,es/a');
           end;
      'O': begin
             if rightStr (nom, 2) = 'us' then
               add ('1,i,o,um,o,e','a/i,orum,is,a/os,is,a/i')
             else
               add ('1,i,o,um,o,1','a/i,orum,is,a/os,is,a/i');
           end;
      'U': add ('1,us,ui/u,um/u,u,1', 'us/ua,uum,ibus,us/ua,ibus,us/ua');
      'A': add ('1,ae,ae,am,a,1',     'ae,arum,is,as,is,ae');
      'E': add ('1,ei,ei,em,e,1',     'es,erum,ebus,es,ebus,es');
    end
  end;


function Abfrage (richtig: String): Boolean;
  var
    eingabe: String;
    treffer: set of byte;
    i, cnt, tcnt: Integer;
    ok: boolean;

  begin
    treffer := [];
    readln (eingabe);

    if eingabe = '' then
      begin
        Abfrage := false;
        exit;
      end;

    abfrage := true;

    cnt :=  countPartsByChar (richtig, '+');
    tcnt := 0;

    i := 1;
    while i <= length (eingabe) do
      begin
        if richtig [i] = '+' then
          richtig [i] := ',';

        inc (i);
      end;

    repeat
      ok := false;
      for i := 1 to cnt do
        if alltrimStr (getPartStrByChar (richtig, i, ',')) = eingabe then
          begin
            ok := true;
            if i in treffer then
              writeln ('Das hatten wir schon!')
            else
              begin
                treffer := treffer + [i];
                inc (tcnt);
              end;
            break;
          end;

      if ok and (tcnt < cnt) then
        begin
          write ('ok - ',tcnt+1,'. M�glichkeit =? ');
          readln (eingabe);
        end;

    until (not ok) or (tcnt = cnt);

    stat.ok := stat.ok + tcnt / cnt;
    inc (stat.count);
    {
    write (alltrimStr (real2str ((100*stat.ok) / stat.count,9,2))+ '% ');
    }
    if tcnt = cnt then
      writeln ('ok!')
    else if tcnt <> 0 then
      writeln ('Naja... ', richtig)
    else
      writeln ('Falsch! - richtig: ', richtig);
  end;


procedure uebung;
  var
    s, t, richtig: string;
    form: tForm;
    lat: tLatein;

  begin
    clrscr;

    repeat
      repeat
        s := AlltrimStr (lexikon.AtStr (random (lexikon.count)));
      until s <> '';

      lat.Init (s);
                     (*
      richtig := lat.BildeRandomForm (form);

      write (lat.Uebersetzung, form2key (lat, form), ' =? ');

    until NOT abfrage (richtig); *)

    until false;
  end;


Procedure CreateIdent;
  var
    i, j: longInt;
    s: String;
    lat: tLatein;
  begin
    ident.Init (xcSorted or xcAlpha);

    write ('Baue Identifizierungsindex auf....       ');

    for i := 0 to lexikon.Count-1 do
      begin
(*        write (#8#8#8#8#8, lexikon.Count - i: 5); *)

        s := lexikon.AtStr (i);

        writeln (s);
        lat.Init (s);

        for j := 0 to lat.ident.count - 1 do
          begin
            s := IndexStr (lat.ident.AtStr (j), false);
            ident.InsertLong (int2str (length (s),0)+s, i);
          end;
        lat.done;
      end;
  end;


Procedure CreateLexikon;
  var
    f: tFile;
    s: String;

  begin
    clrScr;

    writeln ('erstelle Lexikon....');

    lexikon.init (xcDefault);
    f.init ('lexikon.txt', foReset, fmOpenRead or fmDenyNone);

    while not f.eoi do
      begin
        s := alltrimStr (f.readLn);
        if s <> '' then lexikon.insertStr (s);
      end;

    f.done;
  end;

Procedure Identify (const s: String);
  var
    i, j, l: LongInt;
    si, sx: String;
    lat: tlatein;
  begin
    sx := IndexStr (s, false);

    for l := length (s) downto 1 do
      begin
        si := long2str (l,0) + sx;

        ident.Names.SearchStr (si, i);

        {identify first match}

        while (i > 0) and StartStr (IndexStr (ident.AtKey (i-1), false), si) do
          dec (i);

        while (i < ident.count) and StartStr (indexStr (ident.AtKey (i),false), si) do
          begin
            lat.Init (lexikon.AtStr (ident.AtLong (i)));

            for j := 0 to lat.formen.count-1 do
              begin
                if indexStr (lat.formen.AtStr (j), false) = sx then
                  writeln (lat.formen.AtKey (j));
              end;

            inc (i);
          end;
      end;
   end;

var
  s: String;

begin
  createLexikon;
  CreateIdent;

  clrscr;

  repeat
    readln (s);
    Identify (s);
  until false;

  uebung;

  clrscr;
  writeln;
  writeln;
  writeln ('--- Statistik ---');
  writeln;
  writeln;
  writeln (stat2str (stat));
  writeln;
  writeln;
  writeln;
  writeln;
  writeln ('...bitte return dr�cken...');
  readln;


end.


*/