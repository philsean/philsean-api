const path = require('path');
const express = require('express');
const api = express.Router();

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath(path.join(__dirname, '../../public/styles/fonts/Inter.ttf'), 'Inter');
GlobalFonts.registerFromPath(path.join(__dirname, '../../src/public/styles/fonts/Inter-Italic.ttf'), 'InterItalic');

const canvasCache = new Map();
const IMAGE_TTL = 1000 * 60 * 60;

api.post('/', async (req, res) => {
  const imgs = {};
  const shapesHandler = {
    rect: (ctx, { x = 0, y = 0, width = 0, height = 0, color = '#fff', radius = 0 }) => {
      ctx.fillStyle = color;
      if (radius > 0) ctx.fillRect(parseInt(x), parseInt(y), parseInt(width), parseInt(height));
      else {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
      }
    },
    circle: (ctx, { x = 0, y = 0, color = '#fff', radius }) => {
      ctx.beginPath();
      ctx.arc(parseInt(x), parseInt(y), parseInt(radius), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    text: (ctx, { text, x = 0, y = 0, font = '10px Inter', color = '#fff', strokeColor, strokeWidth = 1, textBaseline = 'alphabetic', textAlign = 'left' }) => {
      x = parseInt(x);
      y = parseInt(y);

      ctx.font = font;
      ctx.textBaseline = textBaseline;
      ctx.textAlign = textAlign;

      if (color) {
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      }

      if (strokeColor && strokeWidth > 0) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(text, x, y);
      }
    },
    image: (ctx, { image, x = 0, y = 0, width, height, radius = 0 }) => {
      const img = imgs[image];

      x = parseInt(x);
      y = parseInt(y);
      width = parseInt(width) || img.width;
      height = parseInt(height) || img.height;
      radius = parseInt(radius);

      if (radius) {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.clip();
      }

      ctx.drawImage(img, x, y, width, height);
    }
  };
  let parsedErrors = [];
  let logs = [];

  try {
    let { images, shapes, width, height, color: backgroundColor } = req.body;

    width = parseInt(width);
    height = parseInt(height);

    if (!width || isNaN(width) || !height || isNaN(height)) return res.status(400).json({ message: "The 'width/height' options are either missing or not valid numbers." });

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (backgroundColor) {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    const r = (Math.random() + 1).toString(36).substring(7);

    if (images) {
      if (!Array.isArray(images)) parsedErrors.push("Option 'images' should be an Array.");
      else {
        let imagesLoaded = await Promise.all(
          images.map(async (img, i) => {
            if (!img.name || typeof img.name !== 'string' || !img.link || typeof img.link !== 'string') {
              parsedErrors.push(`'images.${i}' does not have the name and/or link of the image. (name: String | link: String)`);
              return false;
            }

            try {
              imgs[img.name] = await loadImage(img.link);
              return true;
            } catch {
              parsedErrors.push(`'images.${i}' unable to load.`);
              return false;
            }
          })
        );

        imagesLoaded = imagesLoaded.filter(l => l);

        logs.push(`${imagesLoaded.length} images have been uploaded.`);
      }
    }

    if (shapes) {
      if (!Array.isArray(shapes)) parsedErrors.push("Option 'shapes' should be an Array.");
      else {
        let shapesDrew = 0;

        for (let i = 0; i < shapes.length; i++) {
          try {
            const shape = shapes[i];

            if (!shape.name || typeof shape.name !== 'string') {
              parsedErrors.push(`'shapes.${i}.name' is missing or not a valid string.`);
              continue;
            }

            const shapeF = shapesHandler[shape.name];

            if (!shapeF) {
              parsedErrors.push(`The shape '${shape.name}' on 'shapes.${i}' does not exist.`);
              continue;
            }

            ctx.save();
            const angle = shape.rotate || 0;

            if (angle !== 0) {
              let cx = shape.x || 0;
              let cy = shape.y || 0;

              if (shape.name === 'circle') {
                cx = shape.x;
                cy = shape.y;
              } else {
                cx += (shape.width || 0) / 2;
                cy += (shape.height || 0) / 2;
              }

              ctx.translate(cx, cy);
              ctx.rotate(angle);
              ctx.translate(-cx, -cy);
            }

            if (shape.shadowColor && shape.shadowBlur > 0) {
              ctx.shadowColor = shape.shadowColor;
              ctx.shadowBlur = shape.shadowBlur;

              ctx.shadowOffsetX = shape.shadowOffsetX || ctx.shadowOffsetX;
              ctx.shadowOffsetY = shape.shadowOffsetY || ctx.shadowOffsetY;
            }

            if (shape.color && isObject(shape.color)) {
              if (Array.isArray(shape.color.gradient) && shape.color.gradient.length >= 4 && Array.isArray(shape.color.colors) && shape.color.colors.length) {
                const coords = shape.color.gradient.map(g => parseFloat(g));
                if (coords.some(c => !Number.isFinite(c))) {
                  parsedErrors.push(`'shapes.${i}.color.gradient' must contain 4 numeric values: [x0,y0,x1,y1].`);
                } else {
                  const gradient = ctx.createLinearGradient(coords[0], coords[1], coords[2], coords[3]);

                  shape.color.colors.forEach((colorObj, j) => {
                    let off = typeof colorObj.offSet === 'string' ? parseFloat(colorObj.offSet) : colorObj.offSet;
                    if (!Number.isFinite(off)) {
                      parsedErrors.push(`'shapes.${i}.color.colors.${j}.offSet' is invalid or not a number.`);
                      return;
                    }
                    if (off > 1) off = off / 100;
                    off = Math.max(0, Math.min(1, off));

                    const c = colorObj.color || '#fff';
                    gradient.addColorStop(off, c);
                  });

                  shape.color = gradient;
                }
              } else {
                parsedErrors.push(`'shapes.${i}.color.gradient' and/or 'shapes.${i}.color.colors' are invalid. (gradient: Array<Number> | colors: Array<Object>)`);
              }
            }

            let shapeR = shapeF(ctx, shape, r);
            ctx.restore();

            shapesDrew++;
          } catch (err) {
            console.log(err);
            parsedErrors.push(`'shapes.${i}' returned a error: ${err.message}`);
          }
        }

        logs.push(`${shapesDrew} shapes have been drawn.`);
      }
    }

    const buffer = canvas.toBuffer('image/png');

    canvasCache.set(r, buffer);
    setTimeout(() => {
      canvasCache.delete(r);
    }, IMAGE_TTL);

    res.status(200).json({ image: `${req.protocol}://${req.get('host')}/api/v1/canvas/${r}.png`, logs, parsedErrors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while trying to create this image.', error: err.message });
  }
});

api.get('/:id.png', (req, res) => {
  const buffer = canvasCache.get(req.params.id);

  if (!buffer) {
    return res.status(404).json({ message: 'Image expired or not found.' });
  }

  res.set('Content-Type', 'image/png');
  res.end(buffer);
});

api.get('/', (req, res) => res.status(404).json({ message: 'For this endpoint, use the POST method.' }));

function isObject(x) {
  return typeof x === 'object' && !Array.isArray(x) && x !== null;
}
module.exports = api;
