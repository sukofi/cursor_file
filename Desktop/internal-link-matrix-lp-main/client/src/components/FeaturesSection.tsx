import { motion } from "framer-motion";
import {
  Eye,
  Sheet,
  Code2,
  FolderKanban,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "内部リンクの完全可視化",
    description:
      "記事同士のリンク関係をマトリクスで一覧表示。リンクの偏りや孤立記事を瞬時に発見し、改善策を立てられます。",
    color: "bg-teal-50 text-primary",
    iconBg: "bg-teal-50 border-teal-100",
  },
  {
    icon: Sheet,
    title: "Googleスプレッドシートと簡単連携",
    description:
      "既存の記事一覧をそのまま利用可能。スプレッドシートIDと列を指定するだけで、新たなデータ入力の手間は一切ありません。",
    color: "bg-emerald-50 text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: Code2,
    title: "柔軟な計測設定（CSSセレクタ）",
    description:
      "内部リンクの定義を自由にカスタマイズ。「このブロック内のリンクだけ数える」など、詳細な分析が可能です。",
    color: "bg-sky-50 text-sky-600",
    iconBg: "bg-sky-50 border-sky-100",
  },
  {
    icon: FolderKanban,
    title: "複数プロジェクト対応",
    description:
      "複数のサイトやプロジェクトの内部リンクを、ダッシュボードから簡単に切り替えて一元管理できます。",
    color: "bg-violet-50 text-violet-600",
    iconBg: "bg-violet-50 border-violet-100",
  },
  {
    icon: Sparkles,
    title: "まずは無料で体験",
    description:
      "10行までのスプレッドシート連携が可能な無料プランをご用意。リスクなく、その効果を実感いただけます。",
    color: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-50 border-amber-100",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <span className="text-sm font-semibold text-primary tracking-wide uppercase mb-3 block">
            機能
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            内部リンクマトリクスが
            <br className="sm:hidden" />
            選ばれる5つの理由
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            コンテンツマーケターやSEO担当者の皆様のニーズに応える、
            <br className="hidden md:block" />
            強力な機能を提供します。
          </p>
        </motion.div>

        {/* Feature cards - 2+3 layout */}
        <div className="max-w-5xl mx-auto">
          {/* Top row: 2 cards */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {features.slice(0, 2).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl p-7 border border-border/60 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.iconBg} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <feature.icon className={`w-5 h-5 ${feature.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom row: 3 cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {features.slice(2).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (index + 2) * 0.1 }}
                className="bg-white rounded-xl p-7 border border-border/60 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.iconBg} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <feature.icon className={`w-5 h-5 ${feature.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
