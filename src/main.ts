import { io } from 'socket.io-client';
import { initPolyblocks } from './polyblocks';
import './styles/screen.styl';

const socket = io();
const canvas = document.getElementById('htmlCanvas');

if (canvas) {
  initPolyblocks(socket, canvas);
}
