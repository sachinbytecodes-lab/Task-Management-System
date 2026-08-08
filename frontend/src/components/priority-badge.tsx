import { Priority } from "@/lib/types";

const COLORS: Record<Priority, string> = {
  "No Priority": "#a3a3a3",
  Urgent: "#dc2626",
  High: "#ea580c",
  Medium: "#d97706",
  Low: "#a3a3a3",
};

function Bars({ color, filled }: { color: string; filled: number }) {
  const heights = [4, 7, 10];
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" className="shrink-0">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 5}
          y={10 - h}
          width="3"
          height={h}
          rx="1"
          fill={i < filled ? color : "#d4d4d4"}
        />
      ))}
    </svg>
  );
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "No Priority") {
    return <span className="inline-flex items-center gap-1.5 text-sm text-neutral-400">. No Priority</span>;
  }
  const filled = priority === "Urgent" ? 3 : priority === "High" ? 3 : priority === "Medium" ? 2 : 1;
  const color = COLORS[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
      <Bars color={color} filled={filled} />
      {priority}
    </span>
  );
}
