import { Metadata } from "next";
import { ProjectWorkspaceView } from "@/components/project/project-workspace-view";

export const metadata: Metadata = {
  title: "Workspace Proyek | Doable",
  description: "Kelola milestone sprint, timeline Gantt, proposal freelancer, dan serah terima deliverable proyek.",
};

export default function ClientProjectDetailPage() {
  return <ProjectWorkspaceView />;
}
