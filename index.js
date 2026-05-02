import { parseLevel, serializeLevel } from "./src/level.js";
import { decodeGameSave, parseGameSave, serializeGameSave } from "./src/gamesave.js";

export * from "./src/level.js";
export * from "./src/gamesave.js";
export default { parseLevel, serializeLevel, decodeGameSave, parseGameSave, serializeGameSave };