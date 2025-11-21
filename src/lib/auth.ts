export const ADMIN_EMAILS = ["hatohui@gmail.com"];

export function isAdmin(
  user: { email?: string | null } | string | null | undefined
): boolean {
  if (!user) return false;
  const email = typeof user === "string" ? user : user.email;
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
}
