import { createFileRoute } from "@tanstack/react-router";
import { NoticeBoard } from "@/components/NoticeBoard";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices — Daham Lanka (PVT) LTD" },
      {
        name: "description",
        content: "Important notices and announcements from Daham Lanka (PVT) LTD.",
      },
    ],
  }),
  component: NoticesPage,
});

function NoticesPage() {
  return (
    <div className="py-6">
      <NoticeBoard />
    </div>
  );
}