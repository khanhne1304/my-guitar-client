import SongHeader from "../../components/song/songHeader/songHeader";
import SongContent from "../../components/song/songContent/SongContent";
import { useSongsPageViewModel } from "../../../viewmodels/SongsPageViewModel";

export default function SongsPage({ items }) {
  const { state, actions } = useSongsPageViewModel(items);
  const { loading, error, filtered, q } = state;
  const { setQ } = actions;

  return (
    <>
      <SongHeader q={q} setQ={setQ} />
      <SongContent loading={loading} error={error} filtered={filtered} />
    </>
  );
}
