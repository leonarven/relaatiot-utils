
export interface IRelaatio {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

const D_COMMA_REGEXP = /M(\d+),(\d+)S\d+,\d+,(\d+),(\d+)/;
const D_SPACE_REGEXP = /M(\d+)\s+(\d+)S\d+\s+\d+\s+(\d+)\s+(\d+)/;

export class Relaatio {

    startX: number;
    startY: number;
    endX: number;
    endY: number;

    constructor({ startX, startY, endX, endY }: IRelaatio) {
        this.startX = startX;
        this.startY = startY;
        this.endX   = endX;
        this.endY   = endY;
    }

    static FromPointArray( [startX, startY, endX, endY, _rest]: [ number|string, number|string, number|string, number|string, ...any[] ] ): Relaatio {
        if (typeof startX == "string") startX = parseInt( startX );
        if (typeof startY == "string") startY = parseInt( startY );
        if (typeof endX == "string") endX = parseInt( endX );
        if (typeof endY == "string") endY = parseInt( endY );
        return new Relaatio({ startX, startY, endX, endY });
    }

    static FromHtmlElement( elem: HTMLElement ): Relaatio {
        let d = elem.getAttribute( "d" );
        if (!d) throw new Error( "No 'd' attribute found" );
        let match =  d.match( D_COMMA_REGEXP );
        if (!match) throw new Error( "No match found" );
        return Relaatio.FromPointArray( match.slice( 1, 5 ) as [ string, string, string, string ] );
    }

    static ArrayFromHTMLScript( html: string ) {

        let match_array = html.split( "\n" ).map( v => v.trim().match( /var c = paper.path\("([^"]+)"\)\.attr\(line\);/ ) ).map( v => v && v[1]?.match?.( D_SPACE_REGEXP ) ).filter( v => v )  as RegExpMatchArray[];
        
        return match_array.map( match => Relaatio.FromPointArray( match.slice( 1, 5 ) as [ string, string, string, string ] ));
    }
}