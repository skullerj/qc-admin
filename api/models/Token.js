/**
 * Token.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes:{
		token:{type:'string'},
		expireAt:{type:'json',required:true},
		user:{model:'User',required:true},
		rol:{type:'string',required:true,isIn:['p','m']},
		//p:password reset
		//m:mail verification
	}

};
