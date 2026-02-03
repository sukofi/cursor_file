"""
視覚的な比較レポート生成モジュール
DiscordのEmbedとチャートで見やすく表示
"""
import discord
from typing import Dict, Any, List


class ComparisonReportGenerator:
    """比較レポートを視覚的に生成"""
    
    @staticmethod
    def create_comparison_embed(
        keyword: str,
        own_rank: int,
        comparison_data: Dict[str, Any]
    ) -> List[discord.Embed]:
        """
        比較結果のEmbedを生成
        
        Args:
            keyword: キーワード
            own_rank: 自社順位
            comparison_data: 比較データ
            
        Returns:
            Embedのリスト
        """
        embeds = []
        
        if not comparison_data or 'own' not in comparison_data:
            return embeds
        
        own = comparison_data['own']
        competitors = comparison_data.get('competitors', [])
        summary = comparison_data.get('summary', {})
        
        # メインEmbed
        main_embed = discord.Embed(
            title=f"📊 コンテンツ分析: {keyword}",
            description=f"**自社順位**: {own_rank}位\n**分析対象**: 上位{len(competitors)}サイト",
            color=discord.Color.blue()
        )
        
        # 自社記事の情報
        main_embed.add_field(
            name="🏠 自社記事",
            value=f"**見出し数**: {own['heading_count']}個\n"
                  f"**文字数**: {own['text_length']:,}文字\n"
                  f"**画像数**: {own['image_count']}枚\n"
                  f"**内部リンク**: {own['internal_link_count']}個",
            inline=True
        )
        
        # 競合平均
        if summary and 'competitor_avg' in summary:
            avg = summary['competitor_avg']
            main_embed.add_field(
                name="🎯 競合平均",
                value=f"**見出し数**: {avg['headings']:.1f}個\n"
                      f"**文字数**: {avg['text_length']:,.0f}文字\n"
                      f"**画像数**: {avg['images']:.1f}枚\n"
                      f"**内部リンク**: {avg['internal_links']:.1f}個",
                inline=True
            )
        
        # 差分分析
        if summary:
            diff_text = []
            
            heading_diff = summary.get('heading_diff', 0)
            if heading_diff < 0:
                diff_text.append(f"❌ 見出し: {abs(heading_diff):.1f}個 **不足**")
            elif heading_diff > 0:
                diff_text.append(f"✅ 見出し: {heading_diff:.1f}個 多い")
            else:
                diff_text.append(f"➖ 見出し: 同等")
            
            text_diff = summary.get('text_length_diff', 0)
            if text_diff < 0:
                diff_text.append(f"❌ 文字数: {abs(text_diff):,.0f}文字 **不足**")
            elif text_diff > 500:
                diff_text.append(f"✅ 文字数: {text_diff:,.0f}文字 多い")
            else:
                diff_text.append(f"➖ 文字数: 同等")
            
            image_diff = summary.get('image_diff', 0)
            if image_diff < 0:
                diff_text.append(f"❌ 画像: {abs(image_diff):.1f}枚 **不足**")
            elif image_diff > 0:
                diff_text.append(f"✅ 画像: {image_diff:.1f}枚 多い")
            else:
                diff_text.append(f"➖ 画像: 同等")
            
            link_diff = summary.get('internal_link_diff', 0)
            if link_diff < 0:
                diff_text.append(f"❌ 内部リンク: {abs(link_diff):.1f}個 **不足**")
            elif link_diff > 0:
                diff_text.append(f"✅ 内部リンク: {link_diff:.1f}個 多い")
            else:
                diff_text.append(f"➖ 内部リンク: 同等")
            
            main_embed.add_field(
                name="📈 競合との差分",
                value="\n".join(diff_text),
                inline=False
            )
        
        embeds.append(main_embed)
        
        # 改善提案Embed
        if summary:
            recommendations = ComparisonReportGenerator._generate_recommendations(summary)
            if recommendations:
                rec_embed = discord.Embed(
                    title="💡 改善提案",
                    description=recommendations,
                    color=discord.Color.green()
                )
                embeds.append(rec_embed)
        
        # 競合詳細Embed
        if competitors:
            comp_embed = discord.Embed(
                title="🎯 上位競合の詳細",
                color=discord.Color.orange()
            )
            
            for i, comp in enumerate(competitors[:3], 1):
                comp_embed.add_field(
                    name=f"{i}位の記事",
                    value=f"見出し: {comp['heading_count']}個 | "
                          f"文字: {comp['text_length']:,} | "
                          f"画像: {comp['image_count']}枚 | "
                          f"内部リンク: {comp['internal_link_count']}個\n"
                          f"[{comp['url'][:50]}...]({comp['url']})",
                    inline=False
                )
            
            embeds.append(comp_embed)
        
        return embeds
    
    @staticmethod
    def _generate_recommendations(summary: Dict[str, Any]) -> str:
        """改善提案を生成"""
        recommendations = []
        
        heading_diff = summary.get('heading_diff', 0)
        if heading_diff < -2:
            recommendations.append(
                f"📝 **見出しを追加**\n"
                f"   競合より約{abs(heading_diff):.0f}個少ない状態です。\n"
                f"   H2/H3見出しを追加してコンテンツを構造化しましょう。"
            )
        
        text_diff = summary.get('text_length_diff', 0)
        if text_diff < -500:
            recommendations.append(
                f"✍️ **コンテンツを充実させる**\n"
                f"   競合より約{abs(text_diff):,.0f}文字少ない状態です。\n"
                f"   詳細な説明、事例、FAQ等を追加しましょう。"
            )
        
        image_diff = summary.get('image_diff', 0)
        if image_diff < -2:
            recommendations.append(
                f"🖼️ **画像を追加**\n"
                f"   競合より約{abs(image_diff):.0f}枚少ない状態です。\n"
                f"   図解、スクリーンショット、商品画像等を追加しましょう。"
            )
        
        link_diff = summary.get('internal_link_diff', 0)
        if link_diff < -3:
            recommendations.append(
                f"🔗 **内部リンクを強化**\n"
                f"   競合より約{abs(link_diff):.0f}個少ない状態です。\n"
                f"   関連記事への内部リンクを追加しましょう。"
            )
        
        if not recommendations:
            return "✅ 競合と同等以上のコンテンツ品質です！\n他の要因（E-E-A-T、被リンク、技術的SEO等）を確認しましょう。"
        
        return "\n\n".join(recommendations)
    
    @staticmethod
    def create_visual_chart(comparison_data: Dict[str, Any]) -> str:
        """
        ASCIIアート風のチャートを生成
        
        Args:
            comparison_data: 比較データ
            
        Returns:
            チャート文字列
        """
        if not comparison_data or 'own' not in comparison_data:
            return ""
        
        own = comparison_data['own']
        summary = comparison_data.get('summary', {})
        
        if not summary or 'competitor_avg' not in summary:
            return ""
        
        avg = summary['competitor_avg']
        
        chart = "```\n"
        chart += "         自社  vs  競合平均\n"
        chart += "=" * 40 + "\n"
        
        # 見出し数
        own_bar = "█" * int(own['heading_count'] / 2)
        comp_bar = "█" * int(avg['headings'] / 2)
        chart += f"見出し   {own_bar} {own['heading_count']}\n"
        chart += f"         {comp_bar} {avg['headings']:.0f}\n\n"
        
        # 文字数 (1000文字単位)
        own_bar = "█" * int(own['text_length'] / 1000)
        comp_bar = "█" * int(avg['text_length'] / 1000)
        chart += f"文字数   {own_bar} {own['text_length']:,}\n"
        chart += f"         {comp_bar} {avg['text_length']:,.0f}\n\n"
        
        # 画像数
        own_bar = "█" * own['image_count']
        comp_bar = "█" * int(avg['images'])
        chart += f"画像     {own_bar} {own['image_count']}\n"
        chart += f"         {comp_bar} {avg['images']:.0f}\n\n"
        
        # 内部リンク
        own_bar = "█" * int(own['internal_link_count'] / 2)
        comp_bar = "█" * int(avg['internal_links'] / 2)
        chart += f"リンク   {own_bar} {own['internal_link_count']}\n"
        chart += f"         {comp_bar} {avg['internal_links']:.0f}\n"
        
        chart += "```"
        
        return chart
