package main

import "fmt"
import "strings"
import "os"
import "bufio"

type Numerus int
const (
  NullNumerus Numerus = iota;
  Singular;
  Plural;
)

type Person int

type Modus int
const (
  NullModus Modus = iota;
  Indikativ;
  Imperativ;
  Konjunktiv;
  Infinitiv;
  Gerundium;
  Gerundivum;
  Partizip;
  Supinum;
)

type Tempus int
const (
  NullTempus Tempus = iota;
  Praesens; 
  Imperfekt; 
  Perfekt; 
  Plusquamperfekt; 
  Futur1; 
  Futur2;
)

type GenusVerbi int
const (
  NullGenusVerbi GenusVerbi = iota;
  Aktiv; 
  Passiv;
)

type Genus int
const (
  NullGenus Genus = iota;
  Masculinum;
  Femininum;
  Neutrum;
)

type Kasus int
const (
  NullKasus Kasus = iota;
  Nominativ;
  Genitiv;
  Dativ;
  Akkusativ;
  Ablativ;
  Vokativ;
)

type Form struct {
  Person Person
  Numerus Numerus
  Modus Modus
  Tempus Tempus
  GenusVerbi GenusVerbi
  Kasus Kasus
  Genus Genus
}

type WortArt int
const (
  Substantiv WortArt = iota;
  Verb;
  Adjektiv;
)

type Wort struct {
  Art WortArt
  Genus Genus

  Formen map[string]Form

//    Ident: tStringCollection;


  Uebersetzung string
}

func (f *Form) String() string {
  result := "";
  if f.Person != 0 {
    if f.Numerus == Singular { 
      result = fmt.Sprintf("%d. Sg. ", f.Person);
    } else {
      result = fmt.Sprintf("%d. Pl. ", f.Person);
    }
  }

  switch f.Modus {
  case Indikativ: result += "Ind."
  case Konjunktiv: result += "Konj. "
  case Partizip: result += "Part. "
  case Gerundium: result += "Gerundium "
  case Gerundivum: result += "Gerundivum "
  case Infinitiv: result += "Inf. "
  case Supinum: result += "Supinum "
  }

  switch f.Tempus {
  case Praesens: result += "Praes. "
  case Imperfekt: result += "Impf. "
  case Perfekt: result += "Perf. "
  case Plusquamperfekt: result += "Plusqu. "
  case Futur1: result += "Fut.1 "
  case Futur2: result += "Fut.2 "
  }

  switch f.GenusVerbi {
  case Aktiv: result += "Akt. "
  case Passiv: result += "Pass. "
  }

  switch f.Kasus {
  case Nominativ: result += "Nom. "
  case Genitiv: result += "Gen. "
  case Dativ: result += "Dat. "
  case Akkusativ: result += "Akk. "
  case Ablativ: result += "Abl. "
  case Vokativ: result += "Vok. "
  }
 
  if f.Person == 0 {
    switch f.Numerus {
    case Singular: result += "Sg. "
    case Plural: result += "Pl. "
    }
    switch f.Genus {
    case Masculinum: result += "M. "
    case Femininum: result += "F. "
    case Neutrum: result += "N. "
    }
  }

  return strings.TrimSpace(result);
}

func CreateForm(key string) *Form {
  f := new(Form)
  for _, check := range strings.Fields(key) {
    check = strings.ToLower(check)
    switch check[0] {
    case '1': f.Person = 1
    case '2': f.Person = 2
    case '3': f.Person = 3
    case 'a':
      if strings.HasPrefix(check, "akt") {
        f.GenusVerbi = Aktiv
      } else if strings.HasPrefix(check, "abl") {
        f.Kasus = Ablativ
      } else if strings.HasPrefix(check, "akk") {
        f.Kasus = Akkusativ
      }
    case 'd':
      if strings.HasPrefix(check, "dat") {
        f.Kasus = Dativ
      }
    case 'f':
      if strings.HasPrefix(check, "fut") {
        if strings.HasSuffix(check, "ii") || strings.HasSuffix(check, "2") {
          f.Tempus = Futur2
        } else {
          f.Tempus = Futur1
        }
      } else {
        f.Genus = Femininum
      }
    case 'g':
      if strings.HasPrefix(check, "gerundium") {
        f.Modus = Gerundium
      } else if strings.HasPrefix(check, "gerundivum") {
        f.Modus = Gerundivum
      } else if strings.HasPrefix(check, "gen") {
        f.Kasus = Genitiv
      }
    case 'i':
      if strings.HasPrefix(check, "ind") {
        f.Modus = Indikativ
      } else if strings.HasPrefix(check, "inf") {
        f.Modus = Infinitiv
      } else if strings.HasPrefix(check, "impf") || strings.HasPrefix(check, "imperf") {
        f.Tempus = Imperfekt
      } else if strings.HasPrefix(check, "imp") {
        if f.Modus == NullModus && f.Person == 0 {
          f.Modus = Imperativ
        } else {
          f.Tempus = Imperfekt
        }
      }
    case 'k':
      if strings.HasPrefix(check, "konj") {
        f.Modus = Konjunktiv
      }
    case 'm':
      f.Genus = Masculinum
    case 'n':
      f.Genus = Neutrum
    case 'p':
      if strings.HasPrefix(check, "part") {
        f.Modus = Partizip
      } else if strings.HasPrefix(check, "praes") {
        f.Tempus = Praesens 
      } else if strings.HasPrefix(check, "praet") {
        f.Tempus = Imperfekt
      } else if strings.HasPrefix(check, "plus") {
        f.Tempus = Plusquamperfekt
      } else if strings.HasPrefix(check, "pas") {
        f.GenusVerbi = Passiv
      }
    case 'v':
      if strings.HasPrefix(check, "vok") {
        f.Kasus = Vokativ
      }
    } 
  }
  return f
}


/**
  * Language specific
  */

type Completer interface {
  Complete(wort Wort)
}




func main() {
  file, _ := os.Open("lexikon.txt", os.O_RDONLY, 0)

  reader := bufio.NewReader(file)

  s, _ := reader.ReadString(10)
  fmt.Println(s)
  
  file.Close()



  f := new(Form)
  f.Person = 1;
  f.Numerus = Plural;
  f.Kasus = Genitiv;

  
  s = f.String()

  fmt.Println(CreateForm(s).String());
}

