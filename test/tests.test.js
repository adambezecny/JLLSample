const expect = require('chai').expect
const nock = require('nock')
const sampleData = require('./sampleData')
const sampleResponseDesc = require('./sampleResponseDesc')
const sampleResponseAsc = require('./sampleResponseAsc')
const request = require('supertest')
const app = require('../appExpress')

describe('Api tests', () => {


    before(() => {
        nock('https://api.github.com')
        .get('/orgs/microsoft/repos')
        .times(2)
        .reply(200, sampleData)
    })

    it('sample test 1 - default ascedning order', () => {
        request(app)
        .get('/ghapi/microsoft')
        .expect(200)
        .then(response => {
            expect(response.body).to.deep.equal(sampleResponseAsc)
        })        

    })

    it('sample test 1 - descedning order', () => {
        request(app)
        .get('/ghapi/microsoft?sortOrder=desc')
        .expect(200)
        .then(response => {
            expect(response.body).to.deep.equal(sampleResponseDesc)
        })        

    })    
})    