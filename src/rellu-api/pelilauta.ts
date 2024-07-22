export interface IPelilauta {

    id: string;

    leveys?:  number;
    korkeus?: number;
    koko:     number;
}

export class Pelilauta implements IPelilauta {

    id:      IPelilauta["id"];

    leveys:  IPelilauta["leveys"];
    korkeus: IPelilauta["korkeus"];
    koko:    IPelilauta["koko"];

    constructor({ id, koko, leveys, korkeus }: IPelilauta ) {

        this.id = id;

        if (koko) {
            this.koko = koko;
            this.leveys = Math.round( Math.sqrt( koko ));
            this.korkeus = Math.round( Math.sqrt( koko ));
        } else if (leveys && korkeus) {
            this.koko = leveys * korkeus;
            this.leveys = leveys;
            this.korkeus = korkeus;
        } else {
            this.koko    = 9;
            this.leveys  = 3;
            this.korkeus = 3;
        }
    }

    private ruudut = {};
    }