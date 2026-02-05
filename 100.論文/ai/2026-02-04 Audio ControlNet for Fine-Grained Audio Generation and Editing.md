---
title: "Audio ControlNet for Fine-Grained Audio Generation and Editing"
date: 2026-02-04
tags: [テキスト音声合成, 制御可能生成, 音響イベント編集, ControlNet, ディープラーニング]
url: http://arxiv.org/abs/2602.04680v1
---

# Audio ControlNet for Fine-Grained Audio Generation and Editing

## 基本情報
- **著者**: Haina Zhu, Yao Xiao, Xiquan Li, Ziyang Ma, Jianwei Yu, Bowen Zhang, Mingqi Yang, Xie Chen
- **文献URL**: [http://arxiv.org/abs/2602.04680v1](http://arxiv.org/abs/2602.04680v1)
- **取得日**: 2026-02-04
- **タグ**: テキスト音声合成, 制御可能生成, 音響イベント編集, ControlNet, ディープラーニング

## アブストラクト（日本語訳）
本研究では、細粒度のテキストから音声への生成（T2A）タスクを検討します。近年のモデルはテキスト記述から高品質な音声合成を可能にしていますが、音量や音高、音響イベントといった属性の正確な制御が困難です。従来の手法が特定の制御タイプごとにモデルを再訓練するのに対し、本研究は事前学習済みのT2Aバックボーン上にControlNetモデルを重ねて学習することで、音量、音高、イベントの細かな制御を実現します。具体的には、T2A-ControlNetとT2A-Adapterの2つの設計を提案し、そのうちT2A-Adapterは効率的な構造で強力な制御能力を発揮することを示しました。追加パラメータわずか3800万で、T2A-AdapterはAudioSet-StrongのイベントレベルおよびセグメントレベルのF1スコアで最先端の性能を達成しています。さらに本フレームワークを音声編集へ拡張し、指示された時間位置における音響イベントの削除・挿入を可能にするT2A-Editorを提案します。今後の制御可能な音声生成および編集の研究を支援するため、モデル、コード、データセットパイプライン、ベンチマークを公開予定です。

## 原文（Abstract）
We study the fine-grained text-to-audio (T2A) generation task. While recent models can synthesize high-quality audio from text descriptions, they often lack precise control over attributes such as loudness, pitch, and sound events. Unlike prior approaches that retrain models for specific control types, we propose to train ControlNet models on top of pre-trained T2A backbones to achieve controllable generation over loudness, pitch, and event roll. We introduce two designs, T2A-ControlNet and T2A-Adapter, and show that the T2A-Adapter model offers a more efficient structure with strong control ability. With only 38M additional parameters, T2A-Adapter achieves state-of-the-art performance on the AudioSet-Strong in both event-level and segment-level F1 scores. We further extend this framework to audio editing, proposing T2A-Editor for removing and inserting audio events at time locations specified by instructions. Models, code, dataset pipelines, and benchmarks will be released to support future research on controllable audio generation and editing.
