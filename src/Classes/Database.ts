
import * as Types from '../typings';

let Data: Types.Document[] = [];

function matchQuery(query: Types.Query, document: Types.Document): boolean {
	const props = Object.keys(query);
	let found = true;
	props.forEach(prop => document[prop] === query[prop] || (found = false));
	return found;
}

class Database implements Types.DatabaseInterface {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async initialize() { }

	public async find(query: Types.Query) {
		return Data.filter(doc => matchQuery(query, doc));
	}

	public async findOne(query: Types.Query) {
		return Data.filter(doc => matchQuery(query, doc))[0];
	}

	public async update(query: Types.Query, document: Types.Document) {
		let updated = false;
		Data = Data.map(doc => (matchQuery(query, doc) && ((updated = true) && document)) || doc);
		if (!updated) Data.push(document);
	}

	public async insert(document: Types.Document) {
		Data.push(document);
	}

	public async delete(query: Types.Query) {
		Data = Data.filter(doc => !matchQuery(query, doc));
	}
}

export default Database;
