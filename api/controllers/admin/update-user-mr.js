var ObjectID = require('mongodb').ObjectID;
module.exports = {


  friendlyName: 'Update user mr',


  description: 'Updated user maximum recommendeds',


  inputs: {
    id:{
      type:'string',
      required:true
    },
    newMr:{
      type:'number',
      required:true
    }
  },


  exits: {
    error:{
      status:500
    },
    success:{
      status:200
    },
    conflict:{
      status:409
    }
  },


  fn: function (inputs, exits) {
    var col = User.getDatastore().manager.collection('user');
    console.log(inputs.id);
    col.update({'_id':ObjectID(inputs.id)},{'$set':{maxReco:inputs.newMr}},(err,res)=>{
      if(err){
        console.error(err);
        return exits.error({message:'server_error'});
      }
      console.log(res.result);
      return exits.success();
    });
  }


};
