# TODO

`rellu-cli`
    - Vivut
        - i / id / player_id
            - Default: Viimeisin
        - r / rellu
            - Default: Viimeisin
        - (x / ruutu)
            - Lienee turha, jos ruuduttomuus toteutuu
        - Jos annetaan loppuparametri, tulkitaan käsky vivuilla kohdistettuun tilaan kohdistetuksi arvaukseksi


# Konseptit

Pelilauta (=Rellu)
 - 2D-ruudukko, jossa on N x N kpl ruutuja
 - Pelilauta sisältää sanoja, jotka ovat joko tunnettuja, teemassanoja tai tuntemattomia
 

Ruutu
    - Ruutu sisältää teemasanan, joka voi olla myös tuntematon
        - Tällöin ruutu on tyhjä
    - Ruudut yhdistyvät toisiinsa reunoista (Not impelemented)

Sana
    - Sana koostuu kirjaimista ja sillä on yhteyksiä muihin sanoihin
    - Sana voi olla tunnettu, teemassana tai tuntematon

Pelaaja
    - Pelaajalla on yksilöllinen tunniste
    - Pelaaja voi olla vain yhdellä pelilaudalla ja vain sen yhdellä ruudulla kerrallaan
    - Pelaaja voi liikkua ruudusta toiseen
    - Pelaaja arvaa sanoja aina koskien kulloistakin ruutua, jossa on

    # Muuttujat
 - {{ID}}    - Player id, esim "1721234567abcde"
 - {{RELLU}} - Relaatio-kenttä
 - {{RUUTU}} - Relaatio-kentän tietty ruutu
 - {{SANA}}  - Pelaajan arvaus



# Alkuperäisen backendin toiminnan takaisinmallinnus

## Evästeet

 - Tallennettu käyttäjätiedot
   - esim: "player_id={{{ID}}}; edited={{ID}}; SERVERID=ng-web3-ssl"
   - player_id pakollinen
   - Domain .hyotynen.iki.fi
   - Path /relaatiot/



## Endpointit
GET /relaatiot/
 - Pelin etusivu


GET /relaatiot/pelaa/
 - HTTP 301 -> /relaatiot/
 

GET /relaatiot/tiedot.php
GET /relaatiot/tiedot.php rellu={{RELLU}} 
POST /relaatiot/tiedot.php rellu={{RELLU}} 
 - Palauttaa HTML'aa jossa esitäytetty <form> esitäytettyine <input>'eineen
 - (Tarkoitus injektoida osaksi sivua /relaatiot/)


POST /relaatiot/pelaa/ rellu={{RELLU}}
 - Palauttaa <html>:n, joka sisältää pelisivun


POST /relaatiot/pelaa/ ruutu={{RUUTU}}&id={{ID}}&r={{RELLU}}
 - Palauttaa tietyn pelisession ja tietyn ruudun ja tietyn pelilaudan pelisivun 


POST /relaatiot/pelaa/sana.php sana={{SANA}}&ruutu={{RUUTU}}&id={{ID}}&r={{RELLU}}
 - Palauttaa joko "false" tai JSON-vastauksen, jossa taulukollinen taulukoita, joissa paljastuneiden sanojen asetuksia, esim:
   - [["14", ",6,12,13,15,20,21", "Tuntematon sotilas",     "1", "310","505", "12", "",      "",""],
      ["6",  ",5,14",             "..... (5) ........ (8)", "1", "110","510", "12", "",      "",""],
      ["12", ",4,5,11,14",        "..... (5) ..... (5)",    "1", "190","415", "12", "",      "",""],
      ["15", ",14",               "..... (5) ..... (5)",    "1", "315","575", "12", "17,13", "",""],
      ["20", ",14,30",            "....... (7)",            "1", "550","450", "12", "",      "",""],
      ["21", ",14,27",            "..... (5)",              "1", "485","525", "12", "",      "",""]]
   -    ID,   Yhteydet,            Sana,                     ??,  X,    Y,     ??,  ??,      ??, ??


POST /relaatiot/pelaa/pelitilanne.php ruutu={{RUUTU}}&r={{RELLU}}
 - Palauttaa pilkulla erotettuna ratkaisemattomien sanojen tunnisteet(???)


GET ohje.php
POST ohje.php
 - Ohjesivu
