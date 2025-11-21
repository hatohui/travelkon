export const ADMIN_EMAILS = ["hatohui@gmail.com"];

export function isAdmin(email: string | null | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
}
