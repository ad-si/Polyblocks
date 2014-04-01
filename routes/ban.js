exports.bannedIPs = [];


exports.ban = function(req, res, next){
    if (exports.bannedIPs.indexOf(req.ip) > -1){
        res.end('Fuck Off');
    } else {
        next();
    }
};
