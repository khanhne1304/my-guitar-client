import { useParams } from "react-router-dom";
import { useSongDetailsVM } from "../../../viewmodels/SongDetailsViewModel";
import styles from "./SongDetails.module.css";
import SongHeader from "../../components/song/songDetails/SongHeader";
import LyricsViewer from "../../components/song/songDetails/LyricsViewer";
import ChordList from "../../components/song/songDetails/ChordList";
import RelatedSongs from "../../components/song/songDetails/RelatedSongs";
import RatingsSection from "../../components/song/songDetails/RatingsSection";

export default function SongDetails() {
  const { slug } = useParams();
  const { state, actions } = useSongDetailsVM(slug);

  const { song, loading, error, ratings, newRating, uniqueChords, relatedSongs } = state;
  const { setNewRating, handleSubmitRating } = actions;

  if (loading) return <div className={styles.state}>Đang tải…</div>;
  if (error) return <div className={styles.stateError}>{error}</div>;
  if (!song) return <div className={styles.state}>Không tìm thấy bài hát</div>;

  return (
    <div className={styles["song-details"]}>
      <SongHeader song={song} />
      <LyricsViewer lyrics={song.lyrics} />
      <ChordList chords={uniqueChords} />
      <RelatedSongs relatedSongs={relatedSongs} artist={song.artists.join(", ")} />
      <RatingsSection
        ratings={ratings}
        newRating={newRating}
        setNewRating={setNewRating}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}
