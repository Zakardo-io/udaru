'use strict'

exports.register = function (server, options, next) {
  // curl -X GET http://localhost:8000/authorization/check/<user_id>/<action>/<resource>
  server.route({
    method: 'GET',
    path: '/authorization/check/{userId}/{action}/{resource*}',
    handler: function (request, reply) {
      const { resource, action, userId } = request.params // TODO: get userId from token

      const params = {
        userId,
        action,
        resource
      }

      options.handleRoleCommandType('authorization', 'authorize', 'user', params, request, reply)
    }
  })

  // curl -X GET http://localhost:8000/authorization/list/<user_id>/<resource>
  server.route({
    method: 'GET',
    path: '/authorization/list/{userId}/{resource*}',
    handler: function (request, reply) {
      const { resource, userId } = request.params // TODO: get userId from token

      const params = {
        userId,
        resource
      }

      options.handleRoleCommandType('authorization', 'list', 'authorizations', params, request, reply)
    }
  })

  next()
}

exports.register.attributes = {
  name: 'authorization',
  version: '0.0.1'
}