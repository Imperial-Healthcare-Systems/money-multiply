"use client";

const LINKS = [
  { href: "#marketplace", label: "Marketplace" },
  { href: "#how", label: "How It Works" },
  { href: "#why", label: "Why Invest" },
  { href: "#about", label: "About & Leadership" },
  { href: "#stats", label: "Global Stats" },
];

export default function MobileDrawer({
  open,
  onClose,
  onAdmin,
  onAssociate,
}: {
  open: boolean;
  onClose: () => void;
  onAdmin: () => void;
  onAssociate: () => void;
}) {
  return (
    <div className={"drawer" + (open ? " open" : "")} id="drawer">
      <div className="scrim" onClick={onClose} />
      <div className="panel">
        <div className="dhead">
          <span
            className="b2"
            style={{
              fontFamily: "var(--ff-m)",
              fontSize: "10px",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--brass-lt)",
            }}
          >
            Menu
          </span>
          <button className="dclose" onClick={onClose}>
            ×
          </button>
        </div>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={onClose}>
            {l.label} <span>→</span>
          </a>
        ))}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onAssociate();
          }}
        >
          Become an Associate <span>→</span>
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onAdmin();
          }}
        >
          Admin Login <span>→</span>
        </a>
        <a
          className="btn-gold"
          style={{ justifyContent: "center", marginTop: "18px" }}
          href="#marketplace"
          onClick={onClose}
        >
          Start Investing
        </a>
      </div>
    </div>
  );
}
