/** Single source of truth for the house details.
 *  These are still placeholders — replace them before launch. */
export const SITE = {
  name: "Oro House",
  street: "21 Garden Lane",
  locality: "Kolkata",
  region: "West Bengal",
  postcode: "700001",
  country: "IN",
  phone: "+91 00000 00000",
  email: "table@orohouse.example",
  url: "https://orohouse.example",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
};

export const ADDRESS = `${SITE.name}, ${SITE.street}`;

/** Opens the right app on every platform, rather than a bare string. */
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.name}, ${SITE.street}, ${SITE.locality}`,
)}`;

export const TEL_HREF = `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;
