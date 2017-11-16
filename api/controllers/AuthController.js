/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  callback: function (req, res) {
    function tryAgain (info,code) {
      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      var action = req.param('action');

      //set default when nothing comes up
      info = info || {message:'login_error'};
      res.status(code);
      switch (action) {
        case 'register':
      // if the request is waiting for a jsno response it gets
      // false for success if not it redirect to root
         if(!req.wantsJSON){
            res.redirect('/');
         }else{
            if(info.message){
              res.json({error: info.message});
            }else{
              res.json({error: info});
            }
         }
        break;
        case 'disconnect':
          res.redirect('back');
        break;
        default:
          if(req.wantsJSON){
            res.json({error: info.message});
          }else{
            res.redirect('/');
          }

      }
    };
    sails.hooks.passport.api.callback(req, res, function (err, user, info) {
      console.log(err,user,info);
      if (err || !user) {
        var code=409;
        if(err){
          code=500;
        }
        return tryAgain(info,code);
      }

      req.login(user, function (err) {
        if (err) {
          var code=409;
          return tryAgain(err,code);
        }
        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;
        res.cookie('authenticated', '1', { maxAge: 2 * 24 * 60 * 60 * 1000});
        // Upon successful login, return the user

        return res.json(user);

      });
    });
  },
  logout:function(req,res){
    req.logout();
    res.clearCookie('authenticated');
    // mark the user as logged out for auth purposes
    req.session.authenticated = false;
    res.redirect('/')
  },
  /**
  *
  *Creates a new admin user by providing a everchanging password
  *
  */
  createUser:function(req,res){

  }

};
