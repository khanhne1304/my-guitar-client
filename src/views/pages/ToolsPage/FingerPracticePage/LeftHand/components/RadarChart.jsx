import { useEffect, useRef } from "react";
import styles from "./RadarChart.module.css";

export default function RadarChart({ scores }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Categories
    const categories = [
      { name: "Timing", value: scores.timingScore },
      { name: "Clarity", value: scores.clarityScore },
      { name: "Speed", value: scores.speedScore },
      { name: "Consistency", value: scores.consistency }
    ];
    
    const numCategories = categories.length;
    const angleStep = (2 * Math.PI) / numCategories;
    
    // Draw grid circles
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i < numCategories; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // Draw data polygon
    ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = category.value;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = "#ffd700";
    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = category.value;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      ctx.fillText(category.name, x, y);
    });
  }, [scores]);
  
  return (
    <div className={styles.radarChart}>
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
}

