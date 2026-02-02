const path = require('path');
const express = require('express');
const api = express.Router();

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath(path.join(__dirname, '../../public/styles/fonts/Inter.ttf'), 'Inter');
GlobalFonts.registerFromPath(path.join(__dirname, '../../public/styles/fonts/Inter-Italic.ttf'), 'InterItalic');

const p_1 = path.resolve(__dirname, '../../public/images/plaquinhas/plaquinha_1.png');
const p_2 = path.resolve(__dirname, '../../public/images/plaquinhas/plaquinha_2.png');

api.get('/1.png', async (req, res) => {
  const { text = '' } = req.query;

  const p = await loadImage(p_1);

  const canvas = createCanvas(p.width, p.height);
  const ctx = canvas.getContext('2d');

  const { width: w, height: h } = canvas;

  ctx.drawImage(p, 0, 0);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '140px Inter';
  ctx.fillStyle = '#000';

  let hm = 140;

  ctx.fillText(text, w / 2, hm);

  const buffer = canvas.toBuffer('image/png');

  res.set('Content-Type', 'image/png');
  res.end(buffer);
});

module.exports = api;
