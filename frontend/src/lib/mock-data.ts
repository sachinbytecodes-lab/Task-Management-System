import { Member, ProjectItem, TaskItem, Subtask, Comment } from "./types";

export const currentUser: Member = {
  id: "dexter",
  name: "Dexter",
  initials: "D",
  avatarGradient: "from-fuchsia-500 via-purple-500 to-indigo-600",
};

export const members: Member[] = [
  currentUser,
  { id: "admin", name: "Admin", initials: "A", avatarGradient: "from-fuchsia-500 via-purple-500 to-indigo-600" },
  { id: "cn", name: "CN", initials: "CN", avatarGradient: "from-slate-300 to-slate-400" },
  { id: "qa", name: "QA Team", initials: "QA", avatarGradient: "from-emerald-400 to-teal-500" },
  { id: "designer", name: "Designer", initials: "DS", avatarGradient: "from-pink-400 to-rose-500" },
  { id: "security", name: "Security", initials: "SC", avatarGradient: "from-red-400 to-orange-500" },
];

export const tasksByStatus: Record<string, TaskItem[]> = {
  "To Do": [
    { id: "t1", title: "Design Homepage", status: "To Do", priority: "High", member: currentUser, dueDate: "12 Sep 2026", labels: ["Deployment"] },
    { id: "t2", title: "Develop Login Feature", status: "To Do", priority: "Low", member: members[2], dueDate: "15 Sep 2026", labels: ["Deployment"] },
    { id: "t3", title: "Test Payment Gateway", status: "To Do", priority: "Medium", member: null, dueDate: "18 Sep 2026", labels: ["Deployment"] },
  ],
  Doing: [
    { id: "t4", title: "Design Homepage", status: "Doing", priority: "High", member: currentUser, dueDate: "12 Sep 2026", labels: ["Deployment"] },
    { id: "t5", title: "Develop Login Feature", status: "Doing", priority: "Low", member: members[2], dueDate: "15 Sep 2026", labels: ["Deployment"] },
    { id: "t6", title: "Test Payment Gateway", status: "Doing", priority: "Medium", member: null, dueDate: "18 Sep 2026", labels: ["Deployment"] },
  ],
  Completed: [
    { id: "t7", title: "Design Homepage", status: "Completed", priority: "High", member: currentUser, dueDate: "12 Sep 2026", labels: ["Deployment"] },
    { id: "t8", title: "Develop Login Feature", status: "Completed", priority: "Low", member: members[2], dueDate: "15 Sep 2026", labels: ["Deployment"] },
    { id: "t9", title: "Test Payment Gateway", status: "Completed", priority: "Medium", member: null, dueDate: "18 Sep 2026", labels: ["Deployment"] },
  ],
  "On Hold": [
    { id: "t10", title: "UI Review", status: "On Hold", priority: "High", member: members[4], dueDate: "30 Jul", labels: ["Review"] },
    { id: "t11", title: "Backend Sync", status: "On Hold", priority: "Medium", member: members[3], dueDate: "31 Jul", labels: ["Development"] },
    { id: "t12", title: "User Feedback", status: "On Hold", priority: "Low", member: members[4], dueDate: "01 Aug", labels: ["Research"] },
    { id: "t13", title: "Performance Tuning", status: "On Hold", priority: "Medium", member: members[3], dueDate: "02 Aug", labels: ["Optimization"] },
  ],
};

export const projects: ProjectItem[] = [
  { id: "p1", name: "Design Homepage", priority: "High", lead: currentUser, dueDate: "12 Sep 2026" },
  { id: "p2", name: "Develop Login Feature", priority: "Low", lead: members[2], dueDate: "15 Sep 2026" },
  { id: "p3", name: "Test Payment Gateway", priority: "Medium", lead: null, dueDate: "18 Sep 2026" },
];

export const subtasks: Subtask[] = [
  { id: "s1", title: "Subtask 1", priority: "High", member: currentUser, dueDate: "12 Sep 2026" },
  { id: "s2", title: "Subtask 2", priority: "Low", member: members[2], dueDate: "15 Sep 2026" },
  { id: "s3", title: "Subtask 3", priority: "Medium", member: null, dueDate: "18 Sep 2026" },
];

export const comments: Comment[] = [
  { id: "c1", author: { id: "ankit", name: "Ankit Dutta", initials: "AD", avatarGradient: "from-fuchsia-500 via-purple-500 to-indigo-600" }, text: "dsds", postedAt: "just now" },
];

export const taskDetail = {
  id: "write-api-docs",
  title: "Write API Documentation",
  description:
    "Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.",
  assignee: "Designer",
  dueDate: "31 Jul",
  labels: ["Research", "Design", "Development", "Testing", "Deployment"],
  status: "Backlog",
  priority: "High" as const,
};
