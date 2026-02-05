# No Shortcuts to Culture: Indonesian Multi-hop Question Answering for Complex Cultural Understanding

## 基本情報
- **著者**: Vynska Amalia Permadi, Xingwei Tan, Nafise Sadat Moosavi, Nikos Aletras
- **文献URL**: [http://arxiv.org/abs/2602.03709v1](http://arxiv.org/abs/2602.03709v1)
- **取得日**: 2026-02-04

## アブストラクト（日本語訳）
文化理解は、単に個別の事実を記憶するだけでなく、文脈、伝統、暗黙の社会的知識にわたる推論を必要とします。しかし、これまでの文化に焦点を当てた多くの質問応答（QA）ベンチマークは、一段階の質問に依存しており、モデルが表面的な手がかりを利用することを許し、本質的な文化的推論を示すには至っていません。本研究では、インドネシアの伝統に基づき、英語とインドネシア語の両言語で提供される、LLMの文化理解力を評価するための初の大規模多段階QAデータセット「ID-MoCQA」を提案します。本データセット構築のため、新たなフレームワークを導入し、単一段階の文化的質問を常識的知識、時間的推論、地理的知識など6種類の手がかりにまたがる多段階推論連鎖へ体系的に変換しました。専門家によるレビューとLLMを評価者としたフィルタリングを組み合わせた多段階検証パイプラインにより、高品質な質問応答ペアを保証しています。最先端モデル群を用いた評価の結果、特に微妙な推論を要するタスクにおいて文化的推論能力に大きなギャップが存在することが明らかとなりました。ID-MoCQAは、LLMの文化的能力向上を促進するための挑戦的かつ重要なベンチマークを提供します。

## 原文（Abstract）
Understanding culture requires reasoning across context, tradition, and implicit social knowledge, far beyond recalling isolated facts. Yet most culturally focused question answering (QA) benchmarks rely on single-hop questions, which may allow models to exploit shallow cues rather than demonstrate genuine cultural reasoning. In this work, we introduce ID-MoCQA, the first large-scale multi-hop QA dataset for assessing the cultural understanding of large language models (LLMs), grounded in Indonesian traditions and available in both English and Indonesian. We present a new framework that systematically transforms single-hop cultural questions into multi-hop reasoning chains spanning six clue types (e.g., commonsense, temporal, geographical). Our multi-stage validation pipeline, combining expert review and LLM-as-a-judge filtering, ensures high-quality question-answer pairs. Our evaluation across state-of-the-art models reveals substantial gaps in cultural reasoning, particularly in tasks requiring nuanced inference. ID-MoCQA provides a challenging and essential benchmark for advancing the cultural competency of LLMs.
