import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export { auth as middleware };

export const config = {
  matcher: [
    '/((?!login|api/auth|_next|favicon\\.ico|crew/).*)',
  ],
};
