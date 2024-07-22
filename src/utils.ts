import { PLAYER_ID_KEY, RELLU_KEY, RUUTU_KEY } from "./constants";
import { getElementsFromHtmlByQuerySelectorAll } from "./dom";
import { IRelaatio, IRelaatioSana, ISana, Relaatio, RelaatioSana, Sana } from "./rellu-api";
import { StateOptions } from "./rellu-api/types";
import { HTMLElement } from "./types";



// Apufunktio pisteiden etäisyyden laskemiseen
const laskeEtaisyys = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

/**
* Yhdistää pisteet ja viivat
* @param {Array} pisteet 
* @param {Array} viivat 
* @returns {Array}
*/
export function yhdistaPisteetJaViivat( pisteet: ISana[], viivat: IRelaatio[], rellu: string, ruutu: string ) {
	
	// Apufunktio lähimmän pisteen löytämiseen
	const loydalLahinPiste = (x: number, y: number, pisteet: ISana[]) => {

		let piste: { id?: ISana["id"]; etaisyys: number } = pisteet.reduce((lahin, piste) => {
			const etaisyys = laskeEtaisyys(x, y, piste.left, piste.top);
			return etaisyys < lahin.etaisyys ? { ...piste, etaisyys } : lahin;
		}, { etaisyys: Infinity });

		return piste && piste.id;
	};

	let yhteydet: IRelaatioSana["yhteydet"] = [];

	// Luodaan kopio pisteistä ja lisätään yhteydet-taulukko
	const yhdistetytPisteet: RelaatioSana[] = pisteet.map( piste => new RelaatioSana({ ...piste, yhteydet, rellu, ruutu, hash: RelaatioSana.buildHash( rellu, ruutu, piste.id ) }) );
	
	// Käydään läpi viivat ja yhdistetään pisteet
	viivat.forEach( viiva => {
		const alkuPisteId  = loydalLahinPiste(viiva.startX, viiva.startY, pisteet);
		const loppuPisteId = loydalLahinPiste(viiva.endX, viiva.endY, pisteet);
		
		const alkuPiste = alkuPisteId != null && yhdistetytPisteet.find(p => p.id === alkuPisteId);
		const loppuPiste = loppuPisteId != null && yhdistetytPisteet.find(p => p.id === loppuPisteId);
		
		if (alkuPiste && loppuPiste && alkuPisteId !== loppuPisteId) {
			if (!alkuPiste.yhteydet.includes( loppuPisteId )) {
				alkuPiste.yhteydet.push( loppuPisteId );
			}
			if (!loppuPiste.yhteydet.includes( alkuPisteId )) {
				loppuPiste.yhteydet.push( alkuPisteId );
			}
		}
	});
	
	return yhdistetytPisteet;
}


export function parseSanatFromHtml( html: string, rellu: string, ruutu: string ): { [hash:string]: RelaatioSana } {

	let sanaElems = [ ...getElementsFromHtmlByQuerySelectorAll( html, "#pelikentta div.sana") ];
	let sanat     = sanaElems.map( e => Sana.FromHtmlElement(e) );

	//let relaElems = [ ...getElementsFromHtmlByQuerySelectorAll( html, "#pelikentta svg path[stroke='#8ab2e5']") ];	
	//let relaatiot = relaElems.map( e => Relaatio.FromHtmlElement(e) );

	let relaatiot = Relaatio.ArrayFromHTMLScript( html );

	return yhdistaPisteetJaViivat( sanat, relaatiot, rellu, ruutu ).reduce(( res: { [hash:string]: RelaatioSana }, piste: RelaatioSana ) => {
		res[ piste.hash ] = piste;
		return res;
	}, {});
	
}

export function parseRuudutFromHtml( html: string ) {

	let activeRuutuId = '-1';

	let ruudut = [ ...getElementsFromHtmlByQuerySelectorAll( html, "form td.pikkuruutu" ) ].map( elem => {
		let classes = elem.className.replace("pikkuruutu","").trim().split(/\s+/g);
		let nykyinen = false;
		if (classes.indexOf("kyseinen") != -1) { nykyinen = true; classes.splice( classes.indexOf("kyseinen"), 1 ); }
		if (classes.length > 1) throw "Unexpected amount of classes on form td.pikkuruutu";

		let id = elem.id.substring( 5 );

		if (nykyinen) activeRuutuId = id;

		let teemaSana = elem.getAttribute('title');

		return {
			id,
			type: classes[0],
			teemaSana: (teemaSana && teemaSana == '?') ? null : teemaSana
		}
	});

	for (let ruutu of ruudut) {
		if (activeRuutuId == '-1' && ruutu.teemaSana) {
			activeRuutuId = ruutu.id;
			break;
		}
	}

	return { ruudut, activeRuutuId: activeRuutuId.trim() };
}

export function parseActiveRelluIdFromHtml( html: string ) {
	try {
		//let token = '<input type="hidden" name="rellu" value="';
		let token = "<input type='hidden' name='rellu' value='";
		let idx = html.indexOf( token );
		if (idx == -1) throw new Error("Unable to find rellu id");
		let subhtml = html.substring( idx + token.length );
		let rellu = subhtml.substring( 0, subhtml.indexOf("'") );

		if (!rellu || isNaN(parseInt(rellu))) throw "Unable to parse rellu id";

		return rellu.trim();
	} catch (error) {
		console.error("Error parsing html", html);
		throw error;
	}
}

export function parsePlayerIdFromHtml( html: string ) {
	try {
		//let token = '<input type="hidden" name="id" value="';
		let token = "<input type='hidden' name='id' value='";
		let idx = html.indexOf( token );
		if (idx == -1) throw new Error("Unable to find player_id");
		let subhtml = html.substring( idx + token.length );
		let player_id = subhtml.substring( 0, subhtml.indexOf("'") );

		if (!player_id) throw "Unable to parse player_id";

		return player_id.trim();
	} catch (error) {
		console.error("Error parsing html", html);
		throw error;
	}
}

export function extendStateOptions( html: string, options: Partial<StateOptions> ) {

	let { activeRuutuId: ruutu } = parseRuudutFromHtml( html );
	let rellu = parseActiveRelluIdFromHtml( html );
	let player_id = parsePlayerIdFromHtml( html );

	if (options[RELLU_KEY] != null && options[RELLU_KEY] !== rellu) {
		throw new Error(`Conflicting rellu id ${options[RELLU_KEY]}(typeof ${typeof options[RELLU_KEY]}) with ${rellu}(typeof ${typeof rellu})`);
	} else {
		options[RELLU_KEY] = rellu;
	}

	if (options[RUUTU_KEY] != null && options[RUUTU_KEY] !== ruutu) {
		throw new Error(`Conflicting ruutu id ${options[RUUTU_KEY]}(typeof ${typeof options[RUUTU_KEY]}) with ${ruutu}(typeof ${typeof ruutu})`);
	} else {
		options[RUUTU_KEY] = ruutu;
	}

	if (options[PLAYER_ID_KEY] != null && options[PLAYER_ID_KEY] !== player_id) {
		throw new Error(`Conflicting player_id ${options[PLAYER_ID_KEY]}(typeof ${typeof options[PLAYER_ID_KEY]}) with ${player_id}(typeof ${typeof player_id})`);
	} else {
		options[PLAYER_ID_KEY] = player_id;
	}

	return options as { [RELLU_KEY]: string, [RUUTU_KEY]: string, [PLAYER_ID_KEY]: string };
}

/**
 * Maskataan sana
 * Maskaus:
 *  - Kirjaimet muutetaan pisteiksi
 *  - Jokaisen välilyönnin kohdalle kirjataan sitä edeltävän sanan pituus suluissa
 *  - Esim:
 *    - "kissa" -> "..... (5)"
 *    - "kissa ja koira" -> "..... (5) .. (2) ..... (5)"
 *    - "Mitä: etkö sinä tiennyt?" -> "....: (5) .... (4) .... (4) .......? (8)"
 */
export function convertStringToMaskedString( a: string ) {
	let masked = a.split(/\s+/g).map( sana => sana.toLowerCase().replace(/[a-zåäö]/g, ".") + ` (${ sana.length })` ).join(" ");
	return masked.trim();
}



/**
 * Vertaillaan käyttäjän arvaamaa sanaa ja tiedossa olevaa maskattua sanaa
 */
export function compareMaskedRelaatioSanaToString( a: IRelaatioSana, b: string ) {
	let masked = convertStringToMaskedString( b );
	return a.text == masked;
}