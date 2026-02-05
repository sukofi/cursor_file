# EarResp-ANS : Audio-Based On-Device Respiration Rate Estimation on Earphones with Adaptive Noise Suppression

## 概要 (Abstract)
呼吸数（RR）は臨床評価および精神的健康の重要なバイタルサインであるにもかかわらず、目立たないセンシング技術が不足しているため、日常生活でのモニタリングはほとんど行われていません。インイヤー（耳内）音声センシングは、その高い社会的受容性と閉塞効果による生理音の増幅効果から有望ですが、既存の手法は実世界の騒音環境下でしばしば性能が低下するか、計算負荷の高いモデルに依存しています。本論文では、市販のイヤホン上で完全に端末内でリアルタイムにRR推定を可能にする初のシステム「EarResp-ANS」を提案します。本システムはLMSベースの適応雑音抑制（ANS）を採用し、神経ネットワークや音声ストリーミングを使用せずに周囲ノイズを低減しつつ、呼吸に関連する音響成分を保持することで、ウェアラブル機器のエネルギー効率とプライバシー問題に対処しています。実際の音響環境（音楽、カフェテリアの雑音、最大80 dB SPLのホワイトノイズ）下で18名の参加者を対象に評価を行い、EarResp-ANSはグローバル平均絶対誤差（MAE）0.84呼吸数/分（CPM）を達成し、自動外れ値除去により0.47 CPMにまで誤差を低減しました。さらに、イヤホン上で直接動作し、プロセッサ負荷は2％未満に抑えられています。

## 元のアブストラクト (Original Abstract)
Respiratory rate (RR) is a key vital sign for clinical assessment and mental well-being, yet it is rarely monitored in everyday life due to the lack of unobtrusive sensing technologies. In-ear audio sensing is promising due to its high social acceptance and the amplification of physiological sounds caused by the occlusion effect; however, existing approaches often fail under real-world noise or rely on computationally expensive models. We present EarResp-ANS, the first system enabling fully on-device, real-time RR estimation on commercial earphones. The system employs LMS-based adaptive noise suppression (ANS) to attenuate ambient noise while preserving respiration-related acoustic components, without requiring neural networks or audio streaming, thereby explicitly addressing the energy and privacy constraints of wearable devices. We evaluate EarResp-ANS in a study with 18 participants under realistic acoustic conditions, including music, cafeteria noise, and white noise up to 80 dB SPL. EarResp-ANS achieves robust performance with a global MAE of 0.84 CPM , reduced to 0.47 CPM via automatic outlier rejection, while operating with less than 2% processor load directly on the earphone.

## 引用元 / リンク
- **arXiv URL**: [http://arxiv.org/abs/2602.03549v1](http://arxiv.org/abs/2602.03549v1)
- **PDF URL**: [https://arxiv.org/pdf/2602.03549v1](https://arxiv.org/pdf/2602.03549v1)

---
取得日: 2026-02-04
