"""
Discord Webhook通知モジュール
"""
import requests
from typing import List, Dict, Any, Optional


class DiscordNotifier:
    """Discord Webhookで通知を送信"""
    
    MAX_MESSAGE_LENGTH = 1900  # Discordの制限は2000だが余裕を持たせる
    
    def __init__(self, webhook_url: str):
        """
        Args:
            webhook_url: Discord Webhook URL
        """
        self.webhook_url = webhook_url
    
    def send_rank_drop_report(
        self,
        dropped_keywords: List[Dict[str, Any]],
        out_of_ranking_keywords: List[Dict[str, Any]],
        checked_at: str,
        ai_analysis: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        順位下落レポートを送信
        
        Args:
            dropped_keywords: 下落したキーワード情報のリスト
            out_of_ranking_keywords: 圏外落ちしたキーワード情報のリスト
            checked_at: チェック日時
            ai_analysis: AI分析結果（オプション）
            
        Returns:
            送信成功ならTrue
        """
        if not dropped_keywords and not out_of_ranking_keywords:
            # 下落なしの場合も通知
            message = self._create_no_change_message(checked_at)
            return self._send_message(message)
        
        # メッセージを構築
        messages = self._build_report_messages(
            dropped_keywords,
            out_of_ranking_keywords,
            checked_at,
            ai_analysis
        )
        
        # 複数メッセージに分割して送信
        success = True
        for msg in messages:
            if not self._send_message(msg):
                success = False
        
        return success
    
    def _create_no_change_message(self, checked_at: str) -> str:
        """下落なしメッセージを作成"""
        return f"""## 📊 順位チェック結果

**実行日時**: {checked_at}

✅ **下落したキーワードはありませんでした**
"""
    
    def _build_report_messages(
        self,
        dropped_keywords: List[Dict[str, Any]],
        out_of_ranking_keywords: List[Dict[str, Any]],
        checked_at: str,
        ai_analysis: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        レポートメッセージを構築（長い場合は分割）
        
        Returns:
            メッセージのリスト
        """
        messages = []
        
        # ヘッダー
        header = f"""## 📊 順位チェック結果

**実行日時**: {checked_at}

"""
        
        current_message = header
        
        # AI分析結果を追加
        if ai_analysis:
            ai_section = self._format_ai_analysis(ai_analysis)
            if len(current_message) + len(ai_section) > self.MAX_MESSAGE_LENGTH:
                messages.append(current_message)
                current_message = ai_section
            else:
                current_message += ai_section
        
        # 下落キーワード
        if dropped_keywords:
            section_header = f"### ⚠️ 順位下落キーワード ({len(dropped_keywords)}件)\n\n"
            
            # ヘッダーを追加できるかチェック
            if len(current_message) + len(section_header) > self.MAX_MESSAGE_LENGTH:
                messages.append(current_message)
                current_message = section_header
            else:
                current_message += section_header
            
            for kw_data in dropped_keywords:
                kw_block = self._format_dropped_keyword(kw_data)
                
                # メッセージが長くなりすぎる場合は分割
                if len(current_message) + len(kw_block) > self.MAX_MESSAGE_LENGTH:
                    messages.append(current_message)
                    current_message = kw_block
                else:
                    current_message += kw_block
        
        # 圏外落ちキーワード
        if out_of_ranking_keywords:
            section_header = f"\n### 🚫 圏外落ちキーワード ({len(out_of_ranking_keywords)}件)\n\n"
            
            if len(current_message) + len(section_header) > self.MAX_MESSAGE_LENGTH:
                messages.append(current_message)
                current_message = section_header
            else:
                current_message += section_header
            
            for kw_data in out_of_ranking_keywords:
                kw_block = self._format_out_of_ranking_keyword(kw_data)
                
                if len(current_message) + len(kw_block) > self.MAX_MESSAGE_LENGTH:
                    messages.append(current_message)
                    current_message = kw_block
                else:
                    current_message += kw_block
        
        # 最後のメッセージを追加
        if current_message:
            messages.append(current_message)
        
        return messages
    
    def _format_dropped_keyword(self, kw_data: Dict[str, Any]) -> str:
        """下落キーワードのフォーマット"""
        keyword = kw_data['keyword']
        prev_rank = kw_data['previous_rank']
        curr_rank = kw_data['current_rank']
        own_url = kw_data.get('own_url', 'N/A')
        competitors = kw_data.get('competitors_above', [])
        
        lines = [
            f"**キーワード**: `{keyword}`",
            f"**順位変動**: {prev_rank}位 → {curr_rank}位 (▼{curr_rank - prev_rank})",
            f"**自社URL**: {own_url}"
        ]
        
        if competitors:
            lines.append("**上位競合**:")
            for comp in competitors:
                rank = comp.get('rank', '?')
                url = comp.get('url', 'N/A')
                # URLが長い場合は省略
                if len(url) > 80:
                    url = url[:77] + "..."
                lines.append(f"  {rank}位: {url}")
        
        # 競合分析結果を追加
        competitor_analysis = kw_data.get('competitor_analysis')
        if competitor_analysis and competitor_analysis.get('summary'):
            lines.append("")
            lines.append(self._format_competitor_analysis(competitor_analysis))
        
        lines.append("")  # 空行
        
        return "\n".join(lines) + "\n"
    
    def _format_out_of_ranking_keyword(self, kw_data: Dict[str, Any]) -> str:
        """圏外落ちキーワードのフォーマット"""
        keyword = kw_data['keyword']
        prev_rank = kw_data['previous_rank']
        last_url = kw_data.get('last_url', 'N/A')
        
        lines = [
            f"**キーワード**: `{keyword}`",
            f"**順位変動**: {prev_rank}位 → 圏外",
            f"**前回URL**: {last_url}",
            ""
        ]
        
        return "\n".join(lines) + "\n"
    
    def _format_ai_analysis(self, ai_analysis: Dict[str, Any]) -> str:
        """AI分析結果のフォーマット"""
        sections = []
        
        sections.append("### 🤖 AI分析結果\n")
        
        # サマリー
        if ai_analysis.get('summary'):
            sections.append(f"**📝 サマリー**\n{ai_analysis['summary']}\n")
        
        # トレンド分析
        if ai_analysis.get('trends'):
            sections.append(f"**📈 トレンド分析**\n{ai_analysis['trends']}\n")
        
        # 改善提案
        if ai_analysis.get('recommendations'):
            sections.append(f"**💡 改善提案**\n{ai_analysis['recommendations']}\n")
        
        # 優先キーワード
        priority = ai_analysis.get('priority_keywords', [])
        if priority:
            sections.append("**⚡ 優先対応キーワード**")
            for i, kw in enumerate(priority[:5], 1):
                sections.append(f"{i}. `{kw}`")
            sections.append("")
        
        sections.append("---\n")
        
        return "\n".join(sections)
    
    def _format_competitor_analysis(self, analysis: Dict[str, Any]) -> str:
        """競合分析結果のフォーマット"""
        lines = ["**📊 競合との差分分析** (今回):"]
        
        own = analysis.get('own', {})
        summary = analysis.get('summary', {})
        
        if not summary or 'competitor_avg' not in summary:
            return ""
        
        avg = summary['competitor_avg']
        
        # 自社vs競合平均
        lines.append(f"```")
        lines.append(f"{'項目':<12} {'自社':>8} {'競合平均':>8} {'差分':>8}")
        lines.append(f"{'-'*40}")
        
        # 見出し数
        heading_diff = summary.get('heading_diff', 0)
        diff_sign = "+" if heading_diff >= 0 else ""
        lines.append(f"{'見出し数':<12} {own.get('heading_count', 0):>8} {avg.get('headings', 0):>8.0f} {diff_sign}{heading_diff:>7.0f}")
        
        # 文字数
        text_diff = summary.get('text_length_diff', 0)
        diff_sign = "+" if text_diff >= 0 else ""
        lines.append(f"{'文字数':<12} {own.get('text_length', 0):>8,} {avg.get('text_length', 0):>8,.0f} {diff_sign}{text_diff:>7,.0f}")
        
        # 画像数
        image_diff = summary.get('image_diff', 0)
        diff_sign = "+" if image_diff >= 0 else ""
        lines.append(f"{'画像数':<12} {own.get('image_count', 0):>8} {avg.get('images', 0):>8.0f} {diff_sign}{image_diff:>7.0f}")
        
        # 内部リンク
        link_diff = summary.get('internal_link_diff', 0)
        diff_sign = "+" if link_diff >= 0 else ""
        lines.append(f"{'内部リンク':<12} {own.get('internal_link_count', 0):>8} {avg.get('internal_links', 0):>8.0f} {diff_sign}{link_diff:>7.0f}")
        
        lines.append(f"```")
        
        # 改善提案
        recommendations = []
        if heading_diff < -2:
            recommendations.append(f"  • 見出しを約{abs(heading_diff):.0f}個追加")
        if text_diff < -500:
            recommendations.append(f"  • 約{abs(text_diff):,.0f}文字のコンテンツを追加")
        if image_diff < -2:
            recommendations.append(f"  • 画像を約{abs(image_diff):.0f}枚追加")
        if link_diff < -3:
            recommendations.append(f"  • 内部リンクを約{abs(link_diff):.0f}個追加")
        
        if recommendations:
            lines.append("**💡 改善提案**:")
            lines.extend(recommendations)
        else:
            lines.append("**✅ 競合と同等以上のコンテンツ品質です**")
        
        return "\n".join(lines)
    
    def _send_message(self, content: str) -> bool:
        """
        Webhookにメッセージを送信
        
        Args:
            content: メッセージ内容
            
        Returns:
            成功ならTrue
        """
        payload = {
            "content": content
        }
        
        try:
            response = requests.post(
                self.webhook_url,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            print(f"[INFO] Discord notification sent successfully")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to send Discord notification: {e}")
            return False
