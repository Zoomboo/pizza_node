const fs = require("fs");
const moment = require("moment");
const md5 = require('md5');
const db = require("/home/tsdtest/db_dbpizza.js");
module.exports = {
    authdata: {},
    today: moment().format("YYYY-MM-DD"),
    user: {},
    allUsers: {},
    Goods: async function () {
        if (!db.goods) await db.connect()
        return await db.goods.find({}).toArray()
    },
    getOrders: async function (uid) {

        if (!db.orders) await db.connect()

        const orders = db.orders.find({ uid }).toArray()
        return orders
    },
    newOrder: async function (orderData) {
        if (this.checkData(orderData)) {
            const Order = {}
            const Cart = orderData.cart
            const Info = orderData.info
            const Curr = orderData.currency
            const deliveryCost = orderData.deliveryCost
            if (!db.users) await db.connect()
            if (orderData.auth) {
                const fuser = await db.users.findOne({ hash: orderData.auth })
                if (fuser) Order.uid = fuser.id
            }
            const ids = Object.keys(Cart)
            const goods = await db.goods.find({ _id: { $in: db.id(ids) } }).toArray()
            if (goods.length) {
                Order.cart = []
                Order.currency = Curr
                Order.fullCost = 0
                Order.deliveryCost = deliveryCost

                Order.info = {}
                Order.info.adress = Info.country + ', ' + Info.state + ', ' + Info.city + ', ' + Info.adress
                Order.info.name = Info.name
                Order.info.email = Info.email
                goods.forEach(g => {
                    const row = {}
                    row.price = g.prices.filter(p => p.curr == Curr)[0].price
                    row.title = g.title
                    row.qua = Cart[g._id]
                    row.id = g.id
                    row._id = g._id
                    row.cost = row.price * row.qua
                    Order.fullCost += row.cost
                    Order.cart.push(row)
                })
                Order.hash = md5(JSON.stringify(Order) + moment().format("YYYY-MM-DD hh"))
                Order.created_at = moment().format("YYYY-MM-DD hh:mm:ss")
                Order.id = await db.getID('orders')
                try {
                    let history = []
                    const insert = await db.orders.insert(Order)
                    if (Order.uid) history = await this.getOrders(Order.uid)
                    return { neworder: Order, message: "Order created!", history }
                } catch (e) {
                    return { message: "Such an order has just been created", status: 1 }
                }
            } else {
                return { message: "No such products found", status: 1 }
            }
        } else {
            return { message: "Incorrect Data", status: 1 }
        }
    },
    checkData: function () { return true },
    checkEmail: function () {
    },
    newUser: async function (regData) {
        let result = {}
        if (!db.users) await db.connect()
        if (this.checkData(regData)) {
            const fuser = await db.users.findOne({ email: regData.email })
            if (!fuser) {
                const id = await db.getID('users')
                if (id) {
                    const newuser = {
                        email: regData.email,
                        name: regData.name,
                        id,
                        email_verified: false,
                        created_at: moment().format("YYYY-MM-DD hh:mm:ss"),
                        updated_at: moment().format("YYYY-MM-DD Thh:mm:ss"),
                        hash: md5(regData.email + ":" + regData.passw)
                    }
                    try {
                        const insert = await db.users.insert(newuser)
                        return { message: `User ${regData.email} registered`, status: 3, newuser }
                    } catch (e) {
                        return { message: "User creation error", status: 1 }
                    }
                } else {
                    return { message: `Error while creating a new user`, status: 6 }
                }
            } else {
                return { message: "User with this email is already registered", status: 2 }
            }
        } else {
            return { message: "Incorrect Data", status: 1 }
        }
    },
    userLogin: async function (loginData) {
        if (this.checkData(loginData)) {
            if (!db.users) await db.connect()
            const hash = md5(loginData.email + ":" + loginData.passw)
            const fuser = await db.users.findOne({ hash })
            console.log(fuser);
            if (fuser) {
                await db.users.update({ _id: fuser._id }, { $set: { 'lastlogin': moment().format("YYYY-MM-DD hh:mm:ss") } })
                return { fuser, status: 5 }
            } else {
                return { message: "User is not found", status: 4 }
            }
        } else {
            return { message: "Incorrect Data", status: 1 }
        }
    },
    autoLogin: async function (hash) {

        if (!db.users) await db.connect()
        const fuser = await db.users.findOne({ hash })
        if (fuser) {
            await db.users.update({ _id: fuser._id }, { $set: { 'lastlogin': moment().format("YYYY-MM-DD hh:mm:ss") } })
            return { fuser, status: 5 }
        } else {
            return { message: "User is not found", status: 4 }
        }

    },
    getUsers: function (stock = '') {
        return new Promise(res => {
            let users = {}
            fs.readFile(usertable, "utf8", (err, data) => {
                if (data) {
                    users = data ? !stock ? JSON.parse(data) : Object.values(JSON.parse(data)).filter(user => { return user.type == stock }) : {}
                    res(users)
                } else if (err) {
                    res(users)
                } else {
                    res(users)
                }
            });
        })
    }
}