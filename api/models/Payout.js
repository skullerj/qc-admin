/**
 * Payout.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes:{
      user:{ model: 'User', required: true },
      payed:{type:'boolean',defaultsTo:false},
      amount:{type:'number',required:true},
      fee:{type:'number',required:true},
      address:{type:'string',required:true},
      txId:{type:'string'}
    }
};
