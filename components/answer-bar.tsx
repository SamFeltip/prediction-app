export function AnswerBar({
  title,
  size,
  width,
}: {
  title: string;
  size: "sm" | "md";
  width: number;
}) {
  if (width > 1 || width < 0) {
    throw new Error(
      "invalid prop: AnswerBar width should be a decimal between 0 and 1"
    );
  }

  const titleClasses = {
    sm: "text-sm font-medium",
    md: "text-2xl font-bold",
  };

  const bodyStyles = {
    sm: "h-2 overflow-hidden rounded-full bg-secondary",
    md: "h-3 overflow-hidden rounded-full bg-secondary",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={titleClasses[size]}>{title}</span>
      </div>
      <div className={bodyStyles[size]}>
        <div
          className="h-full bg-accent transition-all"
          style={{
            width: `${100 * width}%`,
          }}
        />
      </div>
    </div>
  );
}
