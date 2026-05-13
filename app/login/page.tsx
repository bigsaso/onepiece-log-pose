import { signIn } from '@/lib/auth';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Log Pose</h1>
        <p className={styles.subtitle}>Sign in to track your One Piece journey</p>
        <div className={styles.buttons}>
          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/' });
            }}
          >
            <button type="submit" className={styles.btn}>
              Sign in with Google
            </button>
          </form>
          <form
            action={async () => {
              'use server';
              await signIn('github', { redirectTo: '/' });
            }}
          >
            <button type="submit" className={`${styles.btn} ${styles.btnGithub}`}>
              Sign in with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
