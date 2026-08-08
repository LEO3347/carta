import type { Metadata } from "next";
import Surprise from "./surprise";

export const metadata: Metadata = {
  title: "Una pregunta para ti ✨",
  description: "Un pequeño cuento, hecho especialmente para ti.",
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.scene) ? params.scene[0] : params.scene;
  const initialScene = requested === "letter" ? "letter" : "intro";
  return <Surprise initialScene={initialScene} />;
}
