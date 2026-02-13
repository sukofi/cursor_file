import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const HERO_DASHBOARD_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/Oi5cYdsZwJO5jqpltTbIwT/sandbox/wHU6LEgbiBECkpQggUZ4Ro-img-1_1770447029000_na1fn_aGVyby1kYXNoYm9hcmQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvT2k1Y1lkc1p3Sk81anFwbHRUYkl3VC9zYW5kYm94L3dIVTZMRWdiaUJFQ2twUWdnVVo0Um8taW1nLTFfMTc3MDQ0NzAyOTAwMF9uYTFmbl9hR1Z5Ynkxa1lYTm9ZbTloY21RLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=QwEaiwyuBHd9t17Z3-Ey9AzEYWpMP3Ir18J1YG8q-CgkrTtD3HI66NgJbMJ0jWl5iGBfEmIf7GJ1TUuLmboapbsQZJo2ShV3~vnUBo6KX4wK7gVkYwB5-SqPjrIioqzKeW9GrJGC3a69dq~C1If-0fb8pZpYGRPfgHMxohyeCmzyR27fUddtebfKaU~ZPLi-KuqFD0gpJc6hjW9E~2IcGw4tZlYM2GCPVDTOQ8dNJP1MUbsWFOLHKZsC1TiC5XgoF-3M5kkzTen66kReqnsnynqZdWmWpG-kx7s-0zifkBIjdsOqR7YN3VeFyo2Mt82oyB6KoYReCagxbcpIWR0WkQ__";

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              無料プランで今すぐ始められます
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6"
            style={{ fontFamily: '"DM Sans", "Noto Sans JP", system-ui, sans-serif' }}
          >
            記事の成長を加速させる、
            <br />
            <span className="text-primary">内部リンク</span>の最適解。
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            スプレッドシートと連携して、記事間の内部リンクをマトリクスで可視化。
            <br className="hidden md:block" />
            リンク切れや孤立記事を一目で発見し、SEO効果を最大化します。
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
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
              className="font-medium px-8 h-12 text-base border-border hover:bg-secondary"
              onClick={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              料金を見る
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            クレジットカード不要 ・ 10行まで永久無料 ・ 1分で設定完了
          </motion.p>
        </div>

        {/* Dashboard Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/10 border border-border/50">
            <img
              src={HERO_DASHBOARD_IMG}
              alt="内部リンクマトリクスのダッシュボード画面"
              className="w-full h-auto"
              loading="eager"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex justify-center mt-12"
        >
          <a
            href="#problem"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="下にスクロール"
          >
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
