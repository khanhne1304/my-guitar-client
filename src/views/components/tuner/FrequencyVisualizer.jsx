import { useEffect, useRef } from "react";

export default function FrequencyVisualizer({ frequency }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "#0f0";
    const barWidth = Math.min((frequency / 500) * canvasRef.current.width, canvasRef.current.width);
    ctx.fillRect(0, 0, barWidth, canvasRef.current.height);
  }, [frequency]);

  return <canvas ref={canvasRef} width={200} height={10} style={{ marginTop: "0.5rem" }} />;
}
