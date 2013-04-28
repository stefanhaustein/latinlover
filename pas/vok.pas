uses
  crt, xsystem, xString, collects, xfile, xdos;

Type
  tGenus = Char;
  tNumerus = Char;

  tKNG = Record
    Kasus: Integer;
    Numerus: tNumerus;
    Genus: tGenus;
  end;

  tStatistik = Record
    count: Integer;
    ok: real;
  end;


  tPerson = Integer;
  tModus = (Indikativ, Imperativ, Konjunktiv, Infinitiv, Gerundium, Gerundivum, Partizip, Supinum);
  {was ist mit dem gerundivum? -> bilden ohne us, a, um?}
  tTempus = (Praesens, Imperfekt, Perfekt, Plusquamperfekt, Futur1, Futur2);
  tGenusVerbi = (Aktiv, Passiv);

  tPNMTG = Record
    Person: tPerson;
    Numerus: tNumerus;
    Modus: tModus;
    Tempus: tTempus;
    Genus: tGenusVerbi
  end;


const
  singular   = 'S';
  plural     = 'P';

  femininum  = 'F';
  masculinum = 'M';
  neutrum    = 'N';

  infPraesAkt: tPNMTG = (Person: 0; Numerus: Singular; Modus: Infinitiv; Tempus: Praesens; Genus: Aktiv);

  modi = 8;
  tempora = 6;



  Buchstaben = ['A'..'Z', 'a'..'z'];
  Vokale = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];
  Konsonanten = Buchstaben - Vokale;

  dekl: tStatistik = (count: 0; ok: 0);
  konj: tStatistik = (count: 0; ok: 0);

var
  lexikon: tStringCollection;


function Stat2Str (Stat: tStatistik): String;
  begin
    if stat.count = 0 then
      stat2Str := 'Keine Abfragen'
    else
      Stat2str := 'Abfragen: '+int2str (stat.count,0)+ ' davon richtig: '+real2str (stat.ok,9,2)+ ' = '+
               real2str ((100*stat.ok) / stat.count,9,2)+ ' %';
  end;


function KNG2Str (kng: tkng; genus: boolean): String;
  var
    s: String;
  begin
    s := '';
    case kng.kasus of
      1: s := 'Nom.';
      2: s := 'Gen.';
      3: s := 'Dat.';
      4: s := 'Akk.';
      5: s := 'Abl.';
      6: s := 'Vok.';
    end;

    if KNG.Numerus = Singular then
      s := s + ' Sg.'
    else
      s := s + ' Pl.';

    if genus then
      case kng.genus of
        masculinum: S := s + ' M.';
        femininum: s := s+ ' F.';
        neutrum: s := s+ ' N.';
      end;

   kng2str := s;
 end;



function PNMTG2Str (pnmtg: tpnmtg): String;
  var
    s: String;
  begin
    s := '';

    if pnmtg.modus in [Indikativ, Konjunktiv, Imperativ] then
      s := int2str (pnmtg.person, 0)+ '. ' + ifStr (pnmtg.numerus = singular, 'Sg. ', 'Pl. ');

    case pnmtg.modus of
      Indikativ: s := s + 'Ind.';
      Konjunktiv: s := s + 'Konj.';
      Imperativ: s := s + 'Imperativ ';
      Partizip: s := s + 'Part.';
      Gerundium: s := s + 'Gerundium';
      Gerundivum: s := s + 'Gerundivum';
      Infinitiv: s := s + 'Inf.';
      Supinum: s := s + 'Supinum'
    end;

    if not (pnmtg.modus in [gerundium, gerundivum, Supinum]) then
      begin
        case pnmtg.tempus of
          praesens: s := s+ ' PrÑs.';
          imperfekt: s := s+ ' Impf.';
          perfekt: s := s + ' Perf.';
          plusquamperfekt: s := s +' Plusqu.';
          futur1: s := s + ' Fut. I';
          futur2: s := s + ' Fut. II';
        end;

        if pnmtg.genus = aktiv then
          s := s + ' Akt.'
        else
          s := s + ' Pass.';
      end;

    pnmtg2str := s;
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




Function Konjugiere (const lat: String; PNMTG: tPNMTG): String;
  var
    stamm1, stamm2, stamm3, ret: String;
    klasse: integer;

  Procedure Add12 (const s0, s: String);
    var
      t: string;
      c: Integer;
    begin
      c := countPartsByChar (s, ',');
      if c = 1 then
        t := s
      else if c = 2 then
        t := GetPartStrByChar (s, ifInt (PNMTG.Numerus = singular, 1, 2), ',')
      else
        t := GetPartStrByChar (s, PNMTG.Person + ifInt (PNMTG.Numerus = Singular, 0, 3), ',');

      ret := stamm1 + alltrimStr (getPartStrByChar (s0, klasse, ',')) + alltrimStr (t);
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

  Procedure add2 (const s: String);
    begin
      ret := stamm2 + GetPartStrByChar (s, PNMTG.Person + ifInt (PNMTG.Numerus = Singular, 0, 3), ',');
    end;

  Procedure add3 (const s: String);
    begin
      if pnmtg.numerus = singular then
        ret := stamm3 + 'us ' + GetPartStrByChar (s, PNMTG.Person, ',')
      else
        ret := stamm3 + 'i ' + GetPartStrByChar (s, 3+PNMTG.Person, ',');
    end;


  var
    cnt: Integer;
    s: String;

  begin
    ret := '';

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

    with PNMTG do
      Case PNMTG.Modus of
        Indikativ:
          case PNMTG.Tempus of
            Praesens:
              if PNMTG.Genus = aktiv then
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
                       'eo,is,it,imus,itis,eunt')
              else
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
            Imperfekt:
              If PNMTG.Genus = aktiv then
                add12 ('ab,eb,eb,eb,ieb,er,poter,fereb,voleb,noleb,maleb,ib',
                       'am,as,at,amus,atis,ant')
              else
                add12 ('a,e,e,e,ie,#,#,fere,#,#,#,#',
                       'bar,baris,batur,bamur,bamini,bantur');
            Perfekt:
              If PNMTG.Genus = aktiv then
                if klasse = 12 then
                  add12 ('','ii,isti,iit,iimus,istis,ierunt')
                else
                  add2 ('i,isti,it,imus,istis,erunt')
              else
                add3 ('sum,es,est,sumus,estis,sunt');
            Plusquamperfekt:
              If PNMTG.Genus = aktiv then
                add2 ('eram,eras,erat,eramus,eratis,erant')
              else
                add3 ('eram,eras,erat,eramus,eratis,erant');
            Futur1:
              If PNMTG.Genus = aktiv then
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
                       'ibo,ibis,ibit,ibimus,ibitis,ibunt')
              else
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
            Futur2:
              if PNMTG.Genus=aktiv then
                add2 ('ero,eris,erit,erimus,eritis,erint')
              else
                add3 ('ero,eris,erit,erimus,eritis,erunt');
            end;
        Konjunktiv:
          Case PNMTG.Tempus of
            Praesens:
              If PNMTG.Genus = aktiv then
                add12 ('e,ea,a,a,ia,si,possi,fera,veli,noli,mali,ea','m,s,t,mus,tis,nt')
              else
                add12 ('e,ea,a,a,ia,#,#,fera,#,#,#,#','r,ris,tur,mur,mini,ntur');
            Imperfekt:
              If PNMTG.Genus = aktiv then
                add12 ('ar,er,er,r,er,ess,poss,ferr,vell,noll,mall,ir','em,es,et,emus,etis,ent')
              else
                add12 ('a,e,e,,e,#,#,fer,#,#,#,#','rer,reris,retur,remur,remini,rentur');
            Perfekt:
              If PNMTG.Genus = aktiv then
                add2 ('erim,eris,erit,erimus,eritis,erint')
              else
                add3 ('sim,sis,sit,simus,sitis,sint');
            Plusquamperfekt:
              If PNMTG.Genus = aktiv then
                add2 ('issem,isses,isset,issemus,issetis,issent')
              else
                add3 ('essem,esses,esset,essemus,essetis,essent');
          end;
        Imperativ:
          Case PNMTG.Tempus of
            Praesens:
              If PNMTG.Genus = aktiv then
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
                       '#')
              else
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
            Futur1:
              If PNMTG.Genus = aktiv then
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
              else
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
          end;

        Infinitiv:
          Case PNMTG.Tempus of
            Praesens:
              If PNMTG.Genus = Aktiv then
                add15 ('are','ere','ere','re','ere',
                       'esse',
                       'posse',
                       'ferre',
                       'velle',
                       'nolle',
                       'malle',
                       'ire')
              else
                add15 ('ari','eri','i','ri','i',
                       '#',
                       '#',
                       'ferri',
                       '#',
                       '#',
                       '#',
                       '#');
            Perfekt:
              If PNMTG.Genus = Aktiv then
                ret := stamm2+'isse'
              else
                ret := stamm3+'um esse';
          end;
        Gerundium:
          add15 ('andi','endi','endi','endi','iendi',
                       '#',
                       '#',
                       '#',
                       '#',
                       '#',
                       '#',
                       'eundi');
        Gerundivum:
          add15 ('andus','endus','endus','endus','iendus',
                       '#',
                       '#',
                       '#',
                       '#',
                       '#',
                       '#',
                       '#');
        Supinum:
          ret := stamm3+'um';
        Partizip:
          case PNMTG.tempus of
            praesens:
              if pnmtg.genus = aktiv then
                add12 ('a,e,e,e,ie,#,#,#,velens,nolens,#,ie','ns');
            perfekt:
              if (pnmtg.genus = passiv) then
                ret := stamm3+'us';
            futur1:
              if (pnmtg.genus = aktiv) then
                ret := stamm3+'urus';
          end;
     end;

    if klasse = 6 then
      begin
        if ret = 'proesse' then
          ret := 'prodesse'
        else if startStr ('adfu', ret) then
          ret := ret + '+affu' + fromStr (ret, 5)
        else if StartStr ('obfu', ret) then
          ret := ret + '+offu' + fromStr (ret, 5);
      end;

    if pos ('#', ret) = 0 then
      konjugiere := ret
    else
      konjugiere := '';
  end;


{************************** Deklinationen ***********************************}


Function konsDeklination (Const nom, stamm: String; KNG: tKNG): String;

  Procedure app (const endung: String);
    begin
      konsDeklination := stamm + endung;
    end;

  var r2: String;

  begin
    {mischklasse?}

    if leftStr (nom, 1) = 'e' then
      r2 := 'e'
    else
      r2 := rightStr (nom, 2);

    if ((stamm [length (stamm)] in konsonanten) and (stamm [length (stamm)-1] in konsonanten)) or
       (((r2 = 'is') or (r2 = 'es')) and (silben (stamm+'is') = silben (nom))) then
      begin
        if kng.numerus = singular then
          case kng.kasus of
            1, 6: konsDeklination := nom;
            2:    app ('is');
            3:    app ('i');
            4:    app ('em');
            5:    app ('e');
          end
        else
          case kng.kasus of
            1, 4, 6: app ('es');
            2:       app ('ium');
            3, 5:    app ('ibus');
          end
      end

    {vielleicht i-Stamm?}

    else if ((r2 = 'is') or (r2 = 'e') or (r2 = 'al') or (r2 = 'ar'))
          and (leftStr (nom, length (nom) - length (r2)) = Stamm) then
      begin
        if kng.numerus = singular then
          case kng.kasus of
            1, 6: konsDeklination := nom;
            2:    app ('is');
            3, 5: app ('i');
            4:    app (ifStr (kng.genus <> neutrum, 'im', 'e'));
          end
        else
          case kng.kasus of
            1, 4, 6: app (ifStr (kng.genus <> neutrum, 'es', 'ia'));
            2:       app ('ium');
            3, 5:    app ('ibus');
          end
      end

    {reine konsonantische}

    else
      begin
        if kng.numerus = singular then
          case kng.kasus of
            1, 6: konsDeklination := nom;
            2:    app ('is');
            3:    app ('i');
            4:    if (kng.genus <> neutrum) then
                    app ('em')
                  else
                    konsDeklination := nom;
            5:    app ('e');
          end
        else
          case kng.kasus of
            1, 4, 6: app (ifStr (kng.genus <> neutrum, 'es', 'a'));
            2:       app ('um');
            3, 5:    app ('ibus');
          end
      end
  end;



Function oDeklination (Const nom, stamm: String; KNG: tKNG): String;

  Procedure app (const endung: String);
    begin
      oDeklination := stamm + endung;
    end;

  begin
    If kng.numerus = singular then
      case kng.kasus of
        1:    oDeklination := nom;
        2:    app ('i');
        3, 5: app ('o');
        4:    app ('um');
        6:    if rightStr (nom, 2) = 'us' then
                app ('e')
              else
                oDeklination := Nom;

      end
    else
      case kng.kasus of
        1, 6: app (ifStr (kng.genus = neutrum, 'a', 'i'));
        2:    app ('orum');
        3, 5: app ('is');
        4:    app (ifStr (kng.genus = neutrum, 'a', 'os'));
      end
  end;


Function uDeklination (Const nom, stamm: String; KNG: tKNG): String;

  Procedure app (const endung: String);
    begin
      uDeklination := stamm + endung;
    end;

  begin
    If kng.numerus = singular then
      case kng.kasus of
        1: app (ifStr (kng.genus <> neutrum, 'us', 'u'));
        2: app ('us');
        3: app (ifStr (kng.genus <> neutrum, 'ui', 'u'));
        4: app (ifStr (kng.genus <> neutrum, 'um', 'u'));
        5: app ('u');
        6: uDeklination := nom;
      end
    else
      case kng.kasus of
        1,4,6: app (ifStr (kng.genus <> neutrum, 'us', 'ua'));
        2: app ('uum');
        3,5: app ('ibus');
      end
  end;


Function aDeklination (Const nom, stamm: String; kng: tKNG): String;

  Procedure app (const endung: String);
    begin
      aDeklination := stamm + endung;
    end;

  begin
    If kng.numerus = singular then
      case kng.kasus of
        1, 6: aDeklination := nom;
        2, 3: app ('ae');
        4:    app ('am');
        5:    app ('a');
      end
    else
      case KNG.kasus of
        1, 6: app ('ae');
        2:    app ('arum');
        3, 5: app ('is');
        4:    app ('as');
      end
  end;


Function eDeklination (Const nom, stamm: String; kng: tKNG): String;

  Procedure app (const endung: String);
    begin
      eDeklination := stamm + endung;
    end;

  begin
    If kng.numerus = singular then
      case kng.kasus of
        1, 6: eDeklination := nom;
        2, 3: app ('ei');
        4:    app ('em');
        5:    app ('e');
      end
    else
      case kng.kasus of
        1, 4, 6: app ('es');
        2:       app ('erum');
        3, 5:    app ('ebus');
      end
  end;


Function dekliniere (lat: String; kasus: integer; numerus: tNumerus): String;
  var
    kng: tkng;
    s: String;
    cnt, idx, i, testIdx, endung: integer;
    nom, gen, stamm, bastelStamm, etc: string;

  begin
    cnt := CountPartsByChar (lat, ',');

    idx := kasus + ifInt (numerus = singular, 0, 6);

    kng.Kasus   := kasus;
    kng.Numerus := numerus;

    s := upStr (AlltrimStr (getPartStrByChar (lat, cnt, ',')));
    if (length (s) = 1) and (upChar (s [1]) in [femininum, masculinum, neutrum]) then
      kng.genus := upChar (s[1])
    else
      fatal (lat+ ': Genus "'+s+'" unbekannt!');

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
              fatal ('kann "bastelstamm" fÅr Genitiv nicht bilden!');

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

    testidx := 3;

    for i := 3 to cnt-1 do
      begin
        s := alltrimStr (getPartStrByChar (lat, i, ','));

        if s [1] in ['1'..'6'] then
          begin
            if (upChar (s[2]) in [singular, plural]) and (s[3] = '=') then
              begin
                testidx := str2int (s[1]) + ifint (upChar (s[2]) = singular, 0, 6);
                s := allTrimStr (fromStr (s, 4))
              end
            else
              fatal ('Syntax error in '+lat+': '+s)
          end;

        if testIdx = idx then
          begin
            if s [1] = '-' then
              dekliniere := stamm + fromStr (s, 2)
            else
              dekliniere := s;

            exit;
          end;

        inc (testIdx);
      end;

    if gen = 'is' then
      dekliniere := konsDeklination (nom, stamm, kng)
    else if gen = 'us' then
      dekliniere := uDeklination (nom, Stamm, KNG)
    else if gen = 'ei' then
      dekliniere := eDeklination (nom, Stamm, KNG)
    else if gen = 'i' then {o-deklination}
      dekliniere := oDeklination (nom, Stamm, KNG)
    else if gen = 'ae' then
      dekliniere := aDeklination (nom, Stamm, KNG)
    else
      fatal ('Deklination nicht erkannt!');
  end;


function Abfrage (richtig, info: String; var stat: tStatistik): Boolean;
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
          write ('ok - ',tcnt+1,'. Moelichkeit =? ');
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

    writeLn (info);
  end;


procedure deklinationsuebung;
  var
    kng: tkng;
    s, t, richtig: string;
    art, lat: String;

  begin
    clrscr;

    repeat
      repeat
        s := lexikon.AtStr (random (lexikon.count));

        art := upStr (alltrimStr (cutStrByChar (s, ':')));
      until (art = 'S') or (leftStr (art, 1) = 'P');

      lat := alltrimStr (cutStrByChar (s, ':'));

      writelN;
      write (getPartStrByChar (lat, 1, ',')+ ' ('+alltrimStr(s)+') - ');

      repeat
        kng.kasus := random (6) + 1;
        if (random > 0.5) AND (kng.kasus <> 1) then
          kng.numerus := singular
        else
          kng.numerus := plural;

        richtig := dekliniere (lat, kng.kasus, kng.numerus);
      until richtig <> '';

      write (kng2str (kng, false), ' =? ');
     until NOT abfrage (richtig, lat, dekl);
  end;




procedure konjugationsuebung;
  var
    pnmtg: tpnmtg;
    art, lat, s, richtig: String;

  begin
    clrscr;

    repeat
      repeat
        s := lexikon.AtStr (random (lexikon.count));

        art := upStr (alltrimStr (cutStrByChar (s, ':')));
      until art = 'V';

      lat := alltrimStr (cutStrByChar (s, ':'));


      repeat
        pnmtg.person := random (3) + 1;

        if (random > 0.5) then
          pnmtg.numerus := singular
        else
          pnmtg.numerus := plural;

        repeat
          pnmtg.modus := tModus (random (modi));
        until (pnmtg.modus in [indikativ, konjunktiv, imperativ]) or (random > 0.85);

        pnmtg.tempus := tTempus (random (tempora));

        if (random > 0.5) then
          pnmtg.genus := aktiv
        else
          pnmtg.genus := passiv;

        richtig := konjugiere (lat, pnmtg);
      until richtig <> '';

      writelN;
      if pnmtg.modus = infinitiv then
        write (getPartStrByChar (lat, 1, ','))
      else
        write (konjugiere (lat, InfPraesAkt));

      write (' ('+alltrimStr(s)+') - '+pnmtg2str (pnmtg), ' =? ');

    until not abfrage (richtig, lat, konj);
  end;


var
  f: tFile;
  s: String;


begin
  clrScr;

  randomize;

  lexikon.init (xcDefault);

  f.init ('lexikon.txt', foReset, fmOpenRead or fmDenyNone);

  while not f.eoi do
    begin
      s := alltrimStr (f.readLn);
      if s <> '' then lexikon.insertStr (s);
    end;

  while true do
    begin
      clrscr;
      writeln;
      writeln;
      writeln (' 1) DeklinationsÅbung');
      writeln (' 2) KonjugationsÅbung');
      writeln;
      writeln (' 0) Ende');
      writeln;

      case readKey of
        '1': deklinationsuebung;
        '2': konjugationsuebung;
        '0': break;
      end;
    end;

  clrscr;
  writeln;
  writeln;
  writeln ('--- Statistik ---');
  writeln;
  writeln;
  writeln ('KonjugationsÅbungen:');
  writeln;
  writeln (stat2str (konj));
  writeln;
  writeln;
  writeln ('DeklinationsÅbungen:');
  writeln;
  writeln (stat2str (dekl));
  writeln;
  writeln;
  writeln;
  writeln ('...bitte return drueken...');
  readln;
  f.done;


end.