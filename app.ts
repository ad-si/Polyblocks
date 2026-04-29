import express from 'express';
import http from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server as SocketIOServer } from 'socket.io';
import * as polyblocks from './routes/polyblocks';
import * as ban from './routes/ban';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const port = Number(process.env.PORT) || 9014;
const isDev = process.env.NODE_ENV !== 'production';

app.set('port', port);
app.use(ban.ban);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.all('/reset', polyblocks.reset);

if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
        root: path.join(__dirname, 'src'),
        publicDir: path.join(__dirname, 'public'),
        server: { middlewareMode: true },
        appType: 'spa',
    });
    app.use(vite.middlewares);
} else {
    app.use(express.static(path.join(__dirname, 'dist', 'public')));
}

polyblocks.init(io);

server.listen(port, () => {
    console.log(`Polyblocks server listening on http://localhost:${port}`);
});
