import { redirect } from "next/navigation";
import { session } from "@/lib/session";

export default async function Home() {
  const { user } = await session();
  redirect(user.roles.includes("manager") ? "/approvals" : "/claims");
}
