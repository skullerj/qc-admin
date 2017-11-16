/**
 * Business.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	user : { type : 'string' , required : true },
  	name : { type : 'string' , required : true},
  	description : { type : 'string' },
  	placesIds : { type : 'json', required : true},
  	cityLabel : { type : 'json', required : true},
    email : { type : 'string' , defaultsTo : ''},
    telephones: { type : 'json' , defaultsTo : []},
    image:{type:'string',defaultsTo:''},
    labels : { type : 'json', defaultsTo : []},
    posts : { collection : 'post', via : 'business'}
  }

};
