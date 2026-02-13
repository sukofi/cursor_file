import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "いつでもキャンセルできますか？",
    answer:
      "はい、Proプランはいつでもキャンセル可能です。違約金などは一切発生しません。キャンセル後も、現在の請求期間が終了するまではProプランの機能をご利用いただけます。",
  },
  {
    question: "支払い方法は何がありますか？",
    answer:
      "クレジットカード決済（Visa、Mastercard、JCB、American Express）に対応しております。請求は月額で、毎月自動更新されます。",
  },
  {
    question: "無料プランから有料プランへの移行は簡単ですか？",
    answer:
      "はい、管理画面からいつでも簡単にProプランへアップグレードできます。これまでのプロジェクトデータやマトリクスの設定はすべて引き継がれますのでご安心ください。アップグレード後すぐに行数無制限でご利用いただけます。",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary/50">
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
            FAQ
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            よくあるご質問
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border border-border/60 px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-md transition-all"
              >
                <AccordionTrigger className="text-left text-base font-medium py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
