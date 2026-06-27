import type { Metadata } from "next";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import Fab from "@/components/Fab";
import InvestModal from "@/components/InvestModal";
import AdminModal from "@/components/AdminModal";
import AssociateModal from "@/components/AssociateModal";
import Toast from "@/components/Toast";
import Effects from "@/components/Effects";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Money Multiply",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main>
        <DashboardClient />
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
