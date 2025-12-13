// Admin email listesi
const ADMIN_EMAILS = [
  'kaankilicarslanofficial@gmail.com'
];

export function isAdmin(userEmail) {
  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail.toLowerCase());
}

export function getAdminEmails() {
  return ADMIN_EMAILS;
}
