import { PLAYER_ID_KEY, RELLU_KEY, RUUTU_KEY } from "../constants";

export type StateOptions = {
    [RELLU_KEY]?:     string;
    [RUUTU_KEY]?:     string;
    [PLAYER_ID_KEY]:  string;
}