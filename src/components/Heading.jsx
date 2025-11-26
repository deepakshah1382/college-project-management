export default function Heading({ title, description }) {
  return (
    <div>
      <h2 className="text-lg font-medium">{title}</h2>
      {description && (
        <div className="text-muted-foreground text-sm">{description}</div>
      )}
    </div>
  );
}
