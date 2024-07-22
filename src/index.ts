import { readCliConfig, RelluCli } from "./cli";
import { RelaatioSana, RelluAPI, SANA_TYPE_UNKNOWN } from "./rellu-api";
import { compareMaskedRelaatioSanaToString } from "./utils";

(async () => {

	let { rellu, ruutu, player_id, sana: arvaus } = readCliConfig();

	let cli: RelluCli;

	if (player_id && rellu) {
		cli = new RelluCli( player_id, rellu, ruutu );
	} else if (player_id) {
		cli = await RelluCli.readFile( RelluCli.buildFilename( player_id ));
	} else {
		cli = await RelluCli.fromLatestFile();
	}

	await cli.writeFile();

	console.debug( cli );

	const api = new RelluAPI( cli.getState() );

	if (arvaus) {
		console.log( "Koetetaan pelata sanaa", arvaus );

		let sanat = await api.fetchRelaatiotPelaaSanat();

        let founds: RelaatioSana[] = [];
        for (let hash in sanat) {
            let sana = sanat[hash];
            if (sana.type == SANA_TYPE_UNKNOWN && compareMaskedRelaatioSanaToString( sana, arvaus )) founds.push( sana );
        }

        if (founds.length == 0) {
            throw new Error(`Unable to find masked sana for "${arvaus}"`);
        } else {
            console.log( founds );
            throw new Error("Not implemented");
        }

		//let response = await api.fetchRelaatiotPelaaSanaInfo( arvaus );

		//console.log( response );
	} else {

		let response = await api.fetchRelaatiotPelaaInfo();

		console.log( response );
	
	}

})();