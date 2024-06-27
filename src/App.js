import React, { useState, useEffect, useRef, useCallback } from 'react';

const InteractiveAnimatedEmojiFractalGenerator = () => {
  const canvasRef = useRef(null);
  const [emojis, setEmojis] = useState('🌳,🌸,🍄');
  const [fractals, setFractals] = useState(5);
  const [depth, setDepth] = useState(8);
  const [animate, setAnimate] = useState(false);
  const [debug, setDebug] = useState(false);
  const [useEmojis, setUseEmojis] = useState(true);
  const [fractalPoints, setFractalPoints] = useState([]);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA'];

  const drawEmoji = useCallback((ctx, emoji, x, y, size) => {
    ctx.font = `${size}px Arial`;
    ctx.fillText(emoji, x, y);
  }, []);

  const drawShape = useCallback((ctx, x, y, size, colorIndex) => {
    ctx.fillStyle = colors[colorIndex];
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawFractal = useCallback((ctx, x, y, size, angle, depth, emojiOrColorIndex, currentDepth = 0) => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (depth === currentDepth) {
          resolve();
          return;
        }

        const radians = angle * Math.PI / 180;
        const newX = x + size * Math.cos(radians);
        const newY = y - size * Math.sin(radians);

        if (useEmojis) {
          drawEmoji(ctx, emojis.split(',')[emojiOrColorIndex], x, y, size);
        } else {
          drawShape(ctx, x, y, size, emojiOrColorIndex);
        }

        if (debug) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(newX, newY);
          ctx.stroke();
        }

        const newAngle = Math.random() * 50 + 10;
        const newScale = Math.random() * 0.2 + 0.7;

        Promise.all([
          drawFractal(ctx, newX, newY, size * newScale, angle - newAngle, depth, 
                      (emojiOrColorIndex + 1) % (useEmojis ? emojis.split(',').length : colors.length), currentDepth + 1),
          drawFractal(ctx, newX, newY, size * newScale, angle + newAngle, depth, 
                      (emojiOrColorIndex + 2) % (useEmojis ? emojis.split(',').length : colors.length), currentDepth + 1)
        ]).then(resolve);
      }, 50);
    });
  }, [emojis, useEmojis, debug, drawEmoji, drawShape]);

  const generateFractals = useCallback((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    const promises = fractalPoints.map((point, i) => {
      const emojiOrColorIndex = i % (useEmojis ? emojis.split(',').length : colors.length);
      return drawFractal(ctx, point.x, point.y, 60, point.angle, depth, emojiOrColorIndex);
    });

    Promise.all(promises).then(() => {
      if (debug) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Input: ${emojis}, Fractals: ${fractalPoints.length}, Depth: ${depth}`, width/2, 30);
      }
      if (animate) {
        requestAnimationFrame(() => generateFractals(ctx, width, height));
      }
    });
  }, [fractalPoints, emojis, depth, animate, debug, useEmojis, drawFractal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Initialize fractal points if empty
    if (fractalPoints.length === 0) {
      const initialPoints = Array.from({length: fractals}, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        angle: Math.random() * 360
      }));
      setFractalPoints(initialPoints);
    }

    generateFractals(ctx, width, height);
  }, [fractalPoints, generateFractals, fractals]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newPoint = { x, y, angle: Math.random() * 360 };
    setFractalPoints(prevPoints => [...prevPoints, newPoint]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Interactive Animated Emoji Fractal Generator</h1>
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border-4 border-purple-500 rounded-lg shadow-lg mb-8 cursor-pointer"
        onClick={handleCanvasClick}
      />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="emojis">
            Emojis or Colors (comma-separated):
          </label>
          <input
            id="emojis"
            type="text"
            value={emojis}
            onChange={(e) => setEmojis(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="depth">
            Depth: {depth}
          </label>
          <input
            id="depth"
            type="range"
            min="1"
            max="12"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-center">
          <input
            id="animate"
            type="checkbox"
            checked={animate}
            onChange={(e) => setAnimate(e.target.checked)}
            className="mr-2"
          />
          <label className="text-white text-sm font-bold mr-4" htmlFor="animate">
            Animate
          </label>
          <input
            id="debug"
            type="checkbox"
            checked={debug}
            onChange={(e) => setDebug(e.target.checked)}
            className="mr-2"
          />
          <label className="text-white text-sm font-bold mr-4" htmlFor="debug">
            Debug
          </label>
          <input
            id="useEmojis"
            type="checkbox"
            checked={useEmojis}
            onChange={(e) => setUseEmojis(e.target.checked)}
            className="mr-2"
          />
          <label className="text-white text-sm font-bold" htmlFor="useEmojis">
            Use Emojis
          </label>
        </div>
        <button
          onClick={() => setFractalPoints([])}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Clear All Fractals
        </button>
      </div>
    </div>
  );
};

export default InteractiveAnimatedEmojiFractalGenerator;