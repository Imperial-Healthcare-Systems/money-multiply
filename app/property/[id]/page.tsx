import type { Metadata } from "next";
import { SEED } from "@/lib/data";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import Fab from "@/components/Fab";
import InvestModal from "@/components/InvestModal";
import AdminModal from "@/components/AdminModal";
import AssociateModal from "@/components/AssociateModal";
import Toast from "@/components/Toast";
import Effects from "@/components/Effects";
import ProductDetail from "@/components/property/ProductDetail";

export function generateStaticParams() {
  return SEED.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const l = SEED.find((x) => x.id === id);
  if (!l) return { title: "Opportunity — Money Multiply" };
  return {
    title: `${l.title} — Money Multiply`,
    description: l.desc?.slice(0, 160),
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header />
      <main>
        <ProductDetail id={id} />
      </main>
      <SiteFooter />
      <Fab />
      <InvestModal />
      <AdminModal />
      <AssociateModal />
      <Toast />
      <Effects />
    </>
  );
}
