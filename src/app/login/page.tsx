import { getSession, isPasswordConfigured } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/admin');
  }

  const setupNeeded = !(await isPasswordConfigured());

  return <LoginForm setupNeeded={setupNeeded} />;
}
