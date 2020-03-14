
import * as Types from "../index";

let Data: Types.Document[] = [];

function matchQuery(query: Types.Query, document: Types.Document): boolean {
    const props = Object.keys(query);
    let found = true;
    props.forEach(prop => document[prop] === query[prop] || (found = false));
    return found;
}

class Database implements Types.DatabaseInterface {

    async initialize() { }
    async find(query: Types.Query) { return Data.filter(doc => matchQuery(query, doc)); }
    async findOne(query: Types.Query) { return Data.filter(doc => matchQuery(query, doc))[0]; }
    async update(query: Types.Query, document: Types.Document) {
        let updated = false;
        Data = Data.map(doc => (matchQuery(query, doc) && ((updated = true) && document)) || doc);
        if (!updated) Data.push(document);
    }
    async insert(document: Types.Document) { Data.push(document); }
    async delete(query: Types.Query) { Data = Data.filter(doc => !matchQuery(query, doc)); }

}

export default Database;