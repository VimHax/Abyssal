
import * as Types from "../index";

let Data: Types.DatabaseData[] = [];

function matchQuery(query: Types.DatabaseData, document: Types.DatabaseData): boolean {
    const props = Object.keys(query);
    let found = true;
    props.forEach(prop => document[prop] === query[prop] || (found = false));
    return found;
}

class Database implements Types.DatabaseInterface {

    async initialize() { }
    async find(query: Types.DatabaseData) { return Data.filter(doc => matchQuery(query, doc)); }
    async findOne(query: Types.DatabaseData) { return Data.filter(doc => matchQuery(query, doc))[0]; }
    async update(query: Types.DatabaseData, data: Types.DatabaseData) {
        let updated = false;
        Data = Data.map(doc => (matchQuery(query, doc) && ((updated = true) && data)) || doc);
        if (!updated) Data.push(data);
    }
    async insert(data: Types.DatabaseData) { Data.push(data); }
    async delete(query: Types.DatabaseData) { Data = Data.filter(doc => !matchQuery(query, doc)); }

}

export default Database;