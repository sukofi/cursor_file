# StepScorer：ステップごとのスコアリングと心理的後悔モデリングによる強化学習の加速化

## 元タイトル
StepScorer: Accelerating Reinforcement Learning with Step-wise Scoring and Psychological Regret Modeling

## 概要
強化学習アルゴリズムは、特にフィードバックが遅延または希薄な複雑な環境において、報酬信号の希薄さに起因する収束の遅さに悩まされることが多い。本論文では、各意思決定ステップ後に後悔に基づくフィードバック信号を取り入れることで学習を加速する新しい手法、心理的後悔モデル（Psychological Regret Model; PRM）を提案する。PRMは、終端報酬を待つのではなく、各状態における最適行動の期待値と実際に選択した行動の価値との差に基づいて後悔信号を算出する。これにより、希薄な報酬を段階的評価フレームワークを通じて密なフィードバック信号に変換し、収束速度の向上を可能にする。我々は、PRMがLunar Landerなどのベンチマーク環境において、従来手法であるProximal Policy Optimization（PPO）に比べて約36％高速に安定した性能を達成することを実証した。また、PRMは特に連続制御タスクやフィードバックが遅延する環境において有効であり、ロボティクス、金融、適応教育といった迅速な方策適応が求められる実世界応用に適している。本手法は、人間の反事実的思考を計算可能な後悔信号として形式化し、行動経済学と強化学習の架け橋を成すものである。

## 元の概要 (Abstract)
Reinforcement learning algorithms often suffer from slow convergence due to sparse reward signals, particularly in complex environments where feedback is delayed or infrequent. This paper introduces the Psychological Regret Model (PRM), a novel approach that accelerates learning by incorporating regret-based feedback signals after each decision step. Rather than waiting for terminal rewards, PRM computes a regret signal based on the difference between the expected value of the optimal action and the value of the action taken in each state. This transforms sparse rewards into dense feedback signals through a step-wise scoring framework, enabling faster convergence. We demonstrate that PRM achieves stable performance approximately 36\% faster than traditional Proximal Policy Optimization (PPO) in benchmark environments such as Lunar Lander. Our results indicate that PRM is particularly effective in continuous control tasks and environments with delayed feedback, making it suitable for real-world applications such as robotics, finance, and adaptive education where rapid policy adaptation is critical. The approach formalizes human-inspired counterfactual thinking as a computable regret signal, bridging behavioral economics and reinforcement learning.

## 論文情報
- **テーマ**: 発達心理学
- **公開日**: 2026-02-03T06:39:20Z
- **PDF URL**: https://arxiv.org/pdf/2602.03171v1
- **取得日**: 2026-02-05

---
*このドキュメントは自動生成・翻訳されました。*
