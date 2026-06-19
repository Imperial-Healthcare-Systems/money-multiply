import seedJson from "./_generated-seed.json";
import imagesJson from "./_generated-images.json";
import type { Listing, ImagesManifest } from "./types";

export const IMAGES = imagesJson as ImagesManifest;
export const SEED = seedJson as Listing[];

/** default artwork motifs (SVG) used when a listing has no photo */
export const PROPS = IMAGES.props;
export const HERO_FRAMES = IMAGES.heroFrames;
export const EMBLEM = IMAGES.emblem;
export const FB_LOGO = IMAGES.fbLogo;
export const IMG = IMAGES.img;

/** section imagery */
export const SECTION_IMAGES = {
  howFlow: IMG.flow,
  statsMap: IMG.indiamap,
  aboutMedia: IMG.compare,
  footArchi: IMG.burj,
};

/* ---- contact / business constants ---- */
export const WA = "9911176822";
export const EMAIL = "Mashutoshkumar325@gmail.com";
export const CONTACT_EMAIL = "info@moneymultiplyglobal.com";
export const PHONE_TEL = "+919911176822";

/* ---- admin auth (client-side demo) ---- */
export const ADMIN_PASS_DEFAULT = "MM@2026";
export const OTP_PRIMARY_EMAIL = "info@moneymultiplyglobal.com";

/** the artwork (PROPS index) options shown in the admin form */
export const MOTIF_OPTIONS = [
  "Land Bank",
  "Residences",
  "Estate",
  "Agri-Land",
  "Waterfront",
  "Plotted Dev",
];

/** default-photo pool assigned to brand-new admin listings */
export const PHOTO_POOL = [
  "card_golden",
  "card_dusk",
  "card_towers",
  "card_lake",
  "card_terrace",
  "card_tower_night",
];
