---
title: "They Said Memes Were Harmless-We Found the Ones That Hurt: Decoding Jokes, Symbols, and Cultural References"
date: 2026-02-04
tags: [ミーム解析, ソーシャルアビューズ検出, マルチモーダル学習, 文化的象徴, 解釈可能性]
url: http://arxiv.org/abs/2602.03822v1
---

# They Said Memes Were Harmless-We Found the Ones That Hurt: Decoding Jokes, Symbols, and Cultural References

## 基本情報
- **著者**: Sahil Tripathi, Gautam Siddharth Kashyap, Mehwish Nasim, Jian Yang, Jiechao Gao, Usman Naseem
- **文献URL**: [http://arxiv.org/abs/2602.03822v1](http://arxiv.org/abs/2602.03822v1)
- **取得日**: 2026-02-04
- **タグ**: ミーム解析, ソーシャルアビューズ検出, マルチモーダル学習, 文化的象徴, 解釈可能性

## アブストラクト（日本語訳）
ミームを用いたソーシャルアビューズ（社会的虐待）の検出は、害意がしばしば暗示的な文化的象徴や微妙な異種モーダルの不整合に依存するため、非常に困難です。従来の手法は、融合ベースの方法や大規模視覚言語モデル（LVLMs）を活用したコンテクスト内学習などが進展を示していますが、以下の三つの課題により依然として限界があります。すなわち、（i）文化的盲点（象徴的文脈の欠如）、（ii）境界の曖昧さ（風刺と虐待の識別困難）、（iii）解釈可能性の欠如（モデルの推論過程が不透明）です。本研究では、これらの課題に体系的に対応する三段階の枠組み「CROSS-ALIGN+」を提案します。第一段階では、ConceptNet、Wikidata、Hatebaseといった構造化知識を活用し、多モーダル表現の文化的文脈を強化して文化的盲点を軽減します。第二段階では、パラメータ効率の良いLoRAアダプターを用いることで、決定境界を明確にし、境界の曖昧さを低減します。第三段階では、連鎖的な説明生成により解釈可能性を向上させます。五つのベンチマークと八つのLVLMに渡る大規模な実験により、CROSS-ALIGN+は最先端手法を一貫して上回り、最大で17%の相対F1値向上を達成しながら、各判断に対する解釈可能な根拠を提供することを示しました。

## 原文（Abstract）
Meme-based social abuse detection is challenging because harmful intent often relies on implicit cultural symbolism and subtle cross-modal incongruence. Prior approaches, from fusion-based methods to in-context learning with Large Vision-Language Models (LVLMs), have made progress but remain limited by three factors: i) cultural blindness (missing symbolic context), ii) boundary ambiguity (satire vs. abuse confusion), and iii) lack of interpretability (opaque model reasoning). We introduce CROSS-ALIGN+, a three-stage framework that systematically addresses these limitations: (1) Stage I mitigates cultural blindness by enriching multimodal representations with structured knowledge from ConceptNet, Wikidata, and Hatebase; (2) Stage II reduces boundary ambiguity through parameter-efficient LoRA adapters that sharpen decision boundaries; and (3) Stage III enhances interpretability by generating cascaded explanations. Extensive experiments on five benchmarks and eight LVLMs demonstrate that CROSS-ALIGN+ consistently outperforms state-of-the-art methods, achieving up to 17% relative F1 improvement while providing interpretable justifications for each decision.
