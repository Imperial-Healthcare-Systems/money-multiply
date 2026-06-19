import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Marketplace from "@/components/Marketplace";
import HowItWorks from "@/components/HowItWorks";
import WhyInvest from "@/components/WhyInvest";
import StatsBand from "@/components/StatsBand";
import About from "@/components/About";
import SiteFooter from "@/components/SiteFooter";
import Fab from "@/components/Fab";
import InvestModal from "@/components/InvestModal";
import AdminModal from "@/components/AdminModal";
import Toast from "@/components/Toast";
import Effects from "@/components/Effects";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <Marketplace />
        <HowItWorks />
        <WhyInvest />
        <StatsBand />
        <About />
      </main>
      <SiteFooter />
      <Fab />
      <InvestModal />
      <AdminModal />
      <Toast />
      <Effects />
    </>
  );
}
