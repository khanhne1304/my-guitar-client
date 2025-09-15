import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Header.module.css";
import { productService } from "../../../../services/productService";

export default function SearchBox({
  keyword,
  setKeyword,
  submitSearch,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const boxRef = useRef(null);
  const controllerRef = useRef(null);

  const q = useMemo(() => keyword.trim(), [keyword]);

  useEffect(() => {
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      setHighlightIndex(-1);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        controllerRef.current?.abort?.();
        controllerRef.current = new AbortController();
        setLoading(true);
        const items = await productService.list({ q, limit: 8, signal: controllerRef.current.signal });
        setSuggestions(items.slice(0, 8));
        setOpen(items.length > 0);
        setHighlightIndex(-1);
      } catch (_) {
        // ignore abort or errors
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && highlightIndex >= 0 && suggestions[highlightIndex]) {
        // navigate to product detail
        window.location.href = `/products/${suggestions[highlightIndex].slug}`;
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.home__searchBox} ref={boxRef}>
      <div className={styles.searchWrap}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length && setOpen(true)}
        />
        <button onClick={submitSearch}>Tìm</button>
        {open && (
          <div className={styles.suggestPanel}>
            {loading && <div className={styles.suggestItemMuted}>Đang tải…</div>}
            {!loading && suggestions.length === 0 && (
              <div className={styles.suggestItemMuted}>Không có gợi ý</div>
            )}
            {!loading && suggestions.map((p, idx) => (
              <a
                key={p.slug || p.id || idx}
                href={`/products/${p.slug}`}
                className={idx === highlightIndex ? styles.suggestItemActive : styles.suggestItem}
                onMouseEnter={() => setHighlightIndex(idx)}
              >
                <img src={p.image} alt={p.imageAlt || p.name} className={styles.suggestThumb} />
                <span className={styles.suggestText}>{p.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
