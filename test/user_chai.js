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
describe('User', () => {
    after(async function(){
        const client  = await mongo.connect(dsn);
        const db = await client.db('test');
        const col = await db.collection('users');
        await col.deleteMany();
    });
    describe('POST /user/register', () => {
        it('201 Registered user', (done) => {
            chai.request(server)
                .post("/user/register")
                .send({
                    email: "test@test.com",
                    password: "Test1234"
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
        it('401 All fields not filled', (done) => {
            chai.request(server)
                .post("/user/register")
                .send({
                    email: "test@test.com",
                })
                .then(function (res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
    describe('POST /user/login', () => {
        it('200 user logged in', (done) => {
            chai.request(server)
                .post("/user/login")
                .send({
                    email: "test@test.com",
                    password: "Test1234"
                })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
        it('401 All fields not filled', (done) => {
            chai.request(server)
                .post("/user/login")
                .send({
                    email: "test@test.com"
                })
                .then(function (res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
        it('404 User not found', (done) => {
            chai.request(server)
                .post("/user/login")
                .send({
                    email: "userNotInDb@test.com",
                    password: "testUser12421"
                })
                .then(function (res) {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
        it('401 Password no match', (done) => {
            chai.request(server)
                .post("/user/login")
                .send({
                    email: "test@test.com",
                    password: "testUser12421"
                })
                .then(function (res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
    describe('POST /user/deposit', () => {
        it('201 balance updated', (done) => {
            chai.request(server)
                .post("/user/deposit")
                .set('Cookie', 'jwt=' + token)
                .send({
                    amount: 100
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
        it('401 All fields not filled', (done) => {
            chai.request(server)
                .post("/user/deposit")
                .send({
                    amount: 100,
                })
                .then(function (res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
    describe('GET /user/funds', () => {
        it('200 ', (done) => {
            chai.request(server)
                .get("/user/funds")
                .set('Cookie', 'jwt=' + token)
                .then(function (res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object");
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});
