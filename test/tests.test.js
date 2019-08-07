const expect = require('chai').expect
const nock = require('nock')
const sampleData = require('./sampleData/sampleData')
const sampleResponseDesc = require('./sampleData/sampleResponseDesc')
const sampleResponseAsc = require('./sampleData/sampleResponseAsc')
const request = require('supertest')
const app = require('../src/appExpress')

describe('Api tests', () => {
  before(() => {
    nock('https://api.github.com')
      .get('/orgs/microsoft/repos')
      .times(2)
      .reply(200, sampleData)

    nock('https://api.github.com')
      .get('/orgs/amazon/repos')
      .times(1)
      .reply(404, {
        message: 'Not Found',
        documentation_url: 'https://developer.github.com/v3/repos/#list-organization-repositories'
      })
  })

  it('sample test 1 - default ascedning order', () => {
    request(app)
      .get('/ghapi/org-repos/microsoft')
      .expect(200)
      .then(response => {
        expect(response.body).to.deep.equal({ status: 'ok', data: sampleResponseAsc })
      })
  })

  it('sample test 2 - descending order', () => {
    request(app)
      .get('/ghapi/org-repos/microsoft?sortOrder=desc')
      .expect(200)
      .then(response => {
        expect(response.body).to.deep.equal({ status: 'ok', data: sampleResponseDesc })
      })
  })

  it('sample test 3 - non existing org -> error', () => {
    request(app)
      .get('/ghapi/org-repos/amazon')
      .expect(500)
      .then(response => {
        expect(response.body).to.deep.equal({
          status: 'error',
          error: 'Opps. Somethign went wrong.',
          origError: {
            message: 'Not Found',
            documentation_url: 'https://developer.github.com/v3/repos/#list-organization-repositories'
          }
        })
      })
  })
})
