import { Request, Response, NextFunction } from 'express';

export const bannedIPs: string[] = [];

export const ban = (req: Request, res: Response, next: NextFunction): void => {
    if (bannedIPs.indexOf(req.ip || '') > -1) {
        res.end('Fuck Off');
    } else {
        next();
    }
};