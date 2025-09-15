import { useTunerViewModel } from "../../../viewmodels/TunerViewModel";
import TunerDisplay from "../../components/tuner/TunerDisplay/TunerDisplay";
import styles from "./TunerPage.module.css";


export default function TunerPage() {
  const { 
    noteData, 
    isRunning, 
    start, 
    stop,
    tunerMode,
    setTunerMode,
    selectedString,
    setSelectedString
  } = useTunerViewModel();

  return (
    <div className={styles.fullscreen}>
      <TunerDisplay
        noteData={noteData}
        isRunning={isRunning}
        onStart={start}
        onStop={stop}
        tunerMode={tunerMode}
        setTunerMode={setTunerMode}
        selectedString={selectedString}
        setSelectedString={setSelectedString}
      />
    </div>
  );
}
