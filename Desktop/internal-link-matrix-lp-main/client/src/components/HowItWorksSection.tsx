import { motion } from "framer-motion";
import { FileSpreadsheet, Globe, LayoutGrid } from "lucide-react";

const SPREADSHEET_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/Oi5cYdsZwJO5jqpltTbIwT/sandbox/wHU6LEgbiBECkpQggUZ4Ro-img-3_1770447039000_na1fn_c3ByZWFkc2hlZXQtY29ubmVjdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvT2k1Y1lkc1p3Sk81anFwbHRUYkl3VC9zYW5kYm94L3dIVTZMRWdiaUJFQ2twUWdnVVo0Um8taW1nLTNfMTc3MDQ0NzAzOTAwMF9uYTFmbl9jM0J5WldGa2MyaGxaWFF0WTI5dWJtVmpkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=qRj60So4dkU5ePK5EwfRpDhBaCVp8JvqAGd~hKZvRJAfjop2i5AL9IUPmuZqGPK-Yzw4SDgf48GREIcUmunWMrtghxofIJpwfZamtFCN3dh~gQUhMfDtCM0HCDQ9NJvSgtGWFFy12HQilkoKb7HSu8oUHdNBqCNGCKvo328u-HqUynYLfc~bv8uaOyW~OeGTlJXgsIIxsj-j6e00~sXTCZpet9aNUcW2RCFxCtsTz4rvLzxsLHdbh9uXDfwhetA2q8atDZibmjFVIlMgAiV1BnlhwH-juVjuXYK6DICRqRwU6cq~ouhmHBD~J1uPzZa6NQpRlJiVxvi2l8WviW-odA__";

const MATRIX_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/Oi5cYdsZwJO5jqpltTbIwT/sandbox/wHU6LEgbiBECkpQggUZ4Ro-img-2_1770447039000_na1fn_bWF0cml4LXZpZXc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvT2k1Y1lkc1p3Sk81anFwbHRUYkl3VC9zYW5kYm94L3dIVTZMRWdiaUJFQ2twUWdnVVo0Um8taW1nLTJfMTc3MDQ0NzAzOTAwMF9uYTFmbl9iV0YwY21sNExYWnBaWGMucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=V-3IHUkiXAw49Ev9z3dfWwLvNE4MRZaTQVjqnmOr236QN8c3vU6c03ksxDYWdkEIGQl9h9o7mwHgjU0D7eAESqj2QO2t5RaU~0WrLEynEBtJWqAgdYiriXUscAfk3wfMO7S-NN68H9ISl~F8CbaDmZ8ZGqv6I608~1wMHopC0M4Et7r0nNugGKZ8yZ0hXMOgaVk7oQ6tKf~sQ7a3PUL3KLysfMg6-h08fWF1p64K52WBJ85jpBKgCqJJWCCWIE4foBjBoFaq8ORK16-dzprP9nhjYtBnkNob7Aa6b0xGhOjC3nO-WabnsPyKtYryH30nDCViju-zg4LRDPK3rX5zVw__";

const steps = [
  {
    number: "01",
    icon: FileSpreadsheet,
    title: "スプレッドシート連携",
    description:
      "普段お使いのGoogleスプレッドシート（キーワード・URL一覧）をそのまま活用。スプレッドシートIDと列を指定するだけで連携が完了します。",
  },
  {
    number: "02",
    icon: Globe,
    title: "自動クロール",
    description:
      "連携された各URLを自動でクロールし、記事内の内部リンクを抽出。CSSセレクタで計測範囲の指定も可能です。",
  },
  {
    number: "03",
    icon: LayoutGrid,
    title: "マトリクス表示",
    description:
      "どの記事がどの記事にリンクしているかをマトリクス形式で一覧表示。CSVエクスポートにも対応しています。",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary tracking-wide uppercase mb-3 block">
            仕組み
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            たった3ステップで、
            <br className="sm:hidden" />
            内部リンクを完全に可視化
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            既存のスプレッドシートと連携するだけ。面倒な設定は不要です。
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {/* Flow illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <img
              src={SPREADSHEET_IMG}
              alt="スプレッドシートからマトリクスへの連携フロー"
              className="w-full max-w-2xl mx-auto h-auto"
              loading="lazy"
            />
          </motion.div>

          {/* Step cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="relative"
              >
                {/* Connector line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[-2rem] h-px bg-border z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-border rotate-45" />
                  </div>
                )}

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 mb-5">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-primary/60 tracking-widest mb-2">
                    STEP {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Matrix screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <div className="rounded-xl overflow-hidden shadow-xl shadow-black/8 border border-border/50">
              <img
                src={MATRIX_IMG}
                alt="内部リンクマトリクスの表示画面"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              マトリクス表示で、記事間のリンク関係を一目で把握
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
