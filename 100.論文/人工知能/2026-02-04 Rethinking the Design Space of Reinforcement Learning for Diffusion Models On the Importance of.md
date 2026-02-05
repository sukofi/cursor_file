---
title: "Rethinking the Design Space of Reinforcement Learning for Diffusion Models: On the Importance of Likelihood Estimation Beyond Loss Design"
date: 2026-02-04
tags: [強化学習, 拡散モデル, 尤度推定, ポリシー勾配, テキストから画像生成]
url: http://arxiv.org/abs/2602.04663v1
---

# Rethinking the Design Space of Reinforcement Learning for Diffusion Models: On the Importance of Likelihood Estimation Beyond Loss Design

## 基本情報
- **著者**: Jaemoo Choi, Yuchen Zhu, Wei Guo, Petr Molodyk, Bo Yuan, Jinbin Bai, Yi Xin, Molei Tao, Yongxin Chen
- **文献URL**: [http://arxiv.org/abs/2602.04663v1](http://arxiv.org/abs/2602.04663v1)
- **取得日**: 2026-02-04
- **タグ**: 強化学習, 拡散モデル, 尤度推定, ポリシー勾配, テキストから画像生成

## アブストラクト（日本語訳）
強化学習は、テキストから画像生成などの視覚的タスクにおいて、拡散モデルやフローモデルに広く応用されています。しかし、拡散モデルは確率を直接扱うことが難しいため、一般的なポリシー勾配法の適用に制約があり、これらのタスクは依然として困難を伴います。従来の手法は、既に高度に設計された大規模言語モデルの目的関数を基盤にして新しい目的関数を作成し、尤度の評価には独自の推定器を用いてきましたが、その推定方法がアルゴリズム全体の性能にどのように影響するかについては十分な検討が行われていませんでした。本研究では、強化学習の設計空間を体系的に分析し、i) ポリシー勾配の目的関数、ii) 尤度推定器、iii) ロールアウトサンプリング手法という三つの要因に分解して考察します。その結果、最終的に生成されたサンプルのみから計算される証拠下限（ELBO）に基づくモデル尤度推定器を採用することが、特定のポリシー勾配損失関数の選択よりも重要であり、効果的かつ効率的で安定した強化学習の最適化を可能にする支配的な要因であることを示しました。この知見は、SD 3.5 Mediumを用いた複数の報酬ベンチマークで検証され、すべてのタスクにおいて一貫した傾向が観察されました。我々の手法は、GenEvalスコアを90 GPU時間で0.24から0.95に改善し、FlowGRPOに比べて4.6倍、報酬の不正操作なしでDiffusionNFTの最先端法に比べて2倍の効率性を実現しました。

## 原文（Abstract）
Reinforcement learning has been widely applied to diffusion and flow models for visual tasks such as text-to-image generation. However, these tasks remain challenging because diffusion models have intractable likelihoods, which creates a barrier for directly applying popular policy-gradient type methods. Existing approaches primarily focus on crafting new objectives built on already heavily engineered LLM objectives, using ad hoc estimators for likelihood, without a thorough investigation into how such estimation affects overall algorithmic performance. In this work, we provide a systematic analysis of the RL design space by disentangling three factors: i) policy-gradient objectives, ii) likelihood estimators, and iii) rollout sampling schemes. We show that adopting an evidence lower bound (ELBO) based model likelihood estimator, computed only from the final generated sample, is the dominant factor enabling effective, efficient, and stable RL optimization, outweighing the impact of the specific policy-gradient loss functional. We validate our findings across multiple reward benchmarks using SD 3.5 Medium, and observe consistent trends across all tasks. Our method improves the GenEval score from 0.24 to 0.95 in 90 GPU hours, which is $4.6\times$ more efficient than FlowGRPO and $2\times$ more efficient than the SOTA method DiffusionNFT without reward hacking.
