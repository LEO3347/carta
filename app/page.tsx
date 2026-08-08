import type { Metadata } from "next";
import Surprise from "./surprise";

export const metadata: Metadata = {
  title: "Una pregunta para ti ✨",
  description: "Un pequeño cuento, hecho especialmente para ti.",
};

export default function Home() {
  return <Surprise />;
}
