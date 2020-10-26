const mongo = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;
module.exports = {
    dburl: 'mongodb://localhost:27017',
    collection: "pizzatest",
    tables: ["goods", "orders", "users"],
    connect: function () {
        return new Promise(async (res, error) => {
            try {
                const conn = await mongo.connect(this.dburl)
                const db = conn.db(this.collection);
                for (const t of this.tables) {
                    this[t] = await db.collection(t);
                }
                res({ message: "Connected", status: 1 })
            } catch (e) {
                res({ message: e.message, status: 0 })
            }
        })
    },
    id: function (ids) {
        return ids.map(id => ObjectId(id))
    },
    getID: async function (table) {
        const cursor = await this[table].find().sort({ $natural: -1 }).limit(1).toArray()
        return cursor ? cursor.length ? (cursor[0].id + 1) : 1 : null
    }
}