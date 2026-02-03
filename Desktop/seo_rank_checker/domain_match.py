"""
ドメインマッチング用モジュール
URLからhostnameを抽出し、target_domainと一致するかを判定
"""
from urllib.parse import urlparse
from typing import Optional


def extract_hostname(url: str) -> Optional[str]:
    """
    URLからhostnameを抽出する
    
    Args:
        url: チェック対象のURL
        
    Returns:
        hostname（抽出できない場合はNone）
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if hostname:
            return hostname.lower()
        return None
    except Exception:
        return None


def is_own_domain(url: str, target_domain: str) -> bool:
    """
    URLが自社ドメインかどうかを判定
    
    Args:
        url: チェック対象のURL
        target_domain: 自社ドメイン（例: "example.com"）
        
    Returns:
        自社ドメインならTrue、それ以外はFalse
    """
    hostname = extract_hostname(url)
    if not hostname:
        return False
    
    target_lower = target_domain.lower()
    
    # 完全一致 or サブドメイン一致
    if hostname == target_lower:
        return True
    
    if hostname.endswith("." + target_lower):
        return True
    
    return False
