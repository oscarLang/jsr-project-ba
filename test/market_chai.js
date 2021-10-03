process.env.NODE_ENV = 'test';
var assert = require("assert");
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017";

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

let payload = { email: 'test@test.com' };
const token = jwt.sign(payload, secret, { expiresIn: '12h' });

chai.should();
var expect = chai.expect;

chai.use(chaiHttp);
var cookies;
describe('Market', () => {
    after(async function(){
        const client  = await mongo.connect(dsn);
        const db = await client.db('test');
        const col = await db.collection('objects');
        await col.deleteMany();
    });
    describe('POST /market/new', () => {
        it('201 new object added', (done) => {
            chai.request(server)
                .post("/market/new")
                .set('Cookie', 'jwt=' + token)
                .send({
                    stock: "ABB",
                    name: "TEST",
                    startPrice: 32,
                    startQuantity: 300
                })
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
    describe('GET /market/all', () => {
        it('200 all objects in market', (done) => {
            chai.request(server)
                .get("/market/all")
                .set('Cookie', 'jwt=' + token)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object");
                    expect(res.body.data[0].stock).to.equal("ABB");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});
