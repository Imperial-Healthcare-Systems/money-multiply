import { SECTION_IMAGES } from "@/lib/data";
import Counter from "./Counter";

export default function StatsBand() {
  return (
    <section className="band" id="stats">
      <div className="wrap">
        <div className="reveal left">
          <span className="eyebrow">Global Stats</span>
          <h3>
            Real assets. <em>Real demand.</em> Measured in the open.
          </h3>
          <p>
            Our marketplace aggregates institutional-grade land across India&apos;s fastest-growing
            corridors into instruments retail investors can finally reach.
          </p>
          <div className="hero-stats" style={{ marginTop: "30px" }}>
            <div className="hstat">
              <Counter className="n" to={4200} prefix="₹" suffix=" Cr+" />
              <div className="l">Asset Value Mapped</div>
            </div>
            <div className="hstat">
              <Counter className="n" to={11400} suffix="+" />
              <div className="l">Investors</div>
            </div>
            <div className="hstat">
              <Counter className="n" to={6} />
              <div className="l">Live Projects</div>
            </div>
          </div>
        </div>
        <div
          className="split-media reveal right magnet"
          style={{ aspectRatio: "3/2", maxWidth: "560px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SECTION_IMAGES.statsMap} alt="India growth corridors map" />
        </div>
      </div>
    </section>
  );
}
