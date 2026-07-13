export function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 48, lineHeight: 1 }}>{icon}</div>
      {title && <h3 style={{ color: 'var(--color-text)' }}>{title}</h3>}
      {description && <p>{description}</p>}
      {action && action}
    </div>
  );
}
