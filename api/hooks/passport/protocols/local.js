var crypto    = require('crypto');

module.exports = (req,callback) => {
    var query = {
      protocol : 'local',
      provider : 'local'
    }
    if(req.param('action') === 'register') {
        var profile = {
          email : req.body.email,
          firstName:req.body.firstName,
          lastName:req.body.lastName,
          userType : req.body.userType,
          password: req.body.password
        };
        query.accessToken=crypto.randomBytes(48).toString('base64');
        sails.hooks.passport.api.connect(req,query,profile,callback);
    }else{
      User.findOne({email : req.body.identifier}, function (err, user) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          return callback(null, false,{message:'email_or_pass_invalid'});
        }
        Passport.validatePassword({protocol : 'local', user : user.id},req.body.password,
          function (err, res,passport) {
            if (err) {
              return callback(err);
            }
            if (!res) {
              return callback(null, false,{message:'email_or_pass_invalid'});
            } else {
              query.accessToken=passport.accessToken;
              sails.hooks.passport.api.connect(req,query,user,callback);
            }
          });
      });
    }
}
