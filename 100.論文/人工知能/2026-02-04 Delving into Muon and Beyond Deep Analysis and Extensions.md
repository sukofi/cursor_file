---
title: "Delving into Muon and Beyond: Deep Analysis and Extensions"
date: 2026-02-04
tags: [最適化アルゴリズム, スペクトル解析, Muオン最適化, 適応学習率, 深層学習]
url: http://arxiv.org/abs/2602.04669v1
---

# Delving into Muon and Beyond: Deep Analysis and Extensions

## 基本情報
- **著者**: Xianbiao Qi, Marco Chen, Jiaquan Ye, Yelin He, Rong Xiao
- **文献URL**: [http://arxiv.org/abs/2602.04669v1](http://arxiv.org/abs/2602.04669v1)
- **取得日**: 2026-02-04
- **タグ**: 最適化アルゴリズム, スペクトル解析, Muオン最適化, 適応学習率, 深層学習

## アブストラクト（日本語訳）
Muオン最適化手法は、行列形式のパラメータに対する直交化された更新を用いることで高い実証的性能を示し、近年注目を集めています。しかし、その基礎となるメカニズムやAdamなどの適応的最適化手法との関係性は十分に解明されていません。本研究では、これらの疑問に統一的なスペクトル解析の視点からアプローチします。具体的には、Muオンをスペクトル変換の族のp=0に相当する終端点とみなし、p=1/2、p=1/4、p=1といった追加のバリエーションも考察します。これらの変換は、Momentum SGDにみられるような一次モーメントの更新およびAdamにおける二乗平均平方根（RMS）正規化勾配の両方に適用されます。効率的な計算を可能にするために、明示的な特異値分解を回避する連立ニュートン反復法を開発しました。制御された実験を通じて、RMS正規化更新の方が一次モーメント更新よりも最適化の安定性が高いことを確認しました。さらに、スペクトル圧縮は一次モーメント更新において強力な安定化効果をもたらす一方で、Muオン更新（p=0）が常にAdamを上回るわけではないことがわかりました。これらの結果は、Muオンが普遍的に優れた最適化手法というよりも、効果的なスペクトル正規化の一形態として理解するのが適切であることを示唆しています。ソースコードはhttps://github.com/Ocram7/BeyondMuon にて公開予定です。

## 原文（Abstract）
The Muon optimizer has recently attracted considerable attention for its strong empirical performance and use of orthogonalized updates on matrix-shaped parameters, yet its underlying mechanisms and relationship to adaptive optimizers such as Adam remain insufficiently understood. In this work, we aim to address these questions through a unified spectral perspective. Specifically, we view Muon as the p = 0 endpoint of a family of spectral transformations of the form U \boldsymbolΣ^{p} V' , and consider additional variants with p = 1/2 , p = 1/4 , and p = 1 . These transformations are applied to both first-moment updates, as in momentum SGD, and to root-mean-square (RMS) normalized gradient updates as in Adam. To enable efficient computation, we develop a coupled Newton iteration that avoids explicit singular value decomposition. Across controlled experiments, we find that RMS-normalized updates yield more stable optimization than first-moment updates. Moreover, while spectral compression provides strong stabilization benefits under first-moment updates, the Muon update (p = 0) does not consistently outperform Adam. These results suggest that Muon is best understood as an effective form of spectral normalization, but not a universally superior optimization method. Our source code will be released at https://github.com/Ocram7/BeyondMuon.
