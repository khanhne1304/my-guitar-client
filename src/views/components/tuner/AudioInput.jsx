export default function AudioInput({ isRunning, start, stop, rms }) {
  return (
    <div style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
      {!isRunning ? (
        <button onClick={start}>🎤 Start microphone</button>
      ) : (
        <button onClick={stop}>⏹ Stop</button>
      )}
      <small>RMS: {rms.toFixed(4)}</small>
    </div>
  );
}
