
export interface IRelluRuutu {
	id:        string;
	teemaSana: string;
}

class Ruutu implements IRelluRuutu {
	
	/** Tunniste tietyn Pelilaudan kontekstissa */
	constructor( public id: IRelluRuutu["id"], public teemaSana: IRelluRuutu["teemaSana"] ) {}
}
