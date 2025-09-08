import { useState } from "react";
import { toneChords } from "../data/toneChords";

export default function useChordsViewModel() {
  const [instrument, setInstrument] = useState("Guitar");
  const [selectedTone, setSelectedTone] = useState("C / Am");

  const chords = toneChords[selectedTone] || [];

  return {
    instrument,
    setInstrument,
    selectedTone,
    setSelectedTone,
    chords,
    toneOptions: Object.keys(toneChords),
  };
}
