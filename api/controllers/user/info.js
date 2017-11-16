module.exports=function(req,res){
  User.findOne(req.user.id).exec((err,user)=>{
    if(err){return res.serverError('Database problem');}
    if(!user){return res.forbidden();}
    res.json(user);
  });
};
