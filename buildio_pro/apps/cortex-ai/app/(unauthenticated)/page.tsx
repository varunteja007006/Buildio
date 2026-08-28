import { redirect } from "next/navigation";

export default function Home() {
  // Proxy handles auth checks; this is a catch-all redirect
  redirect("/dashboard");
}
