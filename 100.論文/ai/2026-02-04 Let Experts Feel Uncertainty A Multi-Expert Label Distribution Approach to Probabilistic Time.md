---
title: "Let Experts Feel Uncertainty: A Multi-Expert Label Distribution Approach to Probabilistic Time Series Forecasting"
date: 2026-02-04
tags: [時系列予測, 不確実性定量化, 多専門家学習, 分布学習, 解釈可能性]
url: http://arxiv.org/abs/2602.04678v1
---

# Let Experts Feel Uncertainty: A Multi-Expert Label Distribution Approach to Probabilistic Time Series Forecasting

## 基本情報
- **著者**: Zhen Zhou, Zhirui Wang, Qi Hong, Yunyang Shi, Ziyuan Gu, Zhiyuan Liu
- **文献URL**: [http://arxiv.org/abs/2602.04678v1](http://arxiv.org/abs/2602.04678v1)
- **取得日**: 2026-02-04
- **タグ**: 時系列予測, 不確実性定量化, 多専門家学習, 分布学習, 解釈可能性

## アブストラクト（日本語訳）
時系列予測は、実世界の応用において高い予測精度と解釈可能な不確実性の定量化の両立が求められます。従来の点予測手法は時系列データに内在する不確実性を十分に捉えられないことが多く、既存の確率的アプローチは計算効率と解釈性の両立に課題があります。本研究では、分布学習機能を備えた専門家混合モデルを用いてこれらの課題に対処する新しい多専門家学習分布ラベル（LDL）フレームワークを提案します。提案手法は二つの相補的な方法を導入します。(1)異なるパラメータで学習された複数の専門家を用いて多様な時間的パターンを捉える多専門家LDL、(2)時系列をトレンド、季節性、変化点、ボラティリティといった解釈可能な構成要素に明示的に分解する専門サブネットワークを持つパターン認識LDL-MoEです。両フレームワークは従来の点予測を分布学習に拡張し、最大平均差異（MMD）を用いた豊富な不確実性定量化を可能にします。M5データセット由来の集計販売データを用いた評価において、提案手法はベースラインを上回る性能を示しました。連続的な多専門家LDLは全体最良の精度を達成し、一方でパターン認識LDL-MoEは成分別解析による解釈性の向上を実現しました。本フレームワークは予測精度と解釈性を両立させ、性能と実用的洞察が共に重要となる実世界の予測タスクに適しています。

## 原文（Abstract）
Time series forecasting in real-world applications requires both high predictive accuracy and interpretable uncertainty quantification. Traditional point prediction methods often fail to capture the inherent uncertainty in time series data, while existing probabilistic approaches struggle to balance computational efficiency with interpretability. We propose a novel Multi-Expert Learning Distributional Labels (LDL) framework that addresses these challenges through mixture-of-experts architectures with distributional learning capabilities. Our approach introduces two complementary methods: (1) Multi-Expert LDL, which employs multiple experts with different learned parameters to capture diverse temporal patterns, and (2) Pattern-Aware LDL-MoE, which explicitly decomposes time series into interpretable components (trend, seasonality, changepoints, volatility) through specialized sub-experts. Both frameworks extend traditional point prediction to distributional learning, enabling rich uncertainty quantification through Maximum Mean Discrepancy (MMD). We evaluate our methods on aggregated sales data derived from the M5 dataset, demonstrating superior performance compared to baseline approaches. The continuous Multi-Expert LDL achieves the best overall performance, while the Pattern-Aware LDL-MoE provides enhanced interpretability through component-wise analysis. Our frameworks successfully balance predictive accuracy with interpretability, making them suitable for real-world forecasting applications where both performance and actionable insights are crucial.
