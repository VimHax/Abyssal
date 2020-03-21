export interface Document {
	[key: string]: any;
}

export interface Query {
	[key: string]: any;
}

let Data: Document[] = [];

function matchQuery(query: Query, document: Document): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (document[key] !== query[key]) return false;
	return true;
}

export class Database {
	// eslint-disable-next-line no-useless-constructor
	public constructor(private readonly debug?: boolean) { }

	public async initialize() { this.debug && console.log('Database --> Initialized'); }

	public async find(query: Query) {
		this.debug && console.log('Database --> Find', query);
		return Data.filter(doc => matchQuery(query, doc));
	}

	public async findOne(query: Query) {
		this.debug && console.log('Database --> Find One', query);
		return Data.find(doc => matchQuery(query, doc));
	}

	public async update(query: Query, document: Document) {
		this.debug && console.log('Database --> Update', query, document);
		let updated = false;
		Data = Data.map(doc => (matchQuery(query, doc) && ((updated = true) && document)) || doc);
		if (!updated) Data.push(document);
	}

	public async insert(document: Document) {
		this.debug && console.log('Database --> Insert', document);
		Data.push(document);
	}

	public async delete(query: Query) {
		this.debug && console.log('Database --> Delete', query);
		Data = Data.filter(doc => !matchQuery(query, doc));
	}
}
