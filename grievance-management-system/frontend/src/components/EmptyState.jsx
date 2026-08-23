export default function EmptyState({ title, description, icon }) {
  return (
    <div className="empty-state">
      {icon || (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12h6M9 16h6M9 8h2M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
