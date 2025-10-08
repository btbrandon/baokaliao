import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
