import styles from "./Header.module.css";

export default function SearchBox({
  keyword,
  setKeyword,
  submitSearch,
}) {
  return (
    <div className={styles.home__searchBox}>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
      />
      <button onClick={submitSearch}>Tìm</button>
    </div>
  );
}
