import { notFound } from "next/navigation";
import { BookReader } from "@/components/BookReader";
import { getWorkById } from "@/data/repositories";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkReadPage({ params }: PageProps) {
  const { id } = await params;
  const work = getWorkById(id);

  if (!work) {
    notFound();
  }

  return <BookReader work={work} />;
}
