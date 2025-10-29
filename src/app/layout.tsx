import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '海外技能実習生タレントマネジメントシステム',
  description: '海外技能実習生の情報、資格、スキル、育成計画、評価履歴を一元管理するシステム',
  keywords: ['技能実習生', 'タレントマネジメント', '人材管理', '評価システム'],
  authors: [{ name: 'Talent Management Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
