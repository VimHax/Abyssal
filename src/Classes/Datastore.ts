
import * as Types from "../index";

class Datastore implements Types.DatastoreInterface {

    async initialize() { throw new Error("Datastore - Initialize Method Not Defined"); }

    find(query: Types.DatastoreData) {
        throw new Error("Datastore - Find Method Not Defined");
        return new Promise<Types.DatastoreData[]>(resolve => resolve([]));
    }

    findOne(query: Types.DatastoreData) {
        throw new Error("Datastore - Find One Method Not Defined");
        return new Promise<Types.DatastoreData>(resolve => resolve({}));
    }

    async update(query: Types.DatastoreData, data: Types.DatastoreData) { throw new Error("Datastore - Update Method Not Defined"); }
    async insert(data: Types.DatastoreData) { throw new Error("Datastore - Insert Method Not Defined"); }
    async delete(query: Types.DatastoreData) { throw new Error("Datastore - Delete Method Not Defined"); }

}

export default Datastore;