import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '退款政策 — FateWise',
  description: 'FateWise 退款政策 — 所有付费方案均享14天退款保证。',
  alternates: {
    canonical: '/refund',
  },
  openGraph: {
    title: '退款政策 — FateWise',
    description: '所有 FateWise 付费方案均享14天退款保证。',
    url: 'https://bornchart.app/refund',
    siteName: 'FateWise',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ 退款政策 ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            退款政策
          </h1>
          <p className="text-text-secondary text-sm">最后更新：2026年5月19日</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">14天退款保证</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              我们对服务品质充满信心。如果您因任何原因对 FateWise 的购买不满意，我们为所有付费方案提供 <strong>14天退款保证</strong>。
            </p>
            <p className="text-text-secondary leading-relaxed">
              这意味着自购买之日起14个日历日内，您可申请全额退款，无需任何理由。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">哪些情况可以退款</h2>
            <ul className="text-text-secondary text-sm space-y-3 list-disc pl-5">
              <li>
                <strong>专业版月度订阅：</strong>购买后14天内申请可获全额退款。若在14天后取消，您可继续使用至当前计费周期结束，但当前周期费用不予退还。
              </li>
              <li>
                <strong>高级版终身访问：</strong>购买后14天内申请可获全额退款。
              </li>
              <li>
                <strong>免费服务：</strong>免费八字（BaZi）排盘及基础功能为免费提供，故不适用退款。
              </li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">哪些情况不符合退款条件</h2>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>购买日期超过14天后提出的申请</li>
              <li>在14天退款窗口期后取消的订阅（访问权限延续至计费周期结束）</li>
              <li>对部分使用过的计费周期（超出14天窗口期）的部分退款</li>
              <li>免费提供的服务不适用退款</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">如何申请退款</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              申请退款非常简单：
            </p>
            <ol className="text-text-secondary text-sm space-y-3 list-decimal pl-5">
              <li>发送邮件至 <span className="text-gold-primary">support@bornchart.app</span>，邮件主题请注明“退款申请”</li>
              <li>附上您购买时使用的电子邮箱地址</li>
              <li>可选择告知我们您的退款原因（这有助于我们改进，但非必需）</li>
            </ol>
            <p className="text-text-secondary leading-relaxed mt-4">
              您也可以通过账户管理面板管理订阅及申请取消。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">处理时间</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              收到您的退款申请后：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>我们将在1-2个工作日内确认收到</li>
              <li>退款将在5-10个工作日内处理</li>
              <li>退款将退回至原支付方式</li>
              <li>退款处理完成后，您将收到确认邮件</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm">
              请注意，处理时间可能因您的支付服务商和金融机构而异。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">取消订阅</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              您可以随时通过账户管理面板取消专业版月度订阅。取消后：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>您将继续享有专业版功能直至当前计费周期结束</li>
              <li>您的订阅将不再自动续费</li>
              <li>不会产生进一步费用</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">联系我们</h2>
            <p className="text-text-secondary leading-relaxed">
              如果您对我们的退款政策有任何疑问，请通过{' '}
              <span className="text-gold-primary">support@bornchart.app</span> 联系我们。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}