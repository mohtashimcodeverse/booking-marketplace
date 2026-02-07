import { redirect } from "next/navigation";

export default function AdminReviewQueuePropertyDetailPage() {
  // We use the list page + drawer. This route is kept only for backwards links.
  redirect("/admin/review-queue");
}
