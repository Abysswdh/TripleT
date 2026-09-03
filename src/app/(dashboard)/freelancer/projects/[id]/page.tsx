import { Metadata } from "next";
import { ProjectWorkspaceView } from "@/components/project/project-workspace-view";

export const metadata: Metadata = {
  title: "Workspace Pengerjaan Proyek | Doable",
  description: "Kelola milestone sprint, penyerahan deliverable, timeline Gantt, dan diskusi proyek dengan klien.",
};

export default function FreelancerProjectDetailPage() {
  return <ProjectWorkspaceView />;
}
