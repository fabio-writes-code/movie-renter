
//TODO:Checks the admin role of the user to access genres delete

module.exports=function (req,res,next){
    if (!req.user.isAdmin) return res.status(403).send('Access Denied') //*1
    next(); 
}
