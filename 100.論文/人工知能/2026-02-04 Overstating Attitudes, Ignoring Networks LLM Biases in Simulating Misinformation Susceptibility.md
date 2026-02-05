---
title: "Overstating Attitudes, Ignoring Networks: LLM Biases in Simulating Misinformation Susceptibility"
date: 2026-02-04
tags: [大規模言語モデル, 誤情報, 社会調査, バイアス, 人間判断]
url: http://arxiv.org/abs/2602.04674v1
---

# Overstating Attitudes, Ignoring Networks: LLM Biases in Simulating Misinformation Susceptibility

## 基本情報
- **著者**: Eun Cheol Choi, Lindsay E. Young, Emilio Ferrara
- **文献URL**: [http://arxiv.org/abs/2602.04674v1](http://arxiv.org/abs/2602.04674v1)
- **取得日**: 2026-02-04
- **タグ**: 大規模言語モデル, 誤情報, 社会調査, バイアス, 人間判断

## アブストラクト（日本語訳）
大規模言語モデル（LLM）は計算社会科学において人間の判断の代理としてますます利用されているが、誤情報に対する感受性のパターンを再現する能力は依然として不明である。本研究では、社会調査データから抽出したネットワーク、人口統計、態度、行動的特徴を含む参加者プロファイルを用いてプロンプトされたLLMによる調査回答者のシミュレーションが、人間の誤情報信念と共有のパターンを再現できるかを検証する。3つのオンライン調査を基準として、LLMの出力が実際の回答分布と一致し、元の調査データに存在する特徴と結果の関連を回復するかどうかを評価した。LLM生成の回答は広範な分布傾向を捉え、人間の回答と適度な相関を示したが、信念と共有の関連性を一貫して過大評価した。シミュレーション回答に適用した線形モデルは説明変数の分散説明度が著しく高く、態度的および行動的特徴に過剰な重みを置く一方で、人間の回答に基づくモデルと比較して個人のネットワーク特性をほとんど無視していた。モデル生成の推論とLLMの訓練データの分析から、これらの歪みは誤情報関連概念の表現における体系的バイアスを反映していることが示唆された。我々の知見は、LLMベースの調査シミュレーションが人間の判断からの系統的な乖離を診断するには適しているが、人間の判断に代替するには不十分であることを示している。

## 原文（Abstract）
Large language models (LLMs) are increasingly used as proxies for human judgment in computational social science, yet their ability to reproduce patterns of susceptibility to misinformation remains unclear. We test whether LLM-simulated survey respondents, prompted with participant profiles drawn from social survey data measuring network, demographic, attitudinal and behavioral features, can reproduce human patterns of misinformation belief and sharing. Using three online surveys as baselines, we evaluate whether LLM outputs match observed response distributions and recover feature-outcome associations present in the original survey data. LLM-generated responses capture broad distributional tendencies and show modest correlation with human responses, but consistently overstate the association between belief and sharing. Linear models fit to simulated responses exhibit substantially higher explained variance and place disproportionate weight on attitudinal and behavioral features, while largely ignoring personal network characteristics, relative to models fit to human responses. Analyses of model-generated reasoning and LLM training data suggest that these distortions reflect systematic biases in how misinformation-related concepts are represented. Our findings suggest that LLM-based survey simulations are better suited for diagnosing systematic divergences from human judgment than for substituting it.
