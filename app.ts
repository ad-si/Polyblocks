import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import * as polyblocks from './routes/polyblocks';
import * as ban from './routes/ban';
import stylus from 'stylus';
import nib from 'nib';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const devMode = (app.get('env') === 'development');

function compile(str: string, path: string) {
    return stylus(str)
        .set('filename', path)
        .set('compress', !devMode)
        .use(nib())
        .import('nib');
}

// all environments
app.set('port', process.env.PORT || 9014);
app.use(ban.ban);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: compile
}));
app.all('/reset', polyblocks.reset);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/vendor/mousetrap', express.static(path.join(__dirname, 'node_modules/mousetrap')));
app.use('/vendor/hammerjs', express.static(path.join(__dirname, 'node_modules/hammerjs')));

polyblocks.init(io);

server.listen(app.get('port'), function () {
    console.log(
        `Polyblocks server listening on http://localhost:${app.get('port')}`
    );
});