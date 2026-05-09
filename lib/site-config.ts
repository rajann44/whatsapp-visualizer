const defaultSiteUrl = "https://whatsapp-visualizer.app";
const defaultSupportEmail = "feedback@whatsapp-visualizer.app";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(/\/$/, "");
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || defaultSupportEmail;
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
