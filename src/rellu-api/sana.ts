import { RELLU_KEY, RUUTU_KEY, RUUTU_WIDTH } from "../constants";
import { HTMLElement } from "../types";

export const SANA_TYPE_UNKNOWN  = "tuntematon";
export const SANA_TYPE_KNOWN    = "tunnettu";
export const SANA_TYPE_THEME    = "teema";

export type SanaType = typeof SANA_TYPE_UNKNOWN | typeof SANA_TYPE_KNOWN | typeof SANA_TYPE_THEME;

export interface ISana {
    left: number;
    top:  number;
    text: string;
    id:   string;

    type: SanaType;
}

export class Sana implements ISana {
    
    left: ISana["left"];
    top:  ISana["top"];
    text: ISana["text"];
    id:   ISana["id"];

    type: ISana["type"];

    constructor({ left, top, text, id, type }: ISana ) {
        this.left = left;
        this.top  = top;
        this.text = text;
        this.id   = id;
        this.type = type;
    }

    static FromHtmlElement( elem: HTMLElement ): Sana {

        let styles = (elem.getAttribute("style") || '').split(";").map( v => v.trim().split(":") ).reduce(( obj, a ) => {
            if (a[0] && a[1]) obj[a[0]] = a[1];
            return obj;
        }, {} as { [key:string]: string });

        if (!styles["left"] && styles["right"]) styles["left"] = (RUUTU_WIDTH - parseInt(styles["right"])).toString();

        if (!styles["top"] && styles["bottom"]) styles["top"] = (RUUTU_WIDTH - parseInt(styles["bottom"])).toString();

        if (!styles["left"] || !styles["top"]) throw new Error( "No 'left' or 'top' style found" );

        let raw = {
            left: styles["left"],
            top:  styles["top"],
            text: elem.textContent,
            id:   elem.id,
            type: elem.className
        };
            
        // "123px" -> 123
        let left = parseInt( raw.left );
        let top  = parseInt( raw.top );
        
        // "s42" -> "42"
        let id = raw.id.substring( 1 );
        
        // "teema sana" -> "teema"
        let type: SanaType = SANA_TYPE_UNKNOWN;
         
        switch (raw.type.substring( 0, raw.type.indexOf( " " ) )) {
            case SANA_TYPE_THEME:
                type = SANA_TYPE_THEME;
                break;
            case SANA_TYPE_KNOWN:
                type = SANA_TYPE_KNOWN;
                break;
            default:
                type = SANA_TYPE_UNKNOWN;
        }

        let text = raw.text || '';
        
        return new Sana({ left, top, text, id, type });
    }
}

export interface IRelaatioSana extends ISana {

    [RELLU_KEY]:    string;
    [RUUTU_KEY]:    string;
    yhteydet:       string[];
    hash:           string;
}

export class RelaatioSana extends Sana {

    [RELLU_KEY]:    IRelaatioSana[typeof RELLU_KEY];
    [RUUTU_KEY]:    IRelaatioSana[typeof RUUTU_KEY];

    yhteydet: IRelaatioSana["yhteydet"];
    hash:     IRelaatioSana["hash"];    

    constructor({ left, top, text, id, type, rellu, ruutu, yhteydet }: ISana & IRelaatioSana ) {
        super({ left, top, text, id, type });
        
        this[RELLU_KEY] = rellu;
        this[RUUTU_KEY] = ruutu;

        this.yhteydet   = yhteydet;
        this.hash       = RelaatioSana.buildHash( rellu, ruutu, id );
    }

    static buildHash( rellu: string, ruutu: string, id: string ) {
        return `${ rellu }-${ ruutu }-${ id }`;
    }
}