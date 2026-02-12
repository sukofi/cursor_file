'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import type { Project } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/auth/UserMenu';
import { Plus, FolderOpen, Trash2, Edit2, Grid3X3, Loader2 } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

export function Dashboard() {
  const { projects, selectProject, deleteProject, fetchProjects, isLoadingProjects } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 初回ロード時にプロジェクトを取得
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenProject = (projectId: string) => {
    selectProject(projectId);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('このプロジェクトを削除しますか？')) {
      await deleteProject(projectId);
    }
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3X3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">内部リンクマトリクス</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleNewProject}>
                <Plus className="h-4 w-4 mr-2" />
                新規プロジェクト
              </Button>
              <div className="border-l pl-3">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {isLoadingProjects ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">プロジェクトを読み込み中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">プロジェクトがありません</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              スプレッドシートの設定を保存して、複数のサイトの内部リンクを管理できます。
            </p>
            <Button onClick={handleNewProject} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              最初のプロジェクトを作成
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 新規プロジェクトカード */}
            <Card
              className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-center min-h-[200px]"
              onClick={handleNewProject}
            >
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium">新規プロジェクト</p>
                <p className="text-sm text-muted-foreground">クリックして作成</p>
              </CardContent>
            </Card>

            {/* 既存プロジェクトカード */}
            {projects
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate text-lg">{project.name}</CardTitle>
                        {project.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-normal">
                          シート: {project.sheetSettings.sheetName}
                        </Badge>
                      </div>
                      <p className="truncate text-xs">
                        ID: {project.sheetSettings.spreadsheetId.slice(0, 20)}...
                      </p>
                      <p className="text-xs">
                        更新: {formatDate(project.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2 pt-3 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      <FolderOpen className="h-4 w-4 mr-1" />
                      開く
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        )}
      </main>

      {/* プロジェクト作成/編集モーダル */}
      <ProjectModal
        open={isModalOpen}
        onClose={handleCloseModal}
        editingProject={editingProject}
      />
    </div>
  );
}
