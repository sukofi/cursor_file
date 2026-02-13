import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "¥0",
    period: "永久無料",
    description: "まずは気軽に試してみたい方に",
    popular: false,
    features: [
      "スプレッドシート10行まで",
      "プロジェクト数無制限",
      "マトリクス表示",
      "CSVエクスポート",
      "基本サポート",
    ],
    cta: "無料で始める",
  },
  {
    name: "Pro",
    price: "¥980",
    period: "/月",
    description: "本格的に内部リンクを最適化したい方に",
    popular: true,
    features: [
      "スプレッドシート行数無制限",
      "プロジェクト数無制限",
      "マトリクス表示",
      "CSVエクスポート",
      "優先サポート",
      "いつでもキャンセル可能",
    ],
    cta: "Proプランを始める",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28">
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
            料金
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            あなたのメディアを成長させる
            <br className="sm:hidden" />
            最適なプラン
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            無料プランで効果を実感してから、必要に応じてアップグレード。
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${plan.popular
                  ? "border-primary/30 bg-white shadow-xl shadow-teal-500/8 ring-1 ring-primary/10"
                  : "border-border bg-white hover:border-border/80 hover:shadow-md"
                }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    人気
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold tracking-tight"
                    style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.name === "Pro" ? (
                <a
                  href="https://buy.stripe.com/6oU5kE81u4RkfITfJa8Ra00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className={`w-full h-11 font-medium ${plan.popular
                        ? "bg-primary hover:bg-teal-700 text-primary-foreground shadow-md shadow-teal-500/15"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              ) : (
                <a
                  href="https://internal-link-checker-kdsm.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className={`w-full h-11 font-medium ${plan.popular
                        ? "bg-primary hover:bg-teal-700 text-primary-foreground shadow-md shadow-teal-500/15"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Proプランはいつでもキャンセル可能です。クレジットカード決済に対応しています。
        </motion.p>
      </div>
    </section>
  );
}
