import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '隐私政策 — FateWise',
  description: 'FateWise（BornChart）隐私政策 — 我们如何在使用我们的八字盘（BaZi Chart）和AI命运解读平台时收集、使用、存储和保护您的个人数据。',
  alternates: {
    canonical: '/zh/privacy',
  },
  openGraph: {
    title: '隐私政策 — FateWise',
    description: 'FateWise 如何收集、使用和保护您的个人数据。',
    url: 'https://bornchart.app/zh/privacy',
    siteName: 'FateWise',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ 隐私政策 ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            隐私政策
          </h1>
          <p className="text-text-secondary text-sm">最后更新：2026年5月19日</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">1. 我们收集的信息</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              当您使用 FateWise 时，我们收集以下信息：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>账户信息：</strong>电子邮件地址和姓名（如果您创建账户）</li>
              <li><strong>出生数据：</strong>出生日期、准确出生时间和出生地点——使用真太阳时校正（True Solar Time）进行准确的八字盘计算所必需</li>
              <li><strong>使用数据：</strong>访问的页面、使用的功能以及与AI聊天服务的互动</li>
              <li><strong>支付数据：</strong>支付处理完全由 Paddle 负责。我们不在服务器上存储信用卡号或账单详情</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">2. 我们如何使用您的信息</h2>
            <p className="text-text-secondary leading-relaxed mb-3">我们将收集的信息用于以下目的：</p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>使用真太阳时校正计算您的八字盘</li>
              <li>生成AI驱动的解读和命运之书PDF报告</li>
              <li>提供和维护您的账户</li>
              <li>处理付款和管理订阅</li>
              <li>改进我们的服务和用户体验</li>
              <li>就您的账户和服务更新与您沟通</li>
              <li>检测、预防和解决技术问题或滥用行为</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">3. 数据存储与安全</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              您的数据采用行业标准实践进行安全存储：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>数据库：</strong>我们使用 Supabase，这是一个安全的云数据库，具有静态和传输中加密功能</li>
              <li><strong>身份验证：</strong>用户身份验证通过 Supabase Auth 管理</li>
              <li><strong>数据保留：</strong>在您的账户有效期间，我们会保留您的数据。您可以随时请求删除</li>
              <li><strong>加密：</strong>您的浏览器与我们的服务器之间传输的所有数据均使用 TLS/SSL 进行加密</li>
              <li><strong>访问控制：</strong>我们实施严格的访问控制，确保只有授权的系统和人员才能访问您的数据</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">4. 第三方服务</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise 使用以下第三方服务，每个服务均有各自的隐私政策：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>
                <strong>DeepSeek API：</strong>用于AI驱动的八字解读和聊天。您的命盘数据和对话消息会被发送至 DeepSeek 进行处理。
                <a href="https://platform.deepseek.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">DeepSeek 隐私政策</a>
              </li>
              <li>
                <strong>Supabase：</strong>用于数据库存储和用户身份验证。
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">Supabase 隐私政策</a>
              </li>
              <li>
                <strong>Paddle：</strong>我们的支付处理商。Paddle 负责所有支付交易，不会将您的完整财务信息分享给我们。
                <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">Paddle 隐私政策</a>
              </li>
              <li>
                <strong>Vercel：</strong>FateWise 网站的主机提供商。
                <a href="https://vercel.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">Vercel 隐私政策</a>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">5. Cookie 使用</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise 仅使用最少量的 Cookie 用于基本功能：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>会话 Cookie：</strong>用户身份验证和登录状态所必需</li>
              <li><strong>无追踪 Cookie：</strong>我们不使用分析、广告或追踪 Cookie</li>
              <li><strong>无第三方 Cookie：</strong>我们不允许在我们的平台上使用第三方 Cookie</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm">
              您可以通过浏览器设置控制 Cookie 偏好。但是，禁用必要的 Cookie 可能会影响您使用本服务的某些功能。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">6. 您的权利</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              根据您所在的司法管辖区，您可能对您的个人数据享有以下权利：
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>知情权：</strong>请求获取我们所持有的关于您的个人数据副本</li>
              <li><strong>更正权：</strong>请求更正不准确或不完整的数据</li>
              <li><strong>删除权：</strong>请求删除您的个人数据（受法律义务约束）</li>
              <li><strong>数据可携权：</strong>请求将您的数据传输至其他服务</li>
              <li><strong>反对权：</strong>反对处理您的个人数据</li>
              <li><strong>撤回同意权：</strong>随时撤回同意，但不影响撤回前基于同意所作处理的合法性</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm">
              如需行使上述任何权利，请通过 <span className="text-gold-primary">support@bornchart.app</span> 与我们联系。我们将在30天内回复您的请求。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">7. 数据传输</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              您的数据可能会在服务器或第三方服务提供商所在的国家进行处理。我们确保采取适当的安全措施，根据适用的数据保护法律保护您的数据。
            </p>
            <p className="text-text-secondary leading-relaxed">
              使用 FateWise，即表示您同意将您的信息传输到您居住国以外的国家，包括但不限于美国和香港特别行政区。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">8. 本政策的变更</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              我们可能会不时更新本隐私政策。我们将在本页面发布新的隐私政策并更新“最后更新”日期，以通知您任何变更。
            </p>
            <p className="text-text-secondary leading-relaxed">
              我们建议您定期查看本隐私政策以了解任何变更。本隐私政策的变更自发布在本页面时生效。
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">9. 联系方式</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              如果您对本隐私政策或我们的数据实践有任何疑问，请通过以下方式联系我们：
            </p>
            <p className="text-text-secondary leading-relaxed">
              电子邮件：<span className="text-gold-primary">support@bornchart.app</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
