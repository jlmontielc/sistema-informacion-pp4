export function Card({ children, header, footer, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {header && <div className="card-header">{header}</div>}
      {header ? <div className="card-body">{children}</div> : children}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
};
