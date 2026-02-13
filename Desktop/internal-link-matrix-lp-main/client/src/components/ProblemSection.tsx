import { motion } from "framer-motion";
import { AlertTriangle, Link2Off, Search, Shuffle } from "lucide-react";

const problems = [
  {
    icon: Search,
    title: "リンク構造が見えない",
    description:
      "記事が増えるほど、どの記事がどこからリンクされているか把握できなくなります。",
  },
  {
    icon: Link2Off,
    title: "リンク切れに気づけない",
    description:
      "URLの変更や記事の削除で発生するリンク切れを、手作業で発見するのは困難です。",
  },
  {
    icon: Shuffle,
    title: "リンクの偏りが生まれる",
    description:
      "一部の記事にリンクが集中し、他の記事が孤立してしまうことに気づけません。",
  },
  {
    icon: AlertTriangle,
    title: "手作業では限界がある",
    description:
      "スプレッドシートで一つ一つ確認する方法では、記事数が増えると管理が破綻します。",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="py-20 md:py-28 bg-secondary/50">
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
            課題
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            内部リンクの管理、
            <br className="sm:hidden" />
            手作業で消耗していませんか？
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            記事が増えれば増えるほど、内部リンクの管理は複雑になります。
            <br className="hidden md:block" />
            SEO効果を最大化するための内部リンク設計、きちんとできていますか？
          </p>
        </motion.div>

        {/* Problem cards */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-coral-400/10 flex items-center justify-center mb-4 group-hover:bg-coral-400/15 transition-colors">
                <problem.icon className="w-5 h-5 text-coral-500" />
              </div>
              <h3 className="text-base font-semibold mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
