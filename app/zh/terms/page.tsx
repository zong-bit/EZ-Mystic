import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '服务条款 — FateWise',
  description: 'FateWise（BornChart）服务条款 — 规范您使用我们八字（BaZi）命盘和AI命运解读平台的条款。',
  alternates: {
    canonical: '/zh/terms',
  },
  openGraph: {
    title: '服务条款 — FateWise',
    description: '规范您使用FateWise八字（BaZi）命盘和AI命运解读服务的条款。',
    url: 'https://bornchart.app/terms',
    siteName: 'FateWise',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ 服务条款 ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            服务条款
          </h1>
          <p className="text-text-secondary text-sm">最后更新：2026年5月19日</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">1. 条款接受</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise由<strong>ZONG XINWEI（宗馨薇）</strong>（个体经营者）运营。通过访问或使用FateWise（“服务”、“我们”、“我们的”）于bornchart.app，即表示您同意受这些服务条款（“条款”）的约束。如果您不同意这些条款，请勿使用本服务。
            </p>
            <p className="text-text-secondary leading-relaxed">
              我们保留随时修改这些条款的权利。变更内容将发布在此页面，并更新“最后更新”日期。在变更后继续使用本服务即表示您接受修订后的条款。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">2. 服务描述</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise提供一个在线平台，用于八字（BaZi，四柱命理）命盘计算、AI驱动的解读以及个性化命运报告生成。我们的服务包括：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>基于真太阳时（True Solar Time）的免费基础八字（BaZi）命盘计算</li>
              <li>使用大型语言模型的AI深度解读</li>
              <li>命运之书（Destiny Book）PDF报告生成（付费功能）</li>
              <li>关于您命盘的AI聊天咨询</li>
              <li>关于中国占星术和东方智慧的教育内容</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">3. 用户责任</h2>
            <p className="text-text-secondary leading-relaxed mb-3">作为FateWise的用户，您同意：</p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>提供准确的出生信息（日期、时间、地点）以用于命盘计算</li>
              <li>仅将本服务用于个人非商业用途</li>
              <li>不尝试逆向工程、滥用或破坏本服务</li>
              <li>不将本服务用于任何非法或未经授权的目的</li>
              <li>对您的账户凭证保密</li>
              <li>遵守所有适用的法律法规</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">4. 知识产权</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              本服务，包括但不限于其代码、设计、内容、算法、生成的报告和品牌，归FateWise所有，并受适用的知识产权法保护。
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              八字（BaZi）命盘算法、AI解读逻辑、命运之书（Destiny Book）模板以及所有原创内容（除非明确标注）均为FateWise专有。
            </p>
            <p className="text-text-secondary leading-relaxed">
              未经我们事先书面同意，您不得复制、分发、修改、创作衍生作品或公开展示本服务的任何部分。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">5. 付款与订阅</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              付费功能（专业版月费和年费订阅）通过我们的支付合作伙伴（包括Paddle）处理。购买即表示您也同意他们的服务条款。
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>专业版计划：$9.99/月，自动续费直到取消</li>
              <li>专业版年费计划：$79.99/年，每年续费</li>
              <li>所有价格均为美元，并可能适用相关税费</li>
              <li>您可以随时从账户仪表板取消订阅</li>
              <li>退款根据我们的退款政策处理</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">6. 责任限制</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              本服务按“现状”和“可用”提供，不附带任何明示或暗示的保证。
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise是一项娱乐和教育服务。八字（BaZi）解读、AI解读及所有提供的内容仅供<strong>娱乐和教育目的</strong>。它们不应被视为医疗、法律、财务或任何其他人生决策方面的专业建议。
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              在任何情况下，FateWise、其所有者或关联方均不对因您使用本服务而引起的任何间接、附带、特殊、后果性或惩罚性损害赔偿负责。
            </p>
            <p className="text-text-secondary leading-relaxed">
              某些司法管辖区不允许排除某些保证或限制责任。在这种情况下，我们的责任应在法律允许的最大范围内加以限制。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">7. 终止</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              如果我们认为您的行为违反了这些条款或对其他用户、第三方或我们的商业利益有害，我们保留随时暂停或终止您访问本服务的权利，而无需事先通知。
            </p>
            <p className="text-text-secondary leading-relaxed">
              终止后，您使用本服务的权利将立即停止。有关知识产权、责任限制和管辖法律的条款在终止后继续有效。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">8. 管辖法律</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              这些条款应受香港特别行政区法律管辖并依其解释，不考虑其法律冲突规定。
            </p>
            <p className="text-text-secondary leading-relaxed">
              因这些条款引起的任何争议应通过友好协商解决。如果协商失败，争议应提交香港特别行政区有管辖权的法院。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">9. 联系方式</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              如果您对这些条款有任何疑问，请通过以下方式联系我们：
            </p>
            <p className="text-text-secondary leading-relaxed mb-2">
              <strong>运营者：</strong> ZONG XINWEI（宗馨薇）（个体经营者）
            </p>
            <p className="text-text-secondary leading-relaxed mb-2">
              <strong>电子邮件：</strong> <span className="text-gold-primary">support@bornchart.app</span>
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>网站：</strong> <span className="text-gold-primary">https://bornchart.app</span>
            </p>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm text-text-tertiary">
              FateWise由ZONG XINWEI（宗馨薇）（个体经营者）独立运营。使用本服务即表示您与以FateWise和BornChart品牌名称运营的个体经营者签订合同。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
