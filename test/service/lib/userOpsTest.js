'use strict'

const test = require('tap').test
const service = require('../../../service/lib/service')

// TODO: add checks for rowcounts, in e.g. createUser

test('list of all users', (t) => {
  t.plan(3)
  service((svc) => {
    svc.listAllUsers({}, (err, result) => {
      t.error(err, 'should be no error')
      t.ok(result, 'result should be supplied')
      // console.log(result)
// TODO:      t.deepEqual(result, expectedUserList, 'data should be as expected')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('list of org users', (t) => {
  t.plan(3)
  service((svc) => {
    svc.listOrgUsers([1], (err, result) => {
      t.error(err, 'should be no error')
      t.ok(result, 'result should be supplied')
// TODO:      t.deepEqual(result, expectedUserList, 'data should be as expected')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('create a user by ID', (t) => {
  t.plan(4)
  service((svc) => {
    svc.createUserById([99, 'Mike Teavee', 'WONKA'], (err, result) => {
      t.error(err, 'should be no error creating')
      t.ok(result, 'result should be supplied')
      t.deepEqual(result, { id: 99, name: 'Mike Teavee', teams: [], policies: [] }, 'data should be as expected')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('create a user', (t) => {
  t.plan(4)
  service((svc) => {
    svc.createUser(['Grandma Josephine', 'WONKA'], (err, result) => {
      t.error(err, 'should be no error creating')
      t.ok(result, 'result should be supplied')
      t.deepEqual(result.name, 'Grandma Josephine', 'data should be as expected')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('update a user', (t) => {
  t.plan(3)
  service((svc) => {
    svc.updateUser([99, 'Augustus Gloop'], (err, result) => {
      t.error(err, 'should be no error')
      t.ok(result, 'result should be supplied')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('read a specific user', (t) => {
  t.plan(3)
  service((svc) => {
    svc.readUserById([1], (err, result) => {
      t.error(err, 'should be no error')
      t.ok(result, 'result should be supplied')
      // t.deepEqual(result, [{ id: 99, name: 'Augustus Gloop' }], 'data should be as expected')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('read a specific user that does not exist', (t) => {
  t.plan(3)
  service((svc) => {
    svc.readUserById([987654321], (err, result) => {
      // console.log(err)
      t.equal(err.message, 'not found')
      t.notOk(result, 'result should not be supplied')
      // t.deepEqual(result, [{ id: 99, name: 'Augustus Gloop' }], 'data should be as expected')
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})

test('delete a user', (t) => {
  t.plan(3)
  service((svc) => {
    svc.deleteUserById([99], (err, result) => {
      t.error(err, 'should be no error')
      t.ok(result, 'result should be supplied')
      // t.deepEqual(result, { id: 3, name: 'Veruca Salt' }, 'data should be as expected')
      // TODO: test correct data exists before and after the call
      svc.destroy({}, (err, result) => {
        t.error(err)
      })
    })
  })
})