---
title: "細粒度な音声生成と編集のためのAudio ControlNet"
original_title: "Audio ControlNet for Fine-Grained Audio Generation and Editing"
date: 2026-02-04
tags: [音声生成, 音声編集, 制御可能生成, テキスト音声変換, ControlNet]
url: http://arxiv.org/abs/2602.04680v1
---

# 細粒度な音声生成と編集のためのAudio ControlNet

## 基本情報
- **元のタイトル**: Audio ControlNet for Fine-Grained Audio Generation and Editing
- **著者**: Haina Zhu, Yao Xiao, Xiquan Li, Ziyang Ma, Jianwei Yu, Bowen Zhang, Mingqi Yang, Xie Chen
- **文献URL**: [http://arxiv.org/abs/2602.04680v1](http://arxiv.org/abs/2602.04680v1)
- **取得日**: 2026-02-04
- **タグ**: 音声生成, 音声編集, 制御可能生成, テキスト音声変換, ControlNet

## アブストラクト（日本語訳）
本研究では、テキストから音声を生成する細粒度制御（T2A）タスクを検討する。近年のモデルはテキスト記述から高品質な音声合成を実現しているものの、音量やピッチ、音響イベントといった属性を正確に制御する能力に欠けていることが多い。従来のアプローチが特定の制御タイプに対してモデルを再学習するのに対し、本研究では事前学習済みのT2Aバックボーン上にControlNetモデルを構築し、音量、ピッチ、イベントの発生を制御可能な生成を実現する。さらに、T2A-ControlNetとT2A-Adapterという2種類の設計を提案し、特にT2A-Adapterモデルが優れた制御能力を持ちつつ効率的な構造であることを示す。わずか3800万の追加パラメータで、T2A-AdapterはAudioSet-StrongのイベントレベルおよびセグメントレベルのF1スコアにおいて最先端の性能を達成した。加えて、本フレームワークを音声の編集にも拡張し、指示による時間指定での音響イベントの削除・挿入を可能にするT2A-Editorを提案する。今後の制御可能な音声生成および編集の研究を支援するため、モデル、コード、データセットパイプライン、ベンチマークを公開予定である。

## 原文（Abstract）
We study the fine-grained text-to-audio (T2A) generation task. While recent models can synthesize high-quality audio from text descriptions, they often lack precise control over attributes such as loudness, pitch, and sound events. Unlike prior approaches that retrain models for specific control types, we propose to train ControlNet models on top of pre-trained T2A backbones to achieve controllable generation over loudness, pitch, and event roll. We introduce two designs, T2A-ControlNet and T2A-Adapter, and show that the T2A-Adapter model offers a more efficient structure with strong control ability. With only 38M additional parameters, T2A-Adapter achieves state-of-the-art performance on the AudioSet-Strong in both event-level and segment-level F1 scores. We further extend this framework to audio editing, proposing T2A-Editor for removing and inserting audio events at time locations specified by instructions. Models, code, dataset pipelines, and benchmarks will be released to support future research on controllable audio generation and editing.
