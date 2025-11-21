export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/:path*",
    "/expenses/:path*",
    "/admin/:path*",
  ],
};
