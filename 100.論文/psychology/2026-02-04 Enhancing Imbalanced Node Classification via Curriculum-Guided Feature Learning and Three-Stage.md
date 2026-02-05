---
title: "Enhancing Imbalanced Node Classification via Curriculum-Guided Feature Learning and Three-Stage Attention Network"
date: 2026-02-04
tags: [グラフニューラルネットワーク, 不均衡分類, カリキュラム学習, アテンション機構, 特徴学習]
url: http://arxiv.org/abs/2602.03808v1
---

# Enhancing Imbalanced Node Classification via Curriculum-Guided Feature Learning and Three-Stage Attention Network

## 基本情報
- **著者**: Abdul Joseph Fofanah, Lian Wen, David Chen, Shaoyang Zhang
- **文献URL**: [http://arxiv.org/abs/2602.03808v1](http://arxiv.org/abs/2602.03808v1)
- **取得日**: 2026-02-04
- **タグ**: グラフニューラルネットワーク, 不均衡分類, カリキュラム学習, アテンション機構, 特徴学習

## アブストラクト（日本語訳）
グラフニューラルネットワーク（GNN）における不均衡なノード分類は、特定のラベルが他のラベルに比べて圧倒的に多い場合に発生し、その結果、モデルが不公平な学習を行い、少数派クラスの性能が著しく低下します。本研究では、この問題を解決するために、人間の学習過程に類似した3段階のアテンション機構（Engage, Enact, Embed）を有するカリキュラム指導型特徴学習と三段階アテンションネットワーク（CL3AN-GNN）を提案します。モデルはまず、（1）局所近傍パターン（1ホップ）、（2）低次数ノード属性、（3）初期のグラフ畳み込みネットワーク（GCN）およびグラフアテンションネットワーク（GAT）埋め込みによって特定されたクラス識別可能なノードペアといった、構造的に単純な特徴から学習を開始します。この基盤により、ラベルの偏りがあっても安定した初期学習が可能になります。次にEnact段階では、（1）多段ステップを必要とする接続、（2）異種ノードを繋ぐエッジ、（3）少数クラスの境界に位置するノードに対して調整可能なアテンション重みを適用し、より複雑な特徴を扱います。最後にEmbed段階で、これらの特徴を反復的なメッセージパッシングとカリキュラムに基づく損失重み付けにより統合します。CL3AN-GNNは、社会的、生命科学的、引用ネットワークにまたがる8つのOpen Graph Benchmarkデータセットで評価され、最新の最先端手法に比べて精度、F1スコア、AUCの全指標で一貫した改善を示しました。本モデルの段階的学習手法は、多様なグラフデータセットにおいて単一段階学習よりも学習速度が速く、新たな不均衡グラフへの汎化性能が高く、勾配安定性やアテンション相関の学習曲線を用いた明確な各段階の説明を可能にします。本研究は、GNNにおけるカリキュラム学習の理論的枠組みと、不均衡問題に対する実用的かつ有効なアプローチを、評価指標、収束速度、および汎化テストを通じて実証しています。

## 原文（Abstract）
Imbalanced node classification in graph neural networks (GNNs) happens when some labels are much more common than others, which causes the model to learn unfairly and perform badly on the less common classes. To solve this problem, we propose a Curriculum-Guided Feature Learning and Three-Stage Attention Network (CL3AN-GNN), a learning network that uses a three-step attention system (Engage, Enact, Embed) similar to how humans learn. The model begins by engaging with structurally simpler features, defined as (1) local neighbourhood patterns (1-hop), (2) low-degree node attributes, and (3) class-separable node pairs identified via initial graph convolutional networks and graph attention networks (GCN and GAT) embeddings. This foundation enables stable early learning despite label skew. The Enact stage then addresses complicated aspects: (1) connections that require multiple steps, (2) edges that connect different types of nodes, and (3) nodes at the edges of minority classes by using adjustable attention weights. Finally, Embed consolidates these features via iterative message passing and curriculum-aligned loss weighting. We evaluate CL3AN-GNN on eight Open Graph Benchmark datasets spanning social, biological, and citation networks. Experiments show consistent improvements across all datasets in accuracy, F1-score, and AUC over recent state-of-the-art methods. The model's step-by-step method works well with different types of graph datasets, showing quicker results than training everything at once, better performance on new, imbalanced graphs, and clear explanations of each step using gradient stability and attention correlation learning curves. This work provides both a theoretically grounded framework for curriculum learning in GNNs and practical evidence of its effectiveness against imbalances, validated through metrics, convergence speeds, and generalisation tests.
