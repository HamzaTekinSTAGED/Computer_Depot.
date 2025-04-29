import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// The handler should be exported as default for pages router
export default NextAuth(authOptions);

// The named exports GET/POST are for App Router
// export { handler as GET, handler as POST }; 