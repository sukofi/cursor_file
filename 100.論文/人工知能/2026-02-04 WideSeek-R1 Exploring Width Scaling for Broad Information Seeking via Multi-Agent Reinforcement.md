---
title: "WideSeek-R1: Exploring Width Scaling for Broad Information Seeking via Multi-Agent Reinforcement Learning"
date: 2026-02-04
tags: [多エージェント強化学習, 大規模言語モデル, 情報探索, 幅方向拡張, 並列処理]
url: http://arxiv.org/abs/2602.04634v1
---

# WideSeek-R1: Exploring Width Scaling for Broad Information Seeking via Multi-Agent Reinforcement Learning

## 基本情報
- **著者**: Zelai Xu, Zhexuan Xu, Ruize Zhang, Chunyang Zhu, Shi Yu, Weilin Liu, Quanlu Zhang, Wenbo Ding, Chao Yu, Yu Wang
- **文献URL**: [http://arxiv.org/abs/2602.04634v1](http://arxiv.org/abs/2602.04634v1)
- **取得日**: 2026-02-04
- **タグ**: 多エージェント強化学習, 大規模言語モデル, 情報探索, 幅方向拡張, 並列処理

## アブストラクト（日本語訳）
近年の大規模言語モデル（LLM）の進展は、主に深さの拡張に注目しており、単一のエージェントが多段階の推論やツール利用を通じて長期的な問題を解決しています。しかし、タスクの範囲が広がるにつれて、個々の能力から組織的能力へのボトルネックが移行しています。本研究では、幅方向の拡張を補完的な視点として、多エージェントシステムによる幅広い情報探索を検討します。既存の多エージェントシステムは、手作業で設計されたワークフローやターン制の相互作用に依存しており、効果的な並列処理が困難です。このギャップを埋めるために、本論文ではMulti-Agent Reinforcement Learning（MARL）を用いて訓練されたリードエージェントとサブエージェントのフレームワークであるWideSeek-R1を提案します。WideSeek-R1は、共有LLMを用いながらも個別の文脈と専門化されたツールを活用し、大規模情報探索タスク2万件のデータセットに基づいてリードエージェントと並列サブエージェントを共同最適化します。広範な実験により、WideSeek-R1-4BはWideSearchベンチマークにおいて単一エージェントのDeepSeek-R1-671Bと同等のアイテムF1スコア40.0%を達成しました。さらに、並列サブエージェント数の増加に伴い一貫した性能向上を示し、幅方向の拡張の有効性を裏付けています。

## 原文（Abstract）
Recent advancements in Large Language Models (LLMs) have largely focused on depth scaling, where a single agent solves long-horizon problems with multi-turn reasoning and tool use. However, as tasks grow broader, the key bottleneck shifts from individual competence to organizational capability. In this work, we explore a complementary dimension of width scaling with multi-agent systems to address broad information seeking. Existing multi-agent systems often rely on hand-crafted workflows and turn-taking interactions that fail to parallelize work effectively. To bridge this gap, we propose WideSeek-R1, a lead-agent-subagent framework trained via multi-agent reinforcement learning (MARL) to synergize scalable orchestration and parallel execution. By utilizing a shared LLM with isolated contexts and specialized tools, WideSeek-R1 jointly optimizes the lead agent and parallel subagents on a curated dataset of 20k broad information-seeking tasks. Extensive experiments show that WideSeek-R1-4B achieves an item F1 score of 40.0% on the WideSearch benchmark, which is comparable to the performance of single-agent DeepSeek-R1-671B. Furthermore, WideSeek-R1-4B exhibits consistent performance gains as the number of parallel subagents increases, highlighting the effectiveness of width scaling.
