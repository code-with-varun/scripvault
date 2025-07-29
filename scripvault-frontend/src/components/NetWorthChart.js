import React, { useEffect, useRef } from 'react';

const NetWorthChart = ({ data }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null); // Ref for the parent container to observe its size

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Function to draw the chart
    const drawChart = () => {
      if (!data || data.length === 0) {
        // Clear canvas and return if no data
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Set canvas drawing buffer size to match its display size
      // This is crucial for crisp rendering on high-DPI screens and responsiveness
      const dpr = window.devicePixelRatio || 1; // Get device pixel ratio
      const rect = canvas.getBoundingClientRect(); // Get actual display size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr); // Scale context to match device pixel ratio

      const padding = 50;
      const width = rect.width; // Use display width for calculations
      const height = rect.height; // Use display height for calculations

      ctx.clearRect(0, 0, width, height); // Clear the canvas before redrawing

      const values = data.map(d => d.value);
      const maxVal = Math.max(...values);
      const minVal = Math.min(...values);

      // Adjust minVal and maxVal for better visual scaling if all values are close
      const range = maxVal - minVal;
      const effectiveMinVal = minVal - range * 0.1; // 10% buffer below min
      const effectiveMaxVal = maxVal + range * 0.1; // 10% buffer above max

      const stepX = (width - 2 * padding) / (data.length - 1);
      const scaleY = (height - 2 * padding) / (effectiveMaxVal - effectiveMinVal);

      // --- Draw Axes ---
      ctx.beginPath();
      ctx.moveTo(padding, padding); // Top-left of chart area
      ctx.lineTo(padding, height - padding); // Bottom-left of chart area (Y-axis)
      ctx.lineTo(width - padding, height - padding); // Bottom-right of chart area (X-axis)
      ctx.strokeStyle = "#e0e0e0"; // Lighter grey for axes
      ctx.lineWidth = 1;
      ctx.stroke();

      // --- Draw X-Axis Labels (Months) ---
      ctx.fillStyle = "#777"; // Grey for labels
      ctx.font = "12px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      data.forEach((point, i) => {
        const x = padding + i * stepX;
        ctx.fillText(point.month, x, height - padding + 10);
      });

      // --- Draw Y-Axis Labels (Values) ---
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      // Determine number of ticks and spacing
      const numYLabels = 5; // Example: 5 labels
      for (let i = 0; i <= numYLabels; i++) {
        const value = effectiveMinVal + (i / numYLabels) * (effectiveMaxVal - effectiveMinVal);
        const y = height - padding - ((value - effectiveMinVal) * scaleY);
        ctx.fillText(`₹${(value / 1000).toFixed(0)}K`, padding - 10, y); // Format as ₹Xk
      }

      // --- Draw Line ---
      ctx.beginPath();
      data.forEach((point, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (point.value - effectiveMinVal) * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#FF7F27"; // Orange for the line, matching theme
      ctx.lineWidth = 3; // Thicker line
      ctx.stroke();

      // --- Draw Dots ---
      data.forEach((point, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (point.value - effectiveMinVal) * scaleY;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI); // Larger dots
        ctx.fillStyle = "#FF7F27"; // Orange dots
        ctx.fill();
        ctx.strokeStyle = "#fff"; // White border around dots
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    // --- Responsiveness ---
    // Use ResizeObserver for more efficient and robust responsiveness
    const observer = new ResizeObserver(entries => {
      // Only redraw if the canvas's content box size has changed
      if (entries[0].contentRect.width !== canvas.width / window.devicePixelRatio ||
          entries[0].contentRect.height !== canvas.height / window.devicePixelRatio) {
        drawChart();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Initial draw
    drawChart();

    // Cleanup observer on component unmount
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [data]); // Redraw when data changes

  return (
    <div ref={containerRef} style={styles.chartContainerWrapper}>
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
};

const styles = {
  chartContainerWrapper: {
    width: '100%', // Take full width of parent
    height: '100%', // Take full height of parent (from Dashboard.js's chartContainer)
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // This wrapper ensures the canvas can grow/shrink with its parent,
    // and the canvas itself will then adjust its internal drawing buffer.
  },
  canvas: {
    display: 'block', // Remove extra space below canvas
    width: '100%', // Canvas display size will fill its wrapper
    height: '100%', // Canvas display size will fill its wrapper
  },
};

export default NetWorthChart;
