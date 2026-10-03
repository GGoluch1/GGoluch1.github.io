import { email } from "../data/socials";

// The email address, joined from its two halves. Null while prerendering, so
// the static HTML (what scrapers read) never contains it, and null when
// there's no email configured.
export function emailAddress() {
  if (typeof window === "undefined" || !email) return null;
  return `${email.user}@${email.domain}`;
}
