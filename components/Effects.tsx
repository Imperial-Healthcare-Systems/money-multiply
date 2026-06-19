"use client";

import { useEffect } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";

export default function Effects() {
  const { closeModal } = useMarketplace();

  /* Escape closes modals */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-stagger");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const t = en.target as HTMLElement;
          if (t.classList.contains("reveal-stagger")) {
            Array.prototype.forEach.call(t.children, (k: HTMLElement, i: number) => {
              k.style.transitionDelay = i * 70 + "ms";
            });
          }
          t.classList.add("in");
          io.unobserve(t);
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  /* luxury custom cursor */
  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const dot = document.getElementById("curDot");
    const ring = document.getElementById("curRing");
    if (!dot || !ring) return;
    document.body.classList.add("cur-on");
    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2,
      rx = mx,
      ry = my,
      raf = 0;
    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    const hoverSel =
      "a,button,.card,[data-invest],.filt,.curr,.iconbtn,.lead-tag,.metric,.tab,.foot-soc a,.pchip,input,select,textarea";
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,select")) {
        document.body.classList.add("cur-text");
        document.body.classList.remove("cur-hover");
      } else if (t.closest(hoverSel)) {
        document.body.classList.add("cur-hover");
        document.body.classList.remove("cur-text");
      }
    };
    const out = (e: MouseEvent) => {
      const rt = e.relatedTarget as HTMLElement | null;
      if (!rt || !rt.closest(hoverSel)) document.body.classList.remove("cur-hover", "cur-text");
    };
    const down = () => document.body.classList.add("cur-down");
    const up = () => document.body.classList.remove("cur-down");
    const leave = () => {
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };
    const enter = () => {
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    };
    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("cur-on", "cur-hover", "cur-text", "cur-down");
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  /* 3D tilt + sheen on [data-tilt] cards (event delegation) */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const move = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -7;
      const ry = (px - 0.5) * 9;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-7px)`;
      const sh = card.querySelector<HTMLElement>(".sheen");
      if (sh) {
        sh.style.setProperty("--mx", px * 100 + "%");
        sh.style.setProperty("--my", py * 100 + "%");
      }
    };
    const out = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
      const rt = e.relatedTarget as HTMLElement | null;
      if (card && (!rt || !card.contains(rt))) card.style.transform = "";
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseout", out);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  /* magnetic elements */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".magnet"));
    const cleanups: (() => void)[] = [];
    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.12;
        const y = (e.clientY - r.top - r.height / 2) * 0.12;
        el.style.transform = `translate(${x}px,${y}px)`;
      };
      const leave = () => (el.style.transform = "");
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <>
      <div className="cursor-ring" id="curRing" aria-hidden="true" />
      <div className="cursor-dot" id="curDot" aria-hidden="true" />
    </>
  );
}
