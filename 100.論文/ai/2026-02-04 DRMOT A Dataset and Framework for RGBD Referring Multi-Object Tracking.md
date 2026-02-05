---
title: "DRMOT: A Dataset and Framework for RGBD Referring Multi-Object Tracking"
date: 2026-02-04
tags: [参照型多対象追跡, RGBDデータセット, 深度情報融合, 自然言語処理, 空間認識]
url: http://arxiv.org/abs/2602.04692v1
---

# DRMOT: A Dataset and Framework for RGBD Referring Multi-Object Tracking

## 基本情報
- **著者**: Sijia Chen, Lijuan Ma, Yanqiu Yu, En Yu, Liman Liu, Wenbing Tao
- **文献URL**: [http://arxiv.org/abs/2602.04692v1](http://arxiv.org/abs/2602.04692v1)
- **取得日**: 2026-02-04
- **タグ**: 参照型多対象追跡, RGBDデータセット, 深度情報融合, 自然言語処理, 空間認識

## アブストラクト（日本語訳）
参照型多対象追跡（Referring Multi-Object Tracking, RMOT）は、言語による記述に基づいて特定の対象を追跡することを目的としており、ロボティクスや自動運転などのインタラクティブAIシステムにとって重要な技術です。しかし、既存のRMOTモデルは2DのRGBデータのみに依存しているため、「カメラに最も近い人物」のような複雑な空間的意味を持つ対象の正確な検出や関連付け、さらに厳しい遮蔽条件下での信頼性の高い識別を維持することが困難でした。これは明示的な3D空間情報が欠如しているためです。本研究では、RGB、深度（Depth）、言語（Language）の3つのモダリティを統合し、3D認識を可能にするモデルが求められる新たな課題「RGBD参照型多対象追跡（DRMOT）」を提案します。DRMOTの研究を促進するために、我々は空間意味的な根付けと追跡能力の評価に特化したRGBD参照型多対象追跡データセット「DRSet」を構築しました。具体的には、DRSetは187シーンのRGB画像と深度マップ、240の言語記述を含み、そのうち56件は深度に関する情報を含んでいます。さらに、我々は多言語大規模モデル（MLLM）を活用し、RGB-D-Lの統合入力から深度に基づくターゲット根付けと深度情報を利用した頑健な軌跡関連付けを行う深度参照型追跡フレームワーク「DRTrack」を提案します。DRSetデータセットを用いた大規模な実験により、本フレームワークの有効性が実証されました。

## 原文（Abstract）
Referring Multi-Object Tracking (RMOT) aims to track specific targets based on language descriptions and is vital for interactive AI systems such as robotics and autonomous driving. However, existing RMOT models rely solely on 2D RGB data, making it challenging to accurately detect and associate targets characterized by complex spatial semantics (e.g., ``the person closest to the camera'') and to maintain reliable identities under severe occlusion, due to the absence of explicit 3D spatial information. In this work, we propose a novel task, RGBD Referring Multi-Object Tracking (DRMOT), which explicitly requires models to fuse RGB, Depth (D), and Language (L) modalities to achieve 3D-aware tracking. To advance research on the DRMOT task, we construct a tailored RGBD referring multi-object tracking dataset, named DRSet, designed to evaluate models' spatial-semantic grounding and tracking capabilities. Specifically, DRSet contains RGB images and depth maps from 187 scenes, along with 240 language descriptions, among which 56 descriptions incorporate depth-related information. Furthermore, we propose DRTrack, a MLLM-guided depth-referring tracking framework. DRTrack performs depth-aware target grounding from joint RGB-D-L inputs and enforces robust trajectory association by incorporating depth cues. Extensive experiments on the DRSet dataset demonstrate the effectiveness of our framework.
