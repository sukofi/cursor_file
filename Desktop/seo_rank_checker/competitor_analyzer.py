"""
競合記事分析モジュール
自社より上位の競合記事のコンテンツを分析
"""
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from typing import Dict, Any, Optional, List
import time
import re


class CompetitorAnalyzer:
    """競合記事の詳細分析"""
    
    def __init__(self, use_selenium: bool = True):
        """
        Args:
            use_selenium: JavaScriptレンダリングにSeleniumを使用するか
        """
        self.use_selenium = use_selenium
        self.driver = None
        
        if use_selenium:
            self._setup_selenium()
    
    def _setup_selenium(self):
        """Seleniumのセットアップ"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("[INFO] Selenium WebDriver initialized")
        except Exception as e:
            print(f"[WARN] Failed to initialize Selenium: {e}")
            print("[WARN] Falling back to requests-only mode")
            self.use_selenium = False
    
    def analyze_url(self, url: str) -> Optional[Dict[str, Any]]:
        """
        URLを分析してコンテンツ情報を取得
        
        Args:
            url: 分析対象のURL
            
        Returns:
            分析結果の辞書
        """
        try:
            if self.use_selenium and self.driver:
                html = self._fetch_with_selenium(url)
            else:
                html = self._fetch_with_requests(url)
            
            if not html:
                return None
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # 分析実行
            analysis = {
                'url': url,
                'title': self._get_title(soup),
                'heading_count': self._count_headings(soup),
                'heading_breakdown': self._analyze_headings(soup),
                'text_length': self._count_text_length(soup),
                'image_count': self._count_images(soup),
                'internal_link_count': self._count_internal_links(soup, url),
                'external_link_count': self._count_external_links(soup, url),
                'meta_description': self._get_meta_description(soup),
            }
            
            return analysis
            
        except Exception as e:
            print(f"[ERROR] Failed to analyze {url}: {e}")
            return None
    
    def _fetch_with_selenium(self, url: str, timeout: int = 10) -> Optional[str]:
        """SeleniumでページをレンダリングしてHTMLを取得"""
        try:
            self.driver.get(url)
            
            # ページ読み込み待機
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # 少し待機してJavaScriptの実行を待つ
            time.sleep(2)
            
            html = self.driver.page_source
            return html
            
        except Exception as e:
            print(f"[ERROR] Selenium fetch failed: {e}")
            return None
    
    def _fetch_with_requests(self, url: str) -> Optional[str]:
        """requestsでHTMLを取得"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.text
            
        except Exception as e:
            print(f"[ERROR] Requests fetch failed: {e}")
            return None
    
    def _get_title(self, soup: BeautifulSoup) -> str:
        """タイトルを取得"""
        title = soup.find('title')
        return title.get_text().strip() if title else ''
    
    def _count_headings(self, soup: BeautifulSoup) -> int:
        """見出しの総数をカウント"""
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        return len(headings)
    
    def _analyze_headings(self, soup: BeautifulSoup) -> Dict[str, int]:
        """見出しをレベル別に分析"""
        breakdown = {
            'h1': len(soup.find_all('h1')),
            'h2': len(soup.find_all('h2')),
            'h3': len(soup.find_all('h3')),
            'h4': len(soup.find_all('h4')),
            'h5': len(soup.find_all('h5')),
            'h6': len(soup.find_all('h6')),
        }
        return breakdown
    
    def _count_text_length(self, soup: BeautifulSoup) -> int:
        """本文の文字数をカウント"""
        # scriptとstyleタグを除外
        for script in soup(['script', 'style', 'nav', 'header', 'footer']):
            script.decompose()
        
        text = soup.get_text()
        # 空白文字を正規化
        text = re.sub(r'\s+', ' ', text)
        return len(text.strip())
    
    def _count_images(self, soup: BeautifulSoup) -> int:
        """画像数をカウント"""
        images = soup.find_all('img')
        return len(images)
    
    def _count_internal_links(self, soup: BeautifulSoup, base_url: str) -> int:
        """内部リンク数をカウント"""
        from urllib.parse import urlparse
        
        base_domain = urlparse(base_url).netloc
        links = soup.find_all('a', href=True)
        
        internal_count = 0
        for link in links:
            href = link['href']
            if href.startswith('/') or base_domain in href:
                internal_count += 1
        
        return internal_count
    
    def _count_external_links(self, soup: BeautifulSoup, base_url: str) -> int:
        """外部リンク数をカウント"""
        from urllib.parse import urlparse
        
        base_domain = urlparse(base_url).netloc
        links = soup.find_all('a', href=True)
        
        external_count = 0
        for link in links:
            href = link['href']
            if href.startswith('http') and base_domain not in href:
                external_count += 1
        
        return external_count
    
    def _get_meta_description(self, soup: BeautifulSoup) -> str:
        """メタディスクリプションを取得"""
        meta = soup.find('meta', attrs={'name': 'description'})
        if meta and meta.get('content'):
            return meta['content']
        return ''
    
    def compare_articles(
        self,
        own_url: str,
        competitor_urls: List[str]
    ) -> Dict[str, Any]:
        """
        自社記事と競合記事を比較
        
        Args:
            own_url: 自社記事のURL
            competitor_urls: 競合記事のURLリスト
            
        Returns:
            比較結果
        """
        print(f"\n[INFO] Analyzing own article: {own_url}")
        own_analysis = self.analyze_url(own_url)
        
        if not own_analysis:
            print("[ERROR] Failed to analyze own article")
            return {}
        
        competitors_analysis = []
        for i, url in enumerate(competitor_urls, 1):
            print(f"[INFO] Analyzing competitor {i}/{len(competitor_urls)}: {url}")
            analysis = self.analyze_url(url)
            if analysis:
                competitors_analysis.append(analysis)
            time.sleep(1)  # レート制限対策
        
        # 比較結果を生成
        comparison = {
            'own': own_analysis,
            'competitors': competitors_analysis,
            'summary': self._generate_comparison_summary(own_analysis, competitors_analysis)
        }
        
        return comparison
    
    def _generate_comparison_summary(
        self,
        own: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """比較サマリーを生成"""
        if not competitors:
            return {}
        
        # 競合の平均値を計算
        avg_headings = sum(c['heading_count'] for c in competitors) / len(competitors)
        avg_text_length = sum(c['text_length'] for c in competitors) / len(competitors)
        avg_images = sum(c['image_count'] for c in competitors) / len(competitors)
        avg_internal_links = sum(c['internal_link_count'] for c in competitors) / len(competitors)
        
        summary = {
            'heading_diff': own['heading_count'] - avg_headings,
            'text_length_diff': own['text_length'] - avg_text_length,
            'image_diff': own['image_count'] - avg_images,
            'internal_link_diff': own['internal_link_count'] - avg_internal_links,
            'competitor_avg': {
                'headings': avg_headings,
                'text_length': avg_text_length,
                'images': avg_images,
                'internal_links': avg_internal_links,
            }
        }
        
        return summary
    
    def close(self):
        """リソースをクリーンアップ"""
        if self.driver:
            self.driver.quit()
    
    def __del__(self):
        """デストラクタ"""
        self.close()
