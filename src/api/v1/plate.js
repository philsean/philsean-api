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

  ctx.fillStyle = '#000';

  drawText(ctx, {
    text,
    x: w / 2 - 10,
    y: 270,
    maxWidth: 600,
    fontSize: 100
  });

  const buffer = canvas.toBuffer('image/png');

  res.set('Content-Type', 'image/png');
  res.end(buffer);
});

function drawText(ctx, options) {
  const { text, x, y, maxWidth, fontSize, fontFamily = 'Inter', lineHeight = 1.2 } = options;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const words = text.split(' ');
  const lines = [];

  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      continue;
    }

    if (ctx.measureText(word).width > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }

      let charLine = '';

      for (const char of word) {
        const testCharLine = charLine + char;
        if (ctx.measureText(testCharLine).width <= maxWidth) {
          charLine = testCharLine;
        } else {
          lines.push(charLine);
          charLine = char;
        }
      }

      currentLine = charLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  const linePixelHeight = fontSize * lineHeight;
  const totalHeight = lines.length * linePixelHeight;
  let startY = y - totalHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, startY + i * linePixelHeight);
  }
}

module.exports = api;
