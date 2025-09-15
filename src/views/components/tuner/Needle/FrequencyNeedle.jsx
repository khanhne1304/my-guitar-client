import styles from "./Needle.module.css";

export default function FrequencyNeedle({ cents }) {
  const rotation = Math.max(-45, Math.min(45, cents));
  return (
    <div className={styles.wrapper}>
      <div className={styles.needle} style={{ transform: `rotate(${rotation}deg)` }} />
    </div>
  );
}
