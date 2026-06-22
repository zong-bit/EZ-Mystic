'use client';

import Link from 'next/link';
import { Sparkles, Compass, ArrowRight, Wand2 } from 'lucide-react';

export const metadata = {
  title: 'Life Tools — Lucky Directions, Elements & Numbers | FateWise',
  description: 'Discover your lucky directions, elements and numbers based on your Bazi chart. Free tools powered by ancient Chinese metaphysics.',
};

const TOOLS = [
  {
    href: '/tools/lucky-direction',
    icon: <Compass className="w-8 h-8" />,
    title: 'Lucky Direction Finder',
    subtitle: 'Find your most auspicious directions based on your Bazi chart.',
    description: 'Discover the four lucky directions (Sheng Qi, Tian Yi, Yan Nian, Fu Wei) and four unlucky directions tailored to your elemental profile.',
    color: 'from-emerald-500/20 to-teal-600/10',
    borderColor: 'border-emerald-500/30',
    hoverGlow: 'group-hover:shadow-emerald-500/10',
  },
  {
    href: '/tools/lucky-element-finder',
    icon: <Wand2 className="w-8 h-8" />,
    title: 'Lucky Element Finder',
    subtitle: 'Identify your favorable and unfavorable elements.',
    description: 'Determine which of the Five Elements (Wood, Fire, Earth, Metal, Water) support your destiny and which to avoid.',
    color: 'from-amber-500/20 to-orange-600/10',
    borderColor: 'border-amber-500/30',
    hoverGlow: 'group-hover:shadow-amber-500/10',
  },
  {
    href: '/tools/lucky-numbers',
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Lucky Numbers',
    subtitle: 'Discover your auspicious numbers for life decisions.',
    description: 'Get personalized lucky numbers derived from your Bazi chart — useful for phone numbers, license plates, passwords and more.',
    color: 'from-violet-500/20 to-purple-600/10',
    borderColor: 'border-violet-500/30',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="px-6 pb-12 text-center">
        <span className="text-gold-primary text-sm tracking-[0.3em] uppercase">✦ Tools ✦</span>
        <h1 className="font-display font-bold text-4xl md:text-5xl mt-4 mb-4 text-text-primary">
          Life Tools
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          Three essential tools powered by your Bazi chart — discover the directions, elements and numbers that align with your destiny.
        </p>
      </section>

      {/* Tool Cards */}
      <section className="px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((tool, idx) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group glass-card p-6 md:p-8 rounded-2xl border ${tool.borderColor} hover:border-opacity-50 transition-all duration-300 ${tool.hoverGlow} shadow-lg hover:shadow-xl`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-gold-primary mb-5 group-hover:scale-105 transition-transform duration-300`}>
                {tool.icon}
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-xl text-text-primary mb-1">
                {tool.title}
              </h2>
              <p className="text-gold-primary text-sm font-medium mb-3">
                {tool.subtitle}
              </p>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {tool.description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-gold-primary text-sm font-medium group-hover:gap-3 transition-all duration-300">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="px-6 mt-12">
        <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl border border-gold-primary/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/[0.02] to-transparent pointer-events-none" />
          <div className="relative">
            <span className="text-3xl mb-4 block">👑</span>
            <h2 className="font-display font-bold text-2xl text-gold-primary mb-3">
              Unlock Everything with Pro
            </h2>
            <p className="text-text-secondary text-sm mb-6 max-w-lg mx-auto">
              Get in-depth analysis: yearly fortune, career peak years, relationship compatibility, 
              personalized feng shui recommendations, and a complete Destiny Book PDF.
            </p>
            <Link href="/pricing" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="px-6 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-tertiary text-xs leading-relaxed">
            FateWise Life Tools use your BaZi (Four Pillars of Destiny) chart to calculate auspicious directions, 
            elemental affinities and lucky numbers rooted in traditional Chinese metaphysics. Each tool provides 
            personalized insights based on your birth date, time and location — adjusted for true solar time.
          </p>
        </div>
      </section>
    </div>
  );
}
