import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Header.module.css";
import { productService } from "../../../../services/productService";

export default function SearchBox({ keyword, setKeyword, submitSearch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);

  const debouncedKeyword = useDebounce(keyword, 200);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const q = (debouncedKeyword || "").trim();
      if (!q) {
        setSuggestions([]);
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
      try {
        const items = await productService.suggest(q, { limit: 8 });
        if (!cancelled) {
          setSuggestions(items);
          setOpen(items.length > 0);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setOpen(false);
          setActiveIndex(-1);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedKeyword]);

  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onKeyDown = (e) => {
    if (!open && e.key !== "Enter") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < suggestions.length) {
        const s = suggestions[activeIndex];
        // Điều hướng tới trang sản phẩm theo slug
        window.location.href = `/products?q=${encodeURIComponent(s.name)}`;
      } else {
        submitSearch();
      }
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.home__searchBox} ref={boxRef}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length && setOpen(true)}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggest-list"
        />
        {open && suggestions.length > 0 && (
          <ul id="search-suggest-list" className={styles.searchSuggest} role="listbox">
            {suggestions.map((s, idx) => (
              <li
                key={`${s.slug}-${idx}`}
                role="option"
                aria-selected={idx === activeIndex}
                className={idx === activeIndex ? styles.activeSuggestItem : styles.suggestItem}
                onMouseDown={(e) => {
                  e.preventDefault();
                  window.location.href = `/products?q=${encodeURIComponent(s.name)}`;
                }}
              >
                {s.image ? (
                  <img src={s.image} alt={s.name} width={28} height={28} style={{ objectFit: "cover", borderRadius: 4, marginRight: 8 }} />
                ) : null}
                <span>{s.name}</span>
                {s.category ? <em style={{ marginLeft: 6, opacity: 0.7 }}>({s.category})</em> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={submitSearch}>Tìm</button>
    </div>
  );
}

function useDebounce(value, delayMs) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}
