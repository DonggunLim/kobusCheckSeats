// src/shared/lib/auth.ts
import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/shared/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      // 카카오톡 메시지 보내기 권한 요청
      authorization: {
        params: {
          scope: "talk_message profile_nickname",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // 클라이언트에서 session.user.id를 쓸 수 있게 추가
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
