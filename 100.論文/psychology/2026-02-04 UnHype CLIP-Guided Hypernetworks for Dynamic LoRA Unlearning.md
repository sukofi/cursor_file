# UnHype: CLIP-Guided Hypernetworks for Dynamic LoRA Unlearning

## 概要 (Abstract)
近年の大規模拡散モデルの進展により、リアルである一方で有害または社会的混乱を引き起こすコンテンツの生成といった悪用の懸念が高まっています。この課題に対応するため、モデルの全体的な生成能力を損なうことなく特定の知識や概念を選択的に除去する「効果的な機械的忘却（マシン・アンスニング）」への関心が増しています。さまざまな手法の中で、Low-Rank Adaptation（LoRA）は、ターゲットとする忘却に向けたモデルの微調整において効果的かつ効率的な方法として注目されています。しかし、LoRAベースの手法は概念の意味的適応性に限界があり、密接に関連した概念の削除とより広範な意味での一般化の維持を両立させるのが難しいという課題があります。さらに、複数の概念を同時に消去する場合のスケーラビリティにも課題が存在します。これらの制約を克服するために、本研究では単一および複数概念のLoRAトレーニングにハイパーネットワークを組み込んだフレームワーク「UnHype」を提案します。本提案アーキテクチャはStable Diffusionや最新のフローに基づくテキストから画像へのモデルに直接組み込むことが可能で、安定したトレーニング挙動と効果的な概念制御を示します。推論時にはハイパーネットワークがCLIP埋め込みに基づき適応的なLoRA重みを動的に生成し、より文脈に応じたスケーラブルな忘却を可能にします。UnHypeの性能は対象物の消去、有名人の消去、露骨なコンテンツの除去など複数の難易度の高いタスクで評価され、その有効性と汎用性を実証しました。リポジトリ：https://github.com/gmum/UnHype 。

## 元のアブストラクト (Original Abstract)
Recent advances in large-scale diffusion models have intensified concerns about their potential misuse, particularly in generating realistic yet harmful or socially disruptive content. This challenge has spurred growing interest in effective machine unlearning, the process of selectively removing specific knowledge or concepts from a model without compromising its overall generative capabilities. Among various approaches, Low-Rank Adaptation (LoRA) has emerged as an effective and efficient method for fine-tuning models toward targeted unlearning. However, LoRA-based methods often exhibit limited adaptability to concept semantics and struggle to balance removing closely related concepts with maintaining generalization across broader meanings. Moreover, these methods face scalability challenges when multiple concepts must be erased simultaneously. To address these limitations, we introduce UnHype, a framework that incorporates hypernetworks into single- and multi-concept LoRA training. The proposed architecture can be directly plugged into Stable Diffusion as well as modern flow-based text-to-image models, where it demonstrates stable training behavior and effective concept control. During inference, the hypernetwork dynamically generates adaptive LoRA weights based on the CLIP embedding, enabling more context-aware, scalable unlearning. We evaluate UnHype across several challenging tasks, including object erasure, celebrity erasure, and explicit content removal, demonstrating its effectiveness and versatility. Repository: https://github.com/gmum/UnHype.

## 引用元 / リンク
- **arXiv URL**: [http://arxiv.org/abs/2602.03410v1](http://arxiv.org/abs/2602.03410v1)
- **PDF URL**: [https://arxiv.org/pdf/2602.03410v1](https://arxiv.org/pdf/2602.03410v1)

---
取得日: 2026-02-04
