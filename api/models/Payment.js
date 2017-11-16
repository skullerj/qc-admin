/**
 * Payment.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: { model: 'User', required: true },
    txId : { type: 'string'},
    txStatus: {type:'string', defaultsTo: 'new'},
    distributed : { type: 'boolean', defaultsTo : false },
    realized: {type:'boolean',defaultsTo:false},
    amount: {type:'number'},
    url: {type:'string'}
  }

};
