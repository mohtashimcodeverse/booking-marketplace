import { redirect } from "next/navigation";

export default async function AccountBookingDetailsRedirect(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  redirect(`/account/bookings?focus=${encodeURIComponent(id)}`);
}
