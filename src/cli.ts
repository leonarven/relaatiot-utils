import { PLAYER_ID_KEY, RELLU_KEY, RUUTU_KEY } from "./constants";
import { IPelilauta } from "./rellu-api/pelilauta";
import { IRelluRuutu } from "./rellu-api/ruutu";
import { StateOptions } from "./rellu-api/types";

import * as fs from 'node:fs/promises';

export function readCliConfig(): Partial<StateOptions> & { sana?: string } {

	let rellu: string|undefined, ruutu: string|undefined, player_id: string|undefined, sana: string|undefined;

	const argv = require('minimist')(process.argv.slice(2));

	console.debug( "argv", argv );

	if (argv["_"] && argv["_"]?.length > 0) {
		sana = argv["_"].join(" ");
	}

	{
		let _rellu = argv["r"] || argv["rellu"];
		if (_rellu) {
			rellu = `${_rellu}`;
		}
	}

	{
		let _ruutu = argv["x"] || argv["ruutu"];
		if (_ruutu) {
			ruutu = `${_ruutu}`;
		}
	}

	{
		let _player_id = argv["i"] || argv["player_id"];
		if (_player_id) {
			player_id = `${_player_id}`;
		}
	}

	return { rellu, ruutu, player_id, sana };
}

export interface IRelluCliJson {

	player_id: string;

	active_rellu_id?: string;
	active_ruutu_id?: string;

	rellut: {
		[id:string]: IPelilauta & {
			ruudut: {
				[id:string]: {

				}
			}
		}
	}
}

interface IRelluCli extends IRelluCliJson {

	[PLAYER_ID_KEY]: string;
	[RELLU_KEY]?: IPelilauta;
	[RUUTU_KEY]?: IRelluRuutu;
}

export class RelluCli implements IRelluCli {

	rellut: IRelluCli["rellut"];

	[PLAYER_ID_KEY]: IRelluCli[typeof PLAYER_ID_KEY];
	[RELLU_KEY]:     IRelluCli[typeof RELLU_KEY];
	[RUUTU_KEY]:     IRelluCli[typeof RUUTU_KEY];

	constructor( player_id: string, public active_rellu_id?: string, public active_ruutu_id?: string ) {

		this[PLAYER_ID_KEY] = player_id;

		this.rellut = {};
	}

	getState(): StateOptions {
		return {
			[RELLU_KEY]:     this.active_rellu_id,
			[RUUTU_KEY]:     this.active_ruutu_id,
			[PLAYER_ID_KEY]: this[PLAYER_ID_KEY]
		}
	}

	arvaaSana( sana: string ) {
		throw new Error("Not Implemented");
	}

	/**
	 * Luetaan tiedot player_id, active_rellu_id, active_ruutu_id
	 */
	static fromJSON( json: IRelluCliJson ) {

		let { player_id, active_rellu_id, active_ruutu_id } = json;

		return new RelluCli( player_id, active_rellu_id, active_ruutu_id );
	}

	static async readFile( file: string ) {
		
		let result = (await fs.readFile( file )).toString( "utf8" );

		let json = JSON.parse( result );

		return RelluCli.fromJSON( json );
	}


	static async fromLatestFile() {

		const path = require('path');

		const directoryPath = RelluCli.getPath();

		// Lue kaikki tiedostot kansiosta
		const files = await fs.readdir(directoryPath);
		
		let latestFile = null;
		let latestTime = 0;

		// Käy läpi kaikki tiedostot
		for (const file of files) {
			const filePath = path.join(directoryPath, file);
			
			// Hae tiedoston tiedot
			const stats = await fs.stat(filePath);
			
			// Jos tiedosto on uudempi kuin aiemmin löydetty uusin tiedosto, päivitä
			if (stats.mtime.getTime() > latestTime) {
				latestFile = file;
				latestTime = stats.mtime.getTime();
			}
		}

		if (latestFile) {
			return await RelluCli.readFile( path.join(directoryPath, latestFile ));
		} else {
			throw new Error("No files found");
		}
	}

	/**
	 * Tallennetaan tiedot player_id, active_rellu_id, active_ruutu_id
	 */
	toJSON(): IRelluCliJson {

		let { player_id, active_rellu_id, active_ruutu_id } = this;

		let json: IRelluCliJson = {
			player_id, active_rellu_id, active_ruutu_id,
			rellut: {}
		};

		if (active_rellu_id) {
			
			/* json.rellut[ active_rellu_id ] = {
				ruudut: {}
			};

			if (active_ruutu_id) {
				json.rellut[ active_rellu_id ].ruudut[ active_ruutu_id ] = {};
			} */
		}

		return json;
	}

	async writeFile() {
		let file = RelluCli.buildFilename( this.player_id );
		let json = this.toJSON();

		let oldjson = JSON.parse(( await fs.readFile( file )).toString( "utf8" )) as IRelluCliJson;

		json.rellut = { ...oldjson.rellut, ...json.rellut };

		await fs.writeFile( file, JSON.stringify( json ))

	}

	static getPath() {
		return '/home/leonarven/projektit/2024-07-19-rellu-api/.cli/';
	}

	static buildFilename( player_id: string ) {
		let path = RelluCli.getPath();
		let filename = `rellu-cli-1-${ player_id }.json`;
		return `${ path }${ filename }`;
	}
}