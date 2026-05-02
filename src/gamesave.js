import datakeys from '../data/datakeys.json' assert {type: "json"};

import plist from 'plist';
import pako from 'pako';
import { btoa, atob } from './base64.js';

const errorStringCorrupted = "GD Game Save file is corrupted";
const errorStringNotArray = "The given object is not of type Array";
const errorStringCannotEncode = "Cannot encode given game save data";

export function decodeGameSave (gameSaveString) {

    let err = false;

    try {

        function xor (str, key) {     
            str = String(str).split('').map(letter => letter.charCodeAt());
            let res = "";
            for (let i = 0; i < str.length; i++) res += String.fromCodePoint(str[i] ^ key);
            return res; 
        }

        if (gameSaveString.startsWith('<?xml version="1.0"?>')) return gameSaveString;

        let decoded = xor(gameSaveString, 11);

        try { decoded = atob(decoded) }
        catch (e) { err = true; }

        try { return new TextDecoder("utf-8").decode(pako.ungzip(decoded)) }
        catch (e) { err = true }

    } catch (e) {
        err = true;
    }

    if(err) throw new Error(errorStringCorrupted);

}

export function parseGameSave (xmlString) {

    let pl = plistParse(xmlString);
    let dataObj = [];
    let lvl_id = 0;

    try {
        while (pl.LLM_01["k_" + lvl_id]) {

            let level = {};

            for (let key in pl.LLM_01["k_" + lvl_id]) {
                if (Object.prototype.hasOwnProperty.call(pl.LLM_01["k_" + lvl_id], key)) {
                    let value = pl.LLM_01["k_" + lvl_id][key];

                    if (datakeys[key]) {
                        if (datakeys[key] == "description")
                            level[datakeys[key]] = atob(value);
                        else if (datakeys[key] == "data") {
                            let datDecoded = atob(value);
                            let datUnzip = new TextDecoder("utf-8").decode(pako.ungzip(datDecoded));
                            level[datakeys[key]]  = datUnzip;
                        }
                        else
                            level[datakeys[key]] = value;
                    } else {
                        level[key] = value;
                    }
                }
            }

            dataObj.push(level);
            lvl_id++;
            
        }
    } catch (e) {
        throw new Error(errorStringCorrupted);
    }

    return dataObj;

}

export function serializeGameSave (obj) {

    if(!Array.isArray(obj)) throw new Error(errorStringNotArray);
    
    let xml = '<?xml version="1.0"?><plist version="1.0" gjver="2.0"><dict><k>LLM_01</k><d><k>_isArr</k><t />';
    let li = -1;

    function btoaMod (str) {
        return btoa(str).split('+').join('-').split('/').join('_');
    }

    obj.forEach(lvl => {

        li++;
        xml += `<k>k_${li}</k><d>`;

        let keys = Object.keys(lvl).map(key => Object.values(datakeys).includes(key) ? Object.keys(datakeys)[Object.values(datakeys).indexOf(key)] : key);

        keys.forEach(k => {
            let v = lvl[datakeys[k]] || lvl[k];

            if (k == 'k3') {
                try { v = btoaMod(v) }
                catch { throw new Error(errorStringCannotEncode) } 
            } else if(k == 'k4') {
                try { v = btoaMod(v) }
                catch { throw new Error(errorStringCannotEncode) } 
            }

            let vtag = `<s>${v}</s>`;
            if      (typeof v == 'number' && Math.round(v) == v) vtag = `<i>${v}</i>`;
            else if (typeof v == 'number')                       vtag = `<r>${v}</r>`;
            else if (typeof v == 'boolean')                      vtag = `<${v ? 't' : 'f'} />`;
            else if (typeof v == 'object') {
                let vd = '';
                Object.keys(v).forEach(vk => {
                    vd += `<k>${vk}</k><s>${v[vk]}</s>`;
                });
                vtag = `<d>${vd}</d>`;
            }

            xml += `<k>${k}</k>${vtag}`;
        });

        xml += '</d>';

    });

    xml += '</d><k>LLM_02</k><i>35</i></dict></plist>';
    return xml;

}


function plistParse(data) {
    let val = data.toString();

    val = val.replace(/<d>/g, "<dict>").replace(/<\/d>/g, "</dict>");
    val = val.replace(/<k>/g, "<key>").replace(/<\/k>/g, "</key>");
    val = val.replace(/<s>/g, "<string>").replace(/<\/s>/g, "</string>");
    val = val.replace(/<i>/g, "<integer>").replace(/<\/i>/g, "</integer>");
    val = val.replace(/<r>/g, "<real>").replace(/<\/r>/g, "</real>");
    val = val.replace(/<a>/g, "<array>").replace(/<\/a>/g, "</array>");
    val = val.replace(/t \/>/g, "true/>");
    val = val.replace(/f \/>/g, "false/>");

    return plist.parse(val);
}