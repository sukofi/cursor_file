# Generator-based Graph Generation via Heat Diffusion

## 概要 (Abstract)
グラフ生成モデリングは、化学、生物学、ソーシャルネットワーク、知識表現など幅広い応用分野において不可欠な課題となっています。本研究では、Generator Matching（arXiv:2410.20587）のパラダイムをグラフ構造データに適用した新しいグラフ生成フレームワークを提案します。我々はグラフラプラシアンとそれに関連するヒートカーネルを活用し、各グラフ上で連続時間拡散を定義します。ラプラシアンはこの拡散の無限小生成子として機能し、そのヒートカーネルは初期グラフの条件付き摂動のファミリーを提供します。ニューラルネットワークは、真の生成子と学習可能な代理生成子との間のブレグマン発散を最小化することで、この生成子のマッチングを学習します。学習後、この代理生成子を用いて時間反転拡散過程をシミュレーションし、新たなグラフ構造をサンプリングします。我々のフレームワークは既存の拡散ベースのグラフ生成モデルを統合かつ一般化し、ラプラシアンを通じてドメイン固有の帰納的バイアスを注入しつつ、ニューラル近似器の柔軟性を維持します。実験的検証により、本手法が実際および合成グラフの構造的特性を効果的に捉えることが示されました。

## 元のアブストラクト (Original Abstract)
Graph generative modelling has become an essential task due to the wide range of applications in chemistry, biology, social networks, and knowledge representation. In this work, we propose a novel framework for generating graphs by adapting the Generator Matching (arXiv:2410.20587) paradigm to graph-structured data. We leverage the graph Laplacian and its associated heat kernel to define a continous-time diffusion on each graph. The Laplacian serves as the infinitesimal generator of this diffusion, and its heat kernel provides a family of conditional perturbations of the initial graph. A neural network is trained to match this generator by minimising a Bregman divergence between the true generator and a learnable surrogate. Once trained, the surrogate generator is used to simulate a time-reversed diffusion process to sample new graph structures. Our framework unifies and generalises existing diffusion-based graph generative models, injecting domain-specific inductive bias via the Laplacian, while retaining the flexibility of neural approximators. Experimental studies demonstrate that our approach captures structural properties of real and synthetic graphs effectively.

## 引用元 / リンク
- **arXiv URL**: [http://arxiv.org/abs/2602.03612v1](http://arxiv.org/abs/2602.03612v1)
- **PDF URL**: [https://arxiv.org/pdf/2602.03612v1](https://arxiv.org/pdf/2602.03612v1)

---
取得日: 2026-02-04
