---
title: "DRMOT：RGBD言及型複数物体追跡のためのデータセットとフレームワーク"
original_title: "DRMOT: A Dataset and Framework for RGBD Referring Multi-Object Tracking"
date: 2026-02-04
tags: [複数物体追跡, RGBDセンサー, 言語指示追跡, 3次元空間認識, 深度情報融合]
url: http://arxiv.org/abs/2602.04692v1
---

# DRMOT：RGBD言及型複数物体追跡のためのデータセットとフレームワーク

## 基本情報
- **元のタイトル**: DRMOT: A Dataset and Framework for RGBD Referring Multi-Object Tracking
- **著者**: Sijia Chen, Lijuan Ma, Yanqiu Yu, En Yu, Liman Liu, Wenbing Tao
- **文献URL**: [http://arxiv.org/abs/2602.04692v1](http://arxiv.org/abs/2602.04692v1)
- **取得日**: 2026-02-04
- **タグ**: 複数物体追跡, RGBDセンサー, 言語指示追跡, 3次元空間認識, 深度情報融合

## アブストラクト（日本語訳）
言語による記述を基に特定の対象を追跡する言及型複数物体追跡（RMOT）は、ロボット工学や自動運転などの対話型AIシステムにおいて重要です。しかし、既存のRMOTモデルは2DのRGBデータのみに依存しているため、「カメラに最も近い人物」のような複雑な空間的意味を持つ対象の正確な検出や関連付けが難しく、さらに3D空間情報が明示的に存在しないことから、重度の遮蔽時でも信頼性のある識別を維持することが困難です。本研究では、RGB、深度（Depth, D）、言語（Language, L）の情報を融合し、3Dに対応した追跡を達成することを明示的に要求する新たな課題、RGBD言及型複数物体追跡（DRMOT）を提案します。DRMOTの研究を促進するために、空間意味の基盤付けと追跡能力の評価に特化した専用のRGBD言及型複数物体追跡データセット「DRSet」を構築しました。DRSetは187のシーンから得られたRGB画像と深度マップ、240件の言語記述を含み、そのうち56件は深度に関する情報を含んでいます。さらに、DRTrackと呼ばれるMLLM（マルチモーダル大規模言語モデル）にガイドされた深度言及追跡フレームワークを提案します。DRTrackはRGB-D-Lの統合入力から深度対応のターゲット基盤付けを行い、深度情報を活用して堅牢な軌跡関連付けを実現します。DRSetデータセットにおける多数の実験により、本フレームワークの有効性が実証されました。

## 原文（Abstract）
Referring Multi-Object Tracking (RMOT) aims to track specific targets based on language descriptions and is vital for interactive AI systems such as robotics and autonomous driving. However, existing RMOT models rely solely on 2D RGB data, making it challenging to accurately detect and associate targets characterized by complex spatial semantics (e.g., ``the person closest to the camera'') and to maintain reliable identities under severe occlusion, due to the absence of explicit 3D spatial information. In this work, we propose a novel task, RGBD Referring Multi-Object Tracking (DRMOT), which explicitly requires models to fuse RGB, Depth (D), and Language (L) modalities to achieve 3D-aware tracking. To advance research on the DRMOT task, we construct a tailored RGBD referring multi-object tracking dataset, named DRSet, designed to evaluate models' spatial-semantic grounding and tracking capabilities. Specifically, DRSet contains RGB images and depth maps from 187 scenes, along with 240 language descriptions, among which 56 descriptions incorporate depth-related information. Furthermore, we propose DRTrack, a MLLM-guided depth-referring tracking framework. DRTrack performs depth-aware target grounding from joint RGB-D-L inputs and enforces robust trajectory association by incorporating depth cues. Extensive experiments on the DRSet dataset demonstrate the effectiveness of our framework.
