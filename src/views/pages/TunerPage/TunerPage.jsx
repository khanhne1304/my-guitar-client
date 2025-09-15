import { useNavigate } from "react-router-dom";
import Header from "../../components/homeItem/Header/Header";
import { useTunerViewModel } from "../../../viewmodels/TunerViewModel";
import TunerDisplay from "../../components/tuner/TunerDisplay/TunerDisplay";
import styles from "./TunerPage.module.css";

export default function TunerPage() {
  const navigate = useNavigate();

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
    <>
      <Header />
      <main className={styles.fullscreen}>
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
      </main>
    </>
  );
}
