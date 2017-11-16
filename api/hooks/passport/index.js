module.exports = function(sails){
  var protocols = require('./protocols'),
      api=require('passport'),
      _ = require('lodash');
 /**
  * Connect a third-party profile to a local user
  *
  * This is where most of the magic happens when a user is authenticating with a
  * third-party provider. What it does, is the following:
  *
  *   1. Given a provider and an identifier, find a matching Passport.
  *   2. From here, the logic branches into two paths.
  *
  *     - A user is not currently logged in:
  *       1. If a Passport wasn't found, create a new user as well as a new
  *          Passport that will be assigned to the user.
  *       2. If a Passport was found, get the user associated with the passport.
  *
  *     - A user is currently logged in:
  *       1. If a Passport wasn't found, create a new Passport and associate it
  *          with the already logged in user (ie. "Connect")
  *       2. If a Passport was found, nothing needs to happen.
  *
  * As you can see, this function handles both "authentication" and "authori-
  * zation" at the same time. This is due to the fact that we pass in
  * `passReqToCallback: true` when loading the strategies, allowing us to look
  * for an existing session in the request and taking action based on that.
  *
  * For more information on auth(entication|rization) in Passport.js, check out:
  * http://passportjs.org/guide/authenticate/
  * http://passportjs.org/guide/authorize/
  *
  * @param {Object}   req
  * @param {Object}   query
  * @param {Object}   profile
  * @param {Function} next
  */
  api.connect=function(req, query, profile, next){
    var user = {}
      , provider
      , recommender;

    // Get the authentication provider from the query.
    provider = req.param('provider');
    // If the provider cannot be identified we cannot match it to a passport so
    // throw an error and let whoever's next in line take care of it.
    if (!provider){
      return next(null,null,{message:'no_provider_selected'});
    }

    // If the profile object contains a list of emails, grab the first one and
    // add it to the user.
    if (profile.hasOwnProperty('emails')) {
      user.email = profile.emails[0].value;
    }

    //check if the user only has one email and add it to the user
    if(profile.hasOwnProperty('email')){
      user.email= profile.email;
    }
    // If an email was not available in the profile, we don't
    // have a way of identifying the user in the future. Throw an error and let
    // whoever's next in the line take care of it.
    if (!user.email) {
      return next(null,false,{message:'no_username_or_email_provided'});
    }
    //Parse the query object that is going to be used to search
    var parsedQuery={};
    switch (query.protocol) {
      case 'local':
        parsedQuery={
          accessToken:query.accessToken,
          provider:'local'
        };
        break;

    }

    sails.models['passport'].findOne(parsedQuery,(err,passport)=>{
      if(err){
        return next(err,false);
      }
      if(!req.user){
        // Scenario: A new user is attempting to sign up using a third-party
        //           authentication provider.
        // Action:   Create a new user and assign them a passport.
        if(!passport){
          switch (provider) {
            case 'local':
              user.firstName=profile.firstName;
              user.lastName=profile.lastName;
              user.userType=profile.userType;
              user.mailVerified=profile.mailVerified;
              //This needs to be added in order to store the user password inside his passport
              query.password=profile.password;
          }
          //Require the user type to create the user
          if(!profile.userType){
            return next(null,false,{message:'no_user_type_provided'});
          }
          sails.models['user'].create(user).meta({fetch:true}).exec(function(err,newUser){
            if(err){
              //Check if there was an error creating the user
              if(err.code==='E_VALIDATION'){
                var info;
                if (err.invalidAttributes.email) {
                  info={message:'user_already_exists'};
                }
                else {
                  info={message:'invalid_user'};
                }
                return next(err,false,info);
              }else{
                return next(err,false);
              }

            }
            query.user=newUser.id;
            Passport.create(query,(err,passport)=>{
              //If a passport wasn't created, bail out
              if (err) {
                return user.destroy(function (destroyErr) {
                  next(destroyErr || err,false);
                });
              }
              next(null,newUser);
            });

          });
        }else{
          // Scenario: An existing user is trying to log in using an already
          //           connected passport.
          // Action:   Get the user associated with the passport.
          // If the tokens have changed since the last session, update them
          if (query.hasOwnProperty('accessToken') && query.accessToken !== passport.accessToken) {
            passport.accessToken = query.accessToken;
          }
          // Save any updates to the Passport before moving on
          sails.models['passport'].update({id:passport.id},{accessToken:passport.accessToken},function (err, passp) {
            if (err) {
              return next(err);
            }

            // Fetch the user associated with the Passport
            sails.models['user'].findOne(passport.user, next);
          });
        }
      }else{
        if(!passport){
          // Scenario: A user is currently logged in and trying to connect a new
          //           passport.
          // Action:   Create and assign a new passport to the user.
          query.user = req.user.id;
          sails.models['passport'].create(query, function (err, passport) {
            // If a passport wasn't created, bail out
            if (err) {
              return next(err);
            }

            next(err, req.user);
          });
        }else{
          // Scenario: The user is a nutjob or spammed the back-button.
          // Action:   Simply pass along the already established session.
          next(null, req.user);
        }


      }
    });
  };
  /**
   * Create an authentication endpoint
   *
   * For more information on authentication in Passport.js, check out:
   * http://passportjs.org/guide/authenticate/
   *
   * @param  {Object} req
   * @param  {Object} res
  */
  api.endpoint=function(req,res){
    var strategies = sails.config.passport,
        provider   = req.param('provider'),
        options    = {};

    // If a provider doesn't exist for this endpoint, send the user back to the
    // login page
    if (!strategies.hasOwnProperty(provider)) {
      return res.redirect('/login');
    }

    // Attach scope if it has been set in the config
    if (strategies[provider].hasOwnProperty('scope')) {
      options.scope = strategies[provider].scope;
    }

    // Use the apropiate strategy for authentication. When complete,
    // the provider will redirect the user back to the application at
    //     /auth/:provider/callback
    this.authenticate(provider, options)(req, res, req.next);
  };

  api.callback=function(req,res,next){
    var provider = req.param('provider'),
        action   = req.param('action');
    if(action === 'disconect' && req.user){
      disconect(req,res,next);
    }else{
      // The provider will redirect the user to this URL after approval. Finish
      // the authentication process by attempting to obtain an access token. If
      // access was granted, the user will be logged in. Otherwise, authentication
      // has failed.
      this.authenticate(provider,next)(req,res,req.next);
    }
  };

  api.loadStrategies=function(){
    var strategies  = sails.config.custom.passport;

    Object.keys(strategies).forEach((key)=>{
        var options = { passReqToCallback: true }, Strategy;
        var protocol = strategies[key].protocol
          , callback = strategies[key].callback;

        if (!callback) {
          callback = 'auth/' + key + '/callback';
        }

        Strategy = strategies[key].strategy;
        // Merge the default options with any options defined in the config. All
        // defaults can be overriden, but I don't see a reason why you'd want to
        // do that.
        _.extend(options, strategies[key].options);

        //options become a simple string when using a custom Strategy
        //defined by passport-custom : https://github.com/mbell8903/passport-custom
        var Strat = new Strategy(protocols[protocol]);
        Strat.name=key;
        this.use(Strat);
    });
  };
  /**
   * Disconnect a passport from a user
   *
   * @param  {Object} req
   * @param  {Object} res
   */
  api.disconnect =function(req, res, next){
    var user     = req.user
      , provider = req.param('provider', 'local')
      , query    = {};

    query.user = user.id;
    query[provider === 'local' ? 'protocol' : 'provider'] = provider;

    sails.models['passport'].findOne(query, function (err, passport) {
      if (err) {
        return next(err);
      }

      sails.models['passport'].destroy(passport.id, function (error) {
        if (err) {
            return next(err);
        }

        next(null, user);
      });
    });
  };

  api.serializeUser(function (user, next) {
    next(null, user.id);
  });

  api.deserializeUser(function (id, next) {
    sails.models['user'].findOne({id:id}, (err,user)=>{
      next(err,user);
    });
  });

  return {
    api:api,
    initialize:function(done){
      this.api.loadStrategies();
      done();
    }
  };


};
