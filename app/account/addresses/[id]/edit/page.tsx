import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditAddressForm from "@/components/EditAddressForm";

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: address, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !address) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-8 text-4xl font-bold">
        Edit Address
      </h1>

      <EditAddressForm address={address} />
    </main>
  );
}