# One Model, All Roles: Multi-Turn, Multi-Agent Self-Play Reinforcement Learning for Conversational Social Intelligence

## 基本情報
- **著者**: Bowen Jiang, Taiwei Shi, Ryo Kamoi, Yuan Yuan, Camillo J. Taylor, Longqi Yang, Pei Zhou, Sihao Chen
- **文献URL**: [http://arxiv.org/abs/2602.03109v1](http://arxiv.org/abs/2602.03109v1)
- **取得日**: 2026-02-04

## アブストラクト（日本語訳）
本論文では、OMAR（One Model, All Roles）という強化学習フレームワークを提案する。OMARは、マルチターンかつマルチエージェントの対話的セルフプレイを通じて、AIに社会的知性を獲得させるものである。従来の静的かつ単一ターン最適化に依存するパラダイムとは異なり、OMARは単一モデルが会話の全参加者の役割を同時に演じることを可能とし、動的な社会的相互作用から長期的目標や複雑な社会規範を直接学習する。長大な対話における学習の安定性を確保するために、ターン単位およびトークン単位のアドバンテージを計算する階層的アドバンテージ推定を実装している。社会環境SOTOPIAおよび人狼戦略ゲームでの評価により、我々の学習モデルは共感、説得、妥協追求といった細やかで自発的な社会的知性を獲得し、競合状況下においても協調を学習する有効性を示した。報酬の不正利用等の実務的課題は確認されたものの、無監督下でも豊かな社会的知性が発現し得ることが示された。本研究が、グループ対話におけるAIの社会的知性に関するさらなる研究の促進につながることを期待する。

## 原文（Abstract）
This paper introduces OMAR: One Model, All Roles, a reinforcement learning framework that enables AI to develop social intelligence through multi-turn, multi-agent conversational self-play. Unlike traditional paradigms that rely on static, single-turn optimizations, OMAR allows a single model to role-play all participants in a conversation simultaneously, learning to achieve long-term goals and complex social norms directly from dynamic social interaction. To ensure training stability across long dialogues, we implement a hierarchical advantage estimation that calculates turn-level and token-level advantages. Evaluations in the SOTOPIA social environment and Werewolf strategy games show that our trained models develop fine-grained, emergent social intelligence, such as empathy, persuasion, and compromise seeking, demonstrating the effectiveness of learning collaboration even under competitive scenarios. While we identify practical challenges like reward hacking, our results show that rich social intelligence can emerge without human supervision. We hope this work incentivizes further research on AI social intelligence in group conversations.
