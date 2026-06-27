import Header from "../../components/homeItem/Header/Header";
import Footer from "../../components/homeItem/Footer/Footer";

export const LAST_UPDATED = "27/06/2026";
export const CONTACT_EMAIL = "chikhanhphanle@gmail.com";
export const HOTLINE = "1800 9876";

export const styles = {
  wrap: {
    maxWidth: 880,
    margin: "0 auto",
    padding: "32px 20px 64px",
    lineHeight: 1.7,
    color: "#1f2937",
  },
  h1: { fontSize: 32, fontWeight: 800, marginBottom: 8 },
  meta: { color: "#6b7280", marginBottom: 28 },
  h2: { fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 },
  p: { marginBottom: 12 },
  ul: { marginBottom: 12, paddingLeft: 22 },
};

export default function PolicyLayout({ title, intro, children }) {
  return (
    <div>
      <Header />
      <main style={styles.wrap}>
        <h1 style={styles.h1}>{title}</h1>
        <p style={styles.meta}>Cập nhật lần cuối: {LAST_UPDATED}</p>
        {intro ? <p style={styles.p}>{intro}</p> : null}
        {children}
      </main>
      <Footer />
    </div>
  );
}
