import type { Metadata } from "next";
import { connection } from "next/server";
import { DemoTour } from "@/features/demo/components/demo-tour.client";
import { createDemoSnapshot } from "@/features/demo/demo-data";

export const metadata: Metadata = {
  title: "Product Demo",
  description:
    "Explore a populated Budget Buddy personal finance dashboard without creating an account.",
};

export default async function DemoPage() {
  await connection();
  const snapshot = createDemoSnapshot();

  return <DemoTour snapshot={snapshot} />;
}
