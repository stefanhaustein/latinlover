Unit Allgem;

interface

uses
  objects, xSystem, xString, env, Collects;


Type
  tNumerus = (NullNumerus, Singular, Plural);
  tPerson = 0..3;
  tModus = (NullModus, Indikativ, Imperativ, Konjunktiv, Infinitiv, Gerundium, Gerundivum, Partizip, Supinum);
  {was ist mit dem gerundivum? -> bilden ohne us, a, um?}
  tTempus = (NullTempus, Praesens, Imperfekt, Perfekt, Plusquamperfekt, Futur1, Futur2);
  tGenusVerbi = (NullGenusVerbi, Aktiv, Passiv);
  tGenus = (NullGenus, Masculinum, femininum, neutrum);
  tKasus = (NullKasus, Nominativ, Genitiv, Dativ, Akkusativ, Ablativ, Vokativ);

  tForm = Record
    Person: tPerson;
    Numerus: tNumerus;

    Modus: tModus;

    Tempus: tTempus;
    GenusVerbi: tGenusVerbi;

    Kasus: tKasus;
    Genus: tGenus;
  end;

  tWortArt = (Substantiv, Verb, Adjektiv);

  tWort = Object
    Art: tWortArt;
    Formen: tStringEnvironment;
    Ident: tStringCollection;

    Genus: tGenus;
    Uebersetzung: String;  {vorlaeufig}

    Constructor Init (Def: String);
    Destructor  Done; Virtual;

    Procedure InitVerb (S: String); Virtual;
    Procedure InitSubstantiv (S: String); Virtual;
    Procedure Insert (form: tForm; S: String; dbl: boolean); Virtual;
    Function  BildeForm (form: tForm): String; {leer = unmoeglich}
  end;


Const
  Buchstaben  = ['A'..'Z', 'é','ô','ö', 'Ñ','î','Å','·', 'a'..'z'];
  Vokale      = ['A', 'E', 'I', 'O', 'U', 'é','ô','ö', 'a', 'e', 'i', 'o', 'u','Ñ','î','Å'];
  Konsonanten = Buchstaben - Vokale;

Function Form2key (f: tForm): String;
Procedure key2Form (akey: String; var f: tForm);


implementation


Function Form2key (f: tForm): String;
  var
    s: String;
  begin
    s := '';

    with f do
      begin
        If Person <> 0 then
          s := s + int2str (f.person, 0)+ '. '+ ifStr (f.numerus = singular, 'Sg. ', 'Pl. ');

        case modus of
          Indikativ:  s := s + 'Ind. ';
          Konjunktiv: s := s + 'Konj. ';
          Imperativ:  s := s + 'Imperativ ';
          Partizip:   s := s + 'Part. ';
          Gerundium:  s := s + 'Gerundium ';
          Gerundivum: s := s + 'Gerundivum ';
          Infinitiv:  s := s + 'Inf. ';
          Supinum:    s := s + 'Supinum '
        end;

        case Tempus of
          praesens: s := s+ 'PrÑs. ';
          imperfekt: s := s+ 'Impf. ';
          perfekt: s := s + 'Perf. ';
          plusquamperfekt: s := s +'Plusqu. ';
          futur1: s := s + 'Fut.1 ';
          futur2: s := s + 'Fut.2 ';
        end;

        if genusVerbi = aktiv then
          s := s + 'Akt. '
        else if genusVerbi = passiv then
          s := s + 'Pass. ';

        case kasus of
          Nominativ: s := s+'Nom. ';
          Genitiv:   s := s+'Gen. ';
          Dativ:     s := s+'Dat. ';
          Akkusativ: s := s+'Akk. ';
          Ablativ:   s := s+'Abl. ';
          Vokativ:   s := s+'Vok. ';
        end;

        If person = 0 then
          begin
            if f.Numerus = Singular then
              s := s + 'Sg. '
            else if f.Numerus = Plural then
              s := s + 'Pl. ';
          end;

        case genus of
          masculinum: S := s + 'M. ';
          femininum: s := s+ 'F. ';
          neutrum: s := s+ 'N. ';
        end;
      end;

    Form2Key := s;
  end;


Procedure key2Form (akey: String; var f: tForm);
  var
    check: String;
  begin
    with f do
      begin
        Person     := 0;
        Numerus    := NullNumerus;

        Modus      := NullModus;

        Tempus     := NullTempus;
        GenusVerbi := NullGenusVerbi;

        Kasus      := NullKasus;
        Genus      := NullGenus;

        while aKey <> '' do
          begin
            check := UpStr (CutStrByChar (aKey, ' '));

            with f do
              begin
                If StartStr ('1', check) then
                  person := 1
                else If StartStr ('2', check) then
                  person := 2
                else If StartStr ('3', check) then
                  person := 2
                else if StartStr ('SG', check) or StartStr ('SING', check) then
                  numerus := singular
                else if StartStr ('PL', check) then
                  numerus := plural
                else if StartStr ('IND', check) then
                  modus := indikativ
                else if StartStr ('KONJ', check) then
                  modus := konjunktiv
                else if StartStr ('IMP', check) then
                  begin
                    if (ord (modus) = 0) and (person = 0) then
                      modus := imperativ
                    else
                      tempus := imperfekt;
                  end
                else if StartStr ('PART', check) then
                  modus := partizip
                else if StartStr ('GERUNDIUM', check) then
                  modus := gerundium
                else if StartStr ('GERUNDIVUM', check) then
                  modus := gerundivum
                else if StartStr ('INF', check) then
                  modus := infinitiv
                else if StartStr ('SUP', check) then
                  modus := Supinum
                else if StartStr ('PRéS', check) then
                  tempus := praesens
                else if StartStr ('PRéT', check) or StartStr ('IMPF', check) or (StartStr ('IMPERF', check)) then
                  tempus := imperfekt
                else if StartStr ('PLUS', check) then
                  tempus := plusquamperfekt
                else if StartStr ('FUT', check) then
                  begin
                    If (rightStr (check, 2) = 'II') or (rightStr (check, 1) = '2') then
                      tempus := futur2
                    else
                      tempus := futur1;
                  end
                else If StartStr ('AKT', check) then
                  genusVerbi := aktiv
                else if StartStr ('PAS', check) then
                  genusVerbi := passiv
                else if StartStr ('NOM', check) then
                  kasus := nominativ
                else if StartStr ('GEN', check) then
                  kasus := genitiv
                else if StartStr ('DAT', check) then
                  kasus := dativ
                else if StartStr ('AKK', check) then
                  kasus := akkusativ
                else if StartStr ('ABL', check) then
                  kasus := ablativ
                else if StartStr ('VOK', check) then
                  kasus := vokativ
                else if StartStr ('M', check) then
                  genus := masculinum
                else if StartStr ('F', check) then
                  genus := Femininum
                else if StartStr ('N', check) then
                  genus := Neutrum
                else
                  Fatal ('Key2Form - Illegal Identifier: '+check);
              end;
          end;
      end;
  end;


Constructor tWort.Init (def: String);
  var
    a, sp: String;

  begin
    a   := AlltrimStr (UpStr (CutStrByChar (def, ':')));

    sp := AllTrimStr (CutStrByChar (def, ':'));

    uebersetzung := Def;

    formen.Init (xcDefault);
    Ident.Init (xcDefault);

    If a = 'V' then
      InitVerb (sp)
    else if a = 'S' then
      InitSubstantiv (sp)
    else
      fatal ('Fehler im Lexikon - Art: '+a);
  end;

Destructor tWort.Done;
  begin
    formen.done;
    Ident.Done;
  end;


Procedure tWort.InitVerb;
  begin
    abstract;
  end;


Procedure tWort.InitSubstantiv;
  begin
    abstract;
  end;

Procedure tWort.Insert (form: tForm; s: String; dbl: boolean);
  var
    f: String;
    ok: Boolean;
    i: LongInt;
  begin
    If Not dbl and (formen.exists (form2Key (form))) then
      exit;

    while s <> '' do
      begin
        f := AlltrimStr (CutStrByChar (s, '+'));
        s := AlltrimStr (s);

        If pos ('#', f) = 0 then
          begin
            Formen.InsertStr (form2key (form), f);

            ok := false;

            for i := 0 to ident.Count-1 do
              ok := ok or startStr (ident.AtStr (i), f);

            if not ok then
              ident.InsertStr (f)
          end;
      end;
  end;


Function tWort.BildeForm (form: tForm): String; {leer = unmîglich}
  begin
    BildeForm := Formen.GetStr (Form2Key (form));
  end;


end.