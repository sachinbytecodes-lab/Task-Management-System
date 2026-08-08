// Every user gets a distinct, stable avatar color derived from their own id —
// instead of every account rendering the same hardcoded gradient.
const GRADIENTS = [
  "from-fuchsia-500 via-purple-500 to-indigo-600",
  "from-orange-400 via-rose-500 to-pink-600",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-lime-400 via-green-500 to-emerald-600",
  "from-violet-400 via-purple-500 to-fuchsia-600",
  "from-rose-400 via-pink-500 to-fuchsia-600",
];

export function gradientForId(id?: string | null): string {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
