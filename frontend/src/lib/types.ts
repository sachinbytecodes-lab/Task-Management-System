export type Priority = "No Priority" | "Urgent" | "High" | "Medium" | "Low";
export type Status = "To Do" | "Doing" | "Completed" | "On Hold";

export interface Member {
  id: string;
  name: string;
  initials: string;
  avatarGradient: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  member?: Member | null;
  reporter?: Member | null;
  dueDate: string;
  labels: string[];
  teams?: string[];
  projectId?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  status?: Status;
  priority: Priority;
  lead?: Member | null;
  members?: Member[];
  reporter?: Member | null;
  teams?: string[];
  labels?: string[];
  dueDate: string;
}

export interface Subtask {
  id: string;
  title: string;
  priority: Priority;
  member?: Member | null;
  dueDate: string;
}

export interface Comment {
  id: string;
  author: Member;
  text: string;
  postedAt: string;
}
