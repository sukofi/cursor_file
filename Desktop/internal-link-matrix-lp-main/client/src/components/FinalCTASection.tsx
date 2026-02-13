import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ABSTRACT_BG = "https://private-us-east-1.manuscdn.com/sessionFile/Oi5cYdsZwJO5jqpltTbIwT/sandbox/wHU6LEgbiBECkpQggUZ4Ro-img-4_1770447020000_na1fn_aGVyby1hYnN0cmFjdC1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvT2k1Y1lkc1p3Sk81anFwbHRUYkl3VC9zYW5kYm94L3dIVTZMRWdiaUJFQ2twUWdnVVo0Um8taW1nLTRfMTc3MDQ0NzAyMDAwMF9uYTFmbl9hR1Z5YnkxaFluTjBjbUZqZEMxaVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=fqkDlBTSJqMXZeoIYYSFf-bErWK7zpadF45sMWjD7yy4gDzNNjGhm9SX5MYls7ElPTjsh0zkvZUU4UcqzNMEaO-jQEKqL7dANu7JGrOATconH6ifOyxBpPCZ~CT3dgsMm0nHjWWiVaT~bPp68V9MvHZ6MATpVm9d2YXz5PJPxBaMlNTSYtFn0bqbhh3Lf3A-E0pmF17OAsmJxof8k7FODCTtses~zom9Ip2q-VkVY0HFZH~GVdKQ8ENfabRUCs92nZTKV0N2TWb4VT~8ULcd92alSjNiZ2IC9cYiP0XBd49JVAuu9T6cUhSSXMyl3Up9-ztALekn-nMddQZklQztCg__";

export default function FinalCTASection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={ABSTRACT_BG}
          alt=""
          className="w-full h-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            今すぐ内部リンクマトリクスで、
            <br />
            あなたのメディアを次のステージへ。
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            無料プランで、内部リンクの可視化を体験してみませんか。
            <br className="hidden md:block" />
            設定はわずか1分。クレジットカードは不要です。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://internal-link-checker-kdsm.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-teal-700 text-primary-foreground font-semibold px-8 h-12 text-base shadow-lg shadow-teal-500/20 transition-all hover:shadow-xl hover:shadow-teal-500/30"
              >
                無料で始める
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              className="font-medium px-8 h-12 text-base border-border hover:bg-white/80 bg-white/60"
              onClick={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              料金を見る
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              永久無料プランあり
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              1分で設定完了
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              カード不要
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
