/**
*User Model
*
*/
module.exports = {
  attributes: {
    email     : { type: 'string',  unique: true },
    passports : { collection: 'Passport', via: 'user' },
    mailVerified : { type: 'boolean', defaultsTo : false},
    intlCredential : { type: 'string', unique : true},
    firstName : {type : 'string'},
    lastName : {type : 'string'},
    contactInfo: {
      type : 'json',
      defaultsTo:{
        firstName:null,
        lastName:null,
        telephones:[],
        location:{
          latitude:null,
          longitude:null},
          email:null,
          address:null
        }
      },
    autoSub:{type:'boolean',defaultsTo:false},
    tokens : {collection:'Token',via:'user'},
    payments : { collection : 'Payment', via : 'user'},
    payouts : {collection : 'payout',via : 'user'},
    subscribedUntil : {type: 'json',defaultsTo:null},
    recommender : {type : 'string', allowNull : true},
    recommended : {type:'json',defaultsTo:{}},
    maxReco:{type:'number',defaultsTo:3},
    totalBalance : { type:'number'},
    balance : { type : 'json', defaultsTo : []}
  },
  canRecomend:function(user){
    return Object.keys(user.recommended).length < user.maxRecomended||3;
  },
  isSubscribed:function(){
    return user.subscribedUntil==null ? false :  Date.compare(user.subscribedUntil, Date.today()) >= 0;
  }
};
