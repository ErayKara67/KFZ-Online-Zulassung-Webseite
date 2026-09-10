"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui";

export function Abmelden() {
  const router = useRouter();

  async function abmelden() {
    await fetch("/api/haendler/anmelden", { method: "DELETE" });
    router.push("/haendler");
    router.refresh();
  }

  return (
    <Button variant="secondary" size="lg" onClick={() => void abmelden()}>
      Abmelden
    </Button>
  );
}
