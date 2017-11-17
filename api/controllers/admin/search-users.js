function parseQuery(inputs){
  console.log(inputs);
  var query={};
  if(inputs.email){
    query.email={'$regex':`.*${inputs.email}.*`};
  }
  if(inputs.firstName){
    query.firstName={'$regex':`.*${inputs.firstName}.*`};
  }
  if(inputs.lastName){
    query.lastName={'$regex':`.*${inputs.lastName}.*`};
  }
  if(Object.keys(query).length<1){
    return null;
  }
  return query;
}

module.exports = {


  friendlyName: 'Search users',


  description: 'Search users that have filelds like the inputs',


  inputs: {
    email:{
      type:'string'
    },
    firstName:{
      type:'string'
    },
    lastName:{
      type:'string'
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
    var query=parseQuery(inputs);
    if(!query){
      return exits.conflict({message:'bad_query'});
    }
    var col = User.getDatastore().manager.collection('user');
    col.find(query).toArray((err,users)=>{
      if(err){
        console.error(err);
        return exits.error({message:'server_error'});
      }
      users=users.map((item)=>{
        item.id=item._id;
        delete item.id;
        return item;
      });
      return exits.success(users);
    });
  }


};
