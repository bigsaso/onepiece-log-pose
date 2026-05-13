import NextAuth from 'next-auth';
import PostgresAdapter from '@auth/pg-adapter';
import { authConfig } from '../auth.config';
import pool from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      // On first sign-in, user is available — persist the DB id into the token
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
