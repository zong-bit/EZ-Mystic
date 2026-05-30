'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LangSwitch() {
  const pathname = usePathname();

  // 从路径判断当前语言
  const isChinese = pathname.startsWith('/zh');

  // 切换到目标语言
  const targetPath = isChinese
    ? pathname.replace(/^\/zh/, '') || '/'  // 中文→英文
    : `/zh${pathname}`;  // 英文→中文

  return (
    <Link
      href={targetPath}
      className="text-gold-primary border border-gold-primary/30 rounded-full px-3 py-1 text-xs hover:bg-gold-primary/10 transition whitespace-nowrap"
    >
      {isChinese ? 'English' : '中文'}
    </Link>
  );
}
