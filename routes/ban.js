var bannedIPs = ['101.98.152.51','10.209.142.246']


exports.ban = function(req, res, next){
    if (bannedIPs.indexOf(req.ip) > -1){
        res.end('Fuck Off')
    } else {
        next()
    }
}


