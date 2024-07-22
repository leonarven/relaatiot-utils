import { BASE, PLAYER_ID, PLAYER_ID_KEY, RELLU_KEY, RUUTU_KEY } from "../constants";
import { extendStateOptions, parseRuudutFromHtml, parseSanatFromHtml } from "../utils";
import { RelaatioSana } from "./sana";
import { StateOptions } from "./types";

export class RelluAPI {
	
	BASE = BASE;
	
    currentState: StateOptions = {
        [PLAYER_ID_KEY]: PLAYER_ID,
    };
	
	constructor( state: StateOptions ) {

        this.currentState = {
            ...this.currentState,
            ...state
        };

        if (this.currentState.rellu != null) {
            this.setRellu( this.currentState[RELLU_KEY].toString() );
        }

        if (this.currentState.ruutu != null) {
            this.setRuutu( this.currentState[RUUTU_KEY] );
        }
	}

    setRellu( rellu: string ) {
        this.currentState[RELLU_KEY] = rellu;
    }

    setRuutu( ruutu: string ) {
        this.currentState[RUUTU_KEY] = ruutu;
    }
	
	private getCookies({ player_id }: Partial<StateOptions> = {}) {

        player_id = player_id || this.currentState[PLAYER_ID_KEY];

        if (player_id) {
            return `player_id=${player_id}; SERVERID=ng-web3-ssl`;
        } else {
            return `SERVERID=ng-web3-ssl`;
        }
	}
	
	private async doFetch( url: string, method: ("GET"|"POST") = "GET", _body?: { [key:string]: any }|FormData|URLSearchParams, options?: StateOptions ) {
		
		let headers = new Headers();
        
        headers.append( "Cookie", this.getCookies( options ) );

        let body: URLSearchParams | undefined = undefined;
		
		if (method !== "GET") {

            if (_body) {

                if (_body instanceof URLSearchParams) {

                    body = _body;

                } else if (_body instanceof FormData) {

                    body = new URLSearchParams( _body as any );

                } else if (typeof _body == "object") { 

                    let form = new FormData();

                    for (let key in _body) {
                        if (_body.hasOwnProperty(key) && _body[key] != null) {
                            let value = _body[key].toString();
                            form.append( key, value );
                        }
                    }

                    body = new URLSearchParams( form as any );

                } else throw new Error("Invalid type of body");
			}
		} 

		let request = new Request( `${ this.BASE }${ url }`, { method, headers, body });
		console.debug( "Running fetch()", request, body )
		return await fetch( request );
	}

    public async fetchRelaatiotPelaaSanaResponse( sana: string, rellu = this.currentState[RELLU_KEY], ruutu = this.currentState[RUUTU_KEY], player_id = this.currentState[PLAYER_ID_KEY] ) {
        return await this.doFetch( '/relaatiot/pelaa/sana.php', 'POST', { sana, r: rellu, id: player_id, ruutu }, { player_id });
    }
    
    public async fetchRelaatiotPelaaSanaInfo( sana: string, rellu = this.currentState[RELLU_KEY], ruutu = this.currentState[RUUTU_KEY], player_id = this.currentState[PLAYER_ID_KEY] ) {
        let response = await this.fetchRelaatiotPelaaSanaResponse( sana, rellu, ruutu, player_id );
        return ( await response.text());
    }

	public async fetchRelaatiotPelaaResponse( rellu = this.currentState[RELLU_KEY], ruutu = this.currentState[RUUTU_KEY], player_id = this.currentState[PLAYER_ID_KEY] ) {
		return await this.doFetch( '/relaatiot/pelaa/', 'POST', { rellu, ruutu, id: player_id }, { player_id });
	}

    public async fetchRelaatiotPelaaInfo( rellu = this.currentState[RELLU_KEY], ruutu = this.currentState[RUUTU_KEY], player_id = this.currentState[PLAYER_ID_KEY] ) {

        let response = await this.fetchRelaatiotPelaaResponse( rellu, ruutu, player_id );

		let html = await response.text();

        let { rellu:_rellu, ruutu:_ruutu } = extendStateOptions( html, { rellu, ruutu, player_id });

        let sanat = parseSanatFromHtml( html, _rellu, _ruutu );

        let { ruudut, activeRuutuId } = parseRuudutFromHtml( html );

        return { sanat, ruudut, activeRuutuId }
    }

    public async fetchRelaatiotPelaaSanat( rellu = this.currentState[RELLU_KEY], ruutu = this.currentState[RUUTU_KEY], player_id = this.currentState[PLAYER_ID_KEY] ): Promise<{ [hash:string]: RelaatioSana }> {

        let sanat: {
            [id: string]: RelaatioSana;
        } = {};

        if (!ruutu || ruutu == '-1') {

        } else {

            let response = await this.fetchRelaatiotPelaaResponse( rellu, ruutu, player_id ); 

            let html = await response.text();

            let { rellu:_rellu, ruutu:_ruutu } = extendStateOptions( html, { rellu, ruutu, player_id });
    
            sanat = parseSanatFromHtml( html, _rellu, _ruutu );
        }

        return sanat;
    }
}
