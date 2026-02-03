"""
DataForSEO API クライアント
Google Organic SERPのtask方式での取得を行う
"""
import base64
import time
from typing import List, Dict, Any, Optional
import requests


class DataForSEOClient:
    """DataForSEO API クライアント"""
    
    BASE_URL = "https://api.dataforseo.com"
    
    def __init__(self, login: str, password: str):
        """
        Args:
            login: DataForSEO LOGIN
            password: DataForSEO PASSWORD
        """
        self.login = login
        self.password = password
        self.auth_header = self._create_auth_header()
    
    def _create_auth_header(self) -> str:
        """Basic認証ヘッダーを生成"""
        credentials = f"{self.login}:{self.password}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"
    
    def task_post(
        self,
        keywords: List[str],
        language_code: str,
        location_code: int,
        device: str,
        depth: int
    ) -> List[str]:
        """
        Google Organic SERPのtaskをPOSTする
        
        Args:
            keywords: キーワードリスト（最大100件）
            language_code: 言語コード（例: "ja"）
            location_code: ロケーションコード（例: 2392）
            device: デバイス（"desktop", "mobile"）
            depth: 取得順位の深さ（例: 10）
            
        Returns:
            投入されたtask_idのリスト
        """
        url = f"{self.BASE_URL}/v3/serp/google/organic/task_post"
        
        # タスクのペイロード作成
        tasks = []
        for kw in keywords:
            tasks.append({
                "keyword": kw,
                "language_code": language_code,
                "location_code": location_code,
                "device": device,
                "depth": depth
            })
        
        payload = tasks
        
        headers = {
            "Authorization": self.auth_header,
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            # task_idを抽出
            task_ids = []
            if result.get("status_code") == 20000:
                for task in result.get("tasks", []):
                    if task.get("status_code") == 20100:
                        task_id = task.get("id")
                        if task_id:
                            task_ids.append(task_id)
                    else:
                        print(f"[WARN] Task post failed: {task.get('status_message')}")
            else:
                print(f"[ERROR] API error: {result.get('status_message')}")
            
            return task_ids
            
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to post tasks: {e}")
            return []
    
    def tasks_ready(self) -> List[str]:
        """
        完了したtask_idのリストを取得
        
        Returns:
            完了したtask_idのリスト
        """
        url = f"{self.BASE_URL}/v3/serp/google/organic/tasks_ready"
        
        headers = {
            "Authorization": self.auth_header
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            print(f"[DEBUG] tasks_ready API status_code: {result.get('status_code')}")
            
            ready_task_ids = []
            if result.get("status_code") == 20000:
                tasks = result.get("tasks", [])
                print(f"[DEBUG] tasks_ready returned {len(tasks)} tasks")
                for task in tasks:
                    task_id = task.get("id")
                    if task_id:
                        ready_task_ids.append(task_id)
            else:
                print(f"[WARN] tasks_ready API error: {result.get('status_message')}")
            
            return ready_task_ids
            
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to check tasks_ready: {e}")
            return []
    
    def task_get(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        task_idの結果を取得
        
        Args:
            task_id: 取得対象のtask_id
            
        Returns:
            結果データ（失敗時はNone）
        """
        url = f"{self.BASE_URL}/v3/serp/google/organic/task_get/regular/{task_id}"
        
        headers = {
            "Authorization": self.auth_header
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            if result.get("status_code") == 20000:
                return result
            else:
                print(f"[ERROR] task_get failed for {task_id}: {result.get('status_message')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to get task {task_id}: {e}")
            return None
    
    def check_task_status(self, task_id: str) -> Optional[str]:
        """
        個別タスクのステータスを確認
        
        Args:
            task_id: タスクID
            
        Returns:
            ステータス文字列 ('completed', 'in_progress', 'failed', None)
        """
        result = self.task_get(task_id)
        if not result:
            return None
        
        tasks = result.get('tasks', [])
        if tasks:
            task_data = tasks[0]
            status_code = task_data.get('status_code')
            # 20000 = success/completed
            # 40000-49999 = client error
            # 50000-59999 = server error  
            if status_code == 20000:
                return 'completed'
            elif 40000 <= status_code < 50000:
                return 'failed'
            else:
                return 'in_progress'
        
        return None
    
    def wait_for_tasks(
        self,
        task_ids: List[str],
        poll_interval: int = 20,
        timeout: int = 900
    ) -> List[str]:
        """
        task_idsが完了するまでポーリングする
        
        Args:
            task_ids: 待機対象のtask_idリスト
            poll_interval: ポーリング間隔（秒）
            timeout: タイムアウト（秒）
            
        Returns:
            完了したtask_idのリスト
        """
        start_time = time.time()
        completed_tasks = set()
        remaining_tasks = set(task_ids)
        
        print(f"[INFO] Waiting for {len(task_ids)} tasks to complete...")
        print(f"[DEBUG] Task IDs: {task_ids[:3]}..." if len(task_ids) > 3 else f"[DEBUG] Task IDs: {task_ids}")
        
        while remaining_tasks:
            elapsed = time.time() - start_time
            if elapsed > timeout:
                print(f"[WARN] Timeout reached. {len(remaining_tasks)} tasks still pending.")
                break
            
            matched = 0  # 今回のチェックで完了したタスク数
            
            # 方法1: tasks_ready()でチェック
            ready_ids = self.tasks_ready()
            print(f"[DEBUG] tasks_ready() returned {len(ready_ids)} tasks")
            
            # 方法2: 各タスクのステータスを直接確認
            print(f"[DEBUG] Checking individual task status...")
            for task_id in list(remaining_tasks):
                if task_id in ready_ids:
                    # tasks_ready()に含まれている
                    completed_tasks.add(task_id)
                    remaining_tasks.remove(task_id)
                    matched += 1
                    print(f"[DEBUG] ✅ Task {task_id} completed (via tasks_ready)")
                else:
                    # 直接ステータスをチェック
                    status = self.check_task_status(task_id)
                    print(f"[DEBUG] Task {task_id}: status = {status}")
                    if status == 'completed':
                        completed_tasks.add(task_id)
                        remaining_tasks.remove(task_id)
                        matched += 1
                        print(f"[DEBUG] ✅ Task {task_id} completed (via direct check)")
                    elif status == 'failed':
                        print(f"[WARN] ❌ Task {task_id} failed!")
                        remaining_tasks.remove(task_id)  # 失敗したタスクも除外
            
            if matched > 0:
                print(f"[INFO] {len(completed_tasks)}/{len(task_ids)} tasks completed")
            
            if remaining_tasks:
                print(f"[INFO] {len(completed_tasks)}/{len(task_ids)} tasks completed. Waiting {poll_interval}s...")
                print(f"[DEBUG] Still waiting for: {list(remaining_tasks)[:3]}..." if len(remaining_tasks) > 3 else f"[DEBUG] Still waiting for: {list(remaining_tasks)}")
                time.sleep(poll_interval)
            else:
                print(f"[INFO] ✅ All tasks completed in {elapsed:.1f}s")
        
        return list(completed_tasks)
