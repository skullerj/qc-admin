/**
 * Post.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    business : { model : 'business', required : true },
    type : { type : 'string', required : true},
    labels : { type : 'json', defaultsTo : []},
    placesIds : { type : 'json',defaultsTo:[]},
    cityLabel : { type : 'string',required:true},
    details:{type:'json',defaultsTo:{}},
    name : { type: 'string', required : true}
  }

};
