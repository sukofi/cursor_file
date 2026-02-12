import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: '利用規約',
  description: '内部リンクマトリクスの利用規約です。',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>
        <p className="text-sm text-muted-foreground mb-10">
          最終更新日: 2025年2月7日
        </p>

        <div className="prose prose-slate max-w-none space-y-10 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">第1条（適用）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本規約は、内部リンクマトリクス（以下「本サービス」）の利用条件を定めるものです。利用者（以下「ユーザー」）は、本サービスを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第2条（定義）</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>「本サービス」とは、当方が提供する内部リンクの可視化・分析のためのWebアプリケーション（スプレッドシート連携、マトリクス表示、CSVエクスポート等を含む）をいいます。</li>
              <li>「ユーザー」とは、本サービスにログインし、本サービスを利用する者をいいます。</li>
              <li>「コンテンツ」とは、ユーザーが本サービスに登録・設定したスプレッドシート、プロジェクト、その他のデータをいいます。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第3条（アカウント）</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              本サービスの利用には、Googleアカウントによるログイン（認証）が必要です。ユーザーは、自己の責任においてアカウント情報を管理し、第三者に利用されないよう努めるものとします。当方は、アカウントの不正利用により生じた損害について責任を負いません。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              本サービスは、スプレッドシートの読み取りのため、Googleが提供するOAuthのスコープ（spreadsheets.readonly 等）を利用します。ユーザーは、ログイン時に当該権限の付与に同意するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第4条（禁止事項）</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>法令または公序良俗に反する行為</li>
              <li>当方、他のユーザー、その他第三者の権利を侵害する行為</li>
              <li>本サービスの運営を妨げ、またはサーバー・ネットワークに過度の負荷をかける行為</li>
              <li>本サービスで提供するAPI・機能を不正に利用し、第三者サイトへ過度にアクセスする行為（クロールの濫用等）</li>
              <li>反社会的勢力への利益供与その他の協力行為</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第5条（料金・支払い）</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              有料プラン（Proプラン等）を利用する場合、所定の料金を支払うものとします。料金の支払いには、当方が指定する決済手段（Stripeを利用したクレジットカード決済等）を用います。料金は、利用開始日または更新日から1か月（または当方が定める期間）ごとに前払いで発生します。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              有料プランの解約は、当方の定める方法（Stripeカスタマーポータル等）により行うことができます。解約後も、既に支払い済みの期間までは有料プランの機能を利用できます。返金は、法令に基づく場合を除き行いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第6条（知的財産・コンテンツ）</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              本サービス（プログラム、デザイン、文案等）に関する知的財産権は当方または正当な権利者に帰属します。ユーザーは、本サービスを利用する権利を許諾されるだけで、これらを複製・改変・再許諾する権利はありません。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーが本サービスに登録・設定したコンテンツの権利は、ユーザーに帰属します。ただし、当方は、本サービスの提供・改善・サポートに必要な範囲で、当該コンテンツを利用（保存・処理・表示等）することができるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第7条（免責）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスは現状のまま提供されます。当方は、本サービスの正確性・完全性・有用性等について保証しません。本サービスの利用により生じた損害（データの消失、第三者サイトへのアクセス不能、業務の中断等を含む）について、当方は故意・重過失がある場合を除き責任を負いません。有料プランであっても、免責の範囲は法令の許す限り適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第8条（サービスの変更・停止）</h2>
            <p className="text-muted-foreground leading-relaxed">
              当方は、事前の通知なく、本サービスの内容の変更、一時停止、終了を行うことがあります。これによりユーザーに損害が生じた場合でも、当方は責任を負いません。終了に際して有料期間の残日数がある場合の返金の要否は、当方の定めるところによります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第9条（退会・データ）</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーは、当方の定める方法によりアカウント（利用）を解約することができます。解約後、当方は、一定期間を経たのちユーザーデータを削除することがあります。削除されたデータの復旧は行いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第10条（準拠法・管轄）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本規約の解釈・適用は日本法に準拠します。本サービスまたは本規約に関して紛争が生じた場合、当方の本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第11条（規約の変更）</h2>
            <p className="text-muted-foreground leading-relaxed">
              当方は、必要に応じて本規約を変更することがあります。変更後、本サービスの利用を継続した場合、変更後の規約に同意したものとみなします。重要な変更については、本サービス上での告知等によりお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">お問い合わせ</h2>
            <p className="text-muted-foreground leading-relaxed">
              本規約または本サービスに関するお問い合わせは、本サービス内の案内または当方が指定する方法にてご連絡ください。
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/login">ログインへ</Link>
          </Button>
          <Button asChild>
            <Link href="/pricing">料金を見る</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
