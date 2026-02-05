# They Said Memes Were Harmless-We Found the Ones That Hurt: Decoding Jokes, Symbols, and Cultural References

## 基本情報
- **著者**: Sahil Tripathi, Gautam Siddharth Kashyap, Mehwish Nasim, Jian Yang, Jiechao Gao, Usman Naseem
- **文献URL**: [http://arxiv.org/abs/2602.03822v1](http://arxiv.org/abs/2602.03822v1)
- **取得日**: 2026-02-04

## アブストラクト（日本語訳）
ミームベースの社会的虐待検出は、有害な意図がしばしば暗黙の文化的象徴性や微妙なクロスモーダルの不整合に依存するため困難である。これまでの融合ベースの手法や大規模視覚言語モデル（LVLM）を用いたインコンテキスト学習によるアプローチは一定の進展を見せているが、以下の三つの要因により依然として限界があった：①文化的盲点（象徴的文脈の見落とし）、②境界の曖昧さ（風刺と虐待の混同）、③解釈可能性の欠如（モデルの推論過程が不透明）。本研究では、これらの課題に体系的に対応する三段階のフレームワーク「CROSS-ALIGN+」を提案する。第1段階では、ConceptNet、Wikidata、Hatebaseからの構造化知識を用いて多モーダル表現を豊かにし、文化的盲点を緩和する。第2段階では、パラメータ効率の良いLoRAアダプターを用いて判定境界を鋭くし、境界の曖昧さを低減する。第3段階では、連鎖的な説明生成により解釈可能性を高める。5つのベンチマークと8つのLVLMに対する広範な実験により、CROSS-ALIGN+は最先端手法を一貫して上回り、最大17%の相対的F1向上を達成するとともに、各判断に対して解釈可能な根拠を提供することを示した。

## 原文（Abstract）
Meme-based social abuse detection is challenging because harmful intent often relies on implicit cultural symbolism and subtle cross-modal incongruence. Prior approaches, from fusion-based methods to in-context learning with Large Vision-Language Models (LVLMs), have made progress but remain limited by three factors: i) cultural blindness (missing symbolic context), ii) boundary ambiguity (satire vs. abuse confusion), and iii) lack of interpretability (opaque model reasoning). We introduce CROSS-ALIGN+, a three-stage framework that systematically addresses these limitations: (1) Stage I mitigates cultural blindness by enriching multimodal representations with structured knowledge from ConceptNet, Wikidata, and Hatebase; (2) Stage II reduces boundary ambiguity through parameter-efficient LoRA adapters that sharpen decision boundaries; and (3) Stage III enhances interpretability by generating cascaded explanations. Extensive experiments on five benchmarks and eight LVLMs demonstrate that CROSS-ALIGN+ consistently outperforms state-of-the-art methods, achieving up to 17% relative F1 improvement while providing interpretable justifications for each decision.
