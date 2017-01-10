'use strict'

const expect = require('code').expect
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const utils = require('./../utils')
const userOps = require('../../lib/ops/userOps')
const organizationOps = require('../../lib/ops/organizationOps')
const policyOps = require('../../lib/ops/policyOps')
const server = require('./../../wiring-hapi')

lab.experiment('Users: read - delete - update', () => {

  lab.test('get user list', (done) => {
    const options = utils.requestOptions({
      method: 'GET',
      url: '/authorization/users'
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result.length).to.equal(7)
      expect(result[0]).to.equal({
        id: 'AugustusId',
        name: 'Augustus Gloop',
        organizationId: 'WONKA'
      })

      done()
    })
  })

  lab.test('get single user', (done) => {
    const options = utils.requestOptions({
      method: 'GET',
      url: '/authorization/users/AugustusId'
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result).to.equal({
        id: 'AugustusId',
        name: 'Augustus Gloop',
        organizationId: 'WONKA',
        policies: [],
        teams: [
          {
            id: 1,
            name: 'Admins'
          }
        ]
      })

      done()
    })
  })

  lab.test('delete user should return 204 if success', (done) => {
    userOps.createUser({name: 'test', id: 'testId', organizationId: 'ROOT'}, (err, user) => {
      expect(err).to.not.exist()

      const options = utils.requestOptions({
        method: 'DELETE',
        url: '/authorization/users/testId',
        headers: {
          authorization: 'ROOTid'
        }
      })

      server.inject(options, (response) => {
        const result = response.result

        expect(response.statusCode).to.equal(204)
        expect(result).to.be.undefined

        done()
      })
    })
  })

  lab.test('update user should return 200 for success', (done) => {
    const options = utils.requestOptions({
      method: 'PUT',
      url: '/authorization/users/ModifyId',
      payload: {
        name: 'Modify you',
        teams: []
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result).to.equal({
        id: 'ModifyId',
        name: 'Modify you',
        organizationId: 'WONKA',
        teams: [],
        policies: []
      })

      userOps.updateUser({ name: 'Modify Me', id: 'ModifyId', organizationId: 'WONKA', teams: [] }, done)
    })
  })

})

lab.experiment('Users - create', () => {
  lab.test('create user for a non existent organization', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users',
      payload: {
        name: 'Salman',
        id: 'testId'
      },
      headers: {
        authorization: 'ROOTid',
        org: 'DOES_NOT_EXISTS'
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(400)
      expect(result).to.equal({
        error: 'Bad Request',
        message: `Organization 'DOES_NOT_EXISTS' does not exists`,
        statusCode: 400
      })

      done()
    })
  })

  lab.test('create user for a specific organization being a SuperUser', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users',
      payload: {
        name: 'Salman',
        id: 'testId'
      },
      headers: {
        authorization: 'ROOTid',
        org: 'OILCOUSA'
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(201)
      expect(result.id).to.equal('testId')
      expect(result.name).to.equal('Salman')
      expect(result.organizationId).to.equal('OILCOUSA')

      userOps.deleteUser({ id: 'testId', organizationId: 'OILCOUSA' }, done)
    })
  })


  lab.test('create user for a specific organization being a SuperUser but without specifying the user id', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users',
      payload: {
        name: 'Salman'
      },
      headers: {
        authorization: 'ROOTid',
        org: 'OILCOUSA'
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(201)
      expect(result.id).to.not.be.null()
      expect(result.name).to.equal('Salman')
      expect(result.organizationId).to.equal('OILCOUSA')

      userOps.deleteUser({ id: result.id, organizationId: 'OILCOUSA' }, done)
    })
  })

  lab.test('create user for the admin organization', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users',
      payload: {
        name: 'Salman',
        id: 'U2FsbWFu'
      },
      headers: {
        authorization: 'ROOTid'
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(201)
      expect(result.id).to.equal('U2FsbWFu')
      expect(result.name).to.equal('Salman')
      expect(result.organizationId).to.equal('ROOT')

      userOps.deleteUser({ id: result.id, organizationId: 'ROOT' }, done)
    })
  })

  lab.test('create user should return 400 bad request if input validation fails', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users',
      payload: {}
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(400)
      expect(result).to.include({
        statusCode: 400,
        error: 'Bad Request'
      })

      done()
    })
  })
})

lab.experiment('Users - manage policies', () => {
  lab.test('add policies to a user', (done) => {
    const options = utils.requestOptions({
      method: 'PUT',
      url: '/authorization/users/ModifyId/policies',
      payload: {
        policies: [1]
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result.policies).to.equal([{
        id: 1,
        name: 'Director',
        version: '0.1'
      }])

      userOps.deleteUserPolicies({ id: 'ModifyId', organizationId: 'WONKA' }, done)
    })
  })

  lab.test('clear and replace policies for a user', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users/ModifyId/policies',
      payload: {
        policies: [1]
      }
    })

    server.inject(options, (response) => {
      const result = response.result

      expect(response.statusCode).to.equal(200)
      expect(result.policies).to.equal([{
        id: 1,
        name: 'Director',
        version: '0.1'
      }])

      options.payload.policies = [2, 3]
      server.inject(options, (response) => {
        const result = response.result

        expect(response.statusCode).to.equal(200)
        expect(result.policies).to.equal([
          {
            id: 2,
            name: 'Accountant',
            version: '0.1'
          },
          {
            id: 3,
            name: 'Sys admin',
            version: '0.1'
          }
        ])

        userOps.deleteUserPolicies({ id: 'ModifyId', organizationId: 'WONKA' }, done)
      })
    })
  })

  lab.test('remove all user\'s policies', (done) => {
    const options = utils.requestOptions({
      method: 'DELETE',
      url: '/authorization/users/ManyPoliciesId/policies'
    })

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(204)
      userOps.readUser({ id: 'ManyPoliciesId', organizationId: 'WONKA' }, (err, user) => {
        expect(err).not.to.exist()
        expect(user.policies).to.equal([])

        userOps.replaceUserPolicies({ id: 'ManyPoliciesId', organizationId: 'WONKA', policies: [10, 11, 12, 13, 14] }, done)
      })
    })
  })

  lab.test('remove one user\'s policies', (done) => {
    const options = utils.requestOptions({
      method: 'DELETE',
      url: '/authorization/users/ManyPoliciesId/policies/10'
    })

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(204)
      userOps.readUser({ id: 'ManyPoliciesId', organizationId: 'WONKA' }, (err, user) => {
        expect(err).not.to.exist()
        expect(user.policies.map(p => p.id)).to.equal([14, 13, 12, 11])

        userOps.replaceUserPolicies({ id: 'ManyPoliciesId', organizationId: 'WONKA', policies: [10, 11, 12, 13, 14] }, done)
      })
    })
  })
})

lab.experiment('Users - checking org_id scoping', () => {
  let policyId

  lab.before((done) => {
    organizationOps.create({ id: 'NEWORG', name: 'new org', description: 'new org' }, (err, org) => {
      if (err) return done(err)

      const policyData = {
        version: 1,
        name: 'Documents Admin',
        organizationId: 'NEWORG',
        statements: '{"Statement":[{"Effect":"Allow","Action":["documents:Read"],"Resource":["wonka:documents:/public/*"]}]}'
      }

      policyOps.createPolicy(policyData, (err, policy) => {
        if (err) return done(err)

        policyId = policy.id
        done()
      })
    })
  })

  lab.after((done) => {
    organizationOps.deleteById('NEWORG', done)
  })

  lab.test('add policies from a different organization should not be allowed', (done) => {
    const options = utils.requestOptions({
      method: 'PUT',
      url: '/authorization/users/ModifyId/policies',
      payload: {
        policies: [policyId]
      }
    })

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(400)
      done()
    })
  })

  lab.test('replace policies from a different organization should not be allowed', (done) => {
    const options = utils.requestOptions({
      method: 'POST',
      url: '/authorization/users/ModifyId/policies',
      payload: {
        policies: [policyId]
      }
    })

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(400)
      done()
    })
  })
})
