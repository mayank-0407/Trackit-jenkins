import { NextAuthOptions } from "next-auth";
import Credentials, {
  CredentialsProvider,
} from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { LoginSchema } from "@/lib/Validation";
import { generateEmailToken } from "@/lib/emailToken";
import { sendEmail } from "@/lib/sendEmail";
import { sendEmailVerification } from "@/lib/sendEmailVerification";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials: any) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        try {
          await connectDB();

          const user: any = await User.findOne({ email });
          if (!user) throw new Error("The Entered User doesn't exists!");

          if (!user.isVerified) {
            const token = generateEmailToken(email);
            const verifyUrl = `${process.env.BASE_URL}/verify?token=${token}`;
            await sendEmailVerification(email, verifyUrl);
            throw new Error(
              "Email not verified. Please check your inbox we have resent verification link."
            );
          }

          const ok = await bcrypt.compare(password, user.password);
          if (ok) {
            return {
              id: String(user._id),
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } else {
            throw new Error("Incorrect Password");
            return null;
          }
        } catch (e: any) {
          throw new Error(e);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      const temp = {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
  },
};
