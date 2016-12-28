'use strict'
/* eslint-disable handle-callback-err */
const Boom = require('boom')
const iam = require('iam-js')
const policyOps = require('./policyOps')

module.exports = {
  /**
   * Return if a user can perform an action on a certain resource
   *
   * @param  {Object}   options { resource, action, userId,  }
   * @param  {Function} cb
   */
  isUserAuthorized: function isUserAuthorized ({ resource, action, userId, organizationId }, cb) {
    policyOps.listAllUserPolicies({ userId, organizationId }, (err, policies) => {
      if (err) {
        return cb(err)
      }

      iam(policies, ({ process }) => {
        process(resource, action, (err, access) => {
          if (err) {
            return cb(err)
          }

          cb(null, { access })
        })
      })
    })
  },

  /**
   * List all user's actions on a given resource
   *
   * @param  {Object}   options { userId, resource }
   * @param  {Function} cb
   */
  listAuthorizations: function listAuthorizations ({ userId, resource, organizationId }, cb) {
    policyOps.listAllUserPolicies({ userId, organizationId }, (err, policies) => {
      if (err) return cb(Boom.wrap(err))

      iam(policies, ({ actions }) => {
        actions(resource, (err, result) => {
          if (err) return cb(err)

          cb(null, { actions: result })
        })
      })
    })
  }
}
