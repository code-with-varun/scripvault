import React, { useEffect, useRef } from 'react';

const NetWorthChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const padding = 50;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const stepX = (width - 2 * padding) / (data.length - 1);
    const scaleY = (height - 2 * padding) / (maxVal - minVal);

    // Draw Axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Line
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (point.value - minVal) * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Dots + Labels
    data.forEach((point, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (point.value - minVal) * scaleY;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#0d9488";
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.fillText(point.month, x - 10, height - padding + 15);
      ctx.fillText(`₹${point.value / 1000}k`, x - 15, y - 10);
    });

  }, [data]);

  return <canvas ref={canvasRef} width={800} height={400} />;
};

export default NetWorthChart;
