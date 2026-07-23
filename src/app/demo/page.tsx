import type { Metadata } from "next";
import { connection } from "next/server";
import { DemoTour } from "@/app/demo/_components/demo-tour.client";
import { createDemoSnapshot } from "@/app/demo/_lib/demo-data";

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
