export function Input({
  label,
  name,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={`field-input ${error ? 'field-input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
