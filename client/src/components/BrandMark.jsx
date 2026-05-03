export default function BrandMark({ compact = false }) {
  return (
    <div className={`brand-mark ${compact ? "brand-mark-compact" : ""}`} aria-label="NB logo">
      <span className="brand-mark-letter">N</span>
      <span className="brand-mark-slice" />
      <span className="brand-mark-letter accent-letter">B</span>
    </div>
  );
}
