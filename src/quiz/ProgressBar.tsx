interface ProgressBarProps {
  answered: number;
  total: number;
}

export function ProgressBar({ answered, total }: ProgressBarProps) {
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={total}>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__label">
        {answered} / {total}
      </span>
    </div>
  );
}
