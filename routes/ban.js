exports.bannedIPs = ['101.98.152.51','10.209.142.246','10.65.17.122'];


exports.ban = function(req, res, next){
    if (exports.bannedIPs.indexOf(req.ip) > -1){
        res.end('Fuck Off');
    } else {
        next();
    }
};
