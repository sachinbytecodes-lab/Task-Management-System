import { Member } from "@/lib/types";

export default function Avatar({ member, size = 28 }: { member?: Member | null; size?: number }) {
  if (!member) {
    return (
      <div
        className="rounded-full border border-dashed flex items-center justify-center text-neutral-400"
        style={{ width: size, height: size, borderColor: "var(--border)" }}
      >
        +
      </div>
    );
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-white font-medium`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={member.name}
    >
      {member.initials.length <= 2 ? member.initials : member.initials[0]}
    </div>
  );
}
