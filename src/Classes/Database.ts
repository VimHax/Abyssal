
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
    async update(query: Types.DatabaseData, data: Types.DatabaseData) { Data = Data.map(doc => (matchQuery(query, doc) && data) || doc); }
    async insert(data: Types.DatabaseData) { Data.push(data); }
    async delete(query: Types.DatabaseData) { Data = Data.filter(doc => !matchQuery(query, doc)); }

}

export default Database;