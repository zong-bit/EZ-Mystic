'use client';

import StarBackground from '../components/StarBackground';

export default function ZenPage() {
  return (
    <>
      <div className="fixed inset-0 bg-black">
        <StarBackground />
      </div>
      {/* 空白占位，Footer 在下面 */}
      <div className="min-h-screen"></div>
    </>
  );
}
