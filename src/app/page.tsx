import { redirect } from 'next/navigation';

export default function HomePage() {
  // ルートページはダッシュボードにリダイレクト
  redirect('/dashboard');
}
