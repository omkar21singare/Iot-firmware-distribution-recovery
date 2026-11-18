from app.schemas.schemas import AdaptiveInput, AdaptiveDecisionOut

class AdaptiveEngineService:
    @staticmethod
    def evaluate_device(input_data: AdaptiveInput) -> AdaptiveDecisionOut:
        if not input_data.compatibility_match:
            return AdaptiveDecisionOut(
                recommended_mode="INCOMPATIBLE",
                score=0.0,
                concurrency_threads=0,
                timeout_seconds=0.0,
                max_retries=0,
                block_size_bytes=0,
                resume_enabled=False,
                explanation="Firmware hardware series does not match ESP32 device architecture requirement.",
                input_breakdown={
                    "network_score": 0,
                    "health_score": input_data.health_score,
                    "packet_loss": input_data.packet_loss,
                    "compatibility": "FAILED"
                }
            )

        # 1. Calculate Network Score (0-100) based on RSSI & Latency
        # RSSI: -30 (100%) to -90 (0%)
        rssi_clamped = max(-90.0, min(-30.0, input_data.wifi_rssi))
        network_score = ((rssi_clamped + 90.0) / 60.0) * 100.0
        
        # Latency Penalty (subtract up to 20 pts for > 100ms)
        latency_penalty = min(20.0, (max(0.0, input_data.latency_ms - 20.0) / 100.0) * 20.0)
        final_network_score = max(0.0, network_score - latency_penalty)

        # 2. Calculate Packet Loss Score (0-100)
        # Loss: 0% (100) to 20% (0)
        loss_clamped = min(20.0, max(0.0, input_data.packet_loss))
        loss_score = 100.0 - (loss_clamped * 5.0)

        # 3. Calculate Reliability Score based on failure count & success rate
        reliability_score = max(0.0, input_data.transfer_success_rate - (input_data.failure_count * 15.0))

        # 4. Composite Weighted Score
        # Weights: Network (30%), Loss (30%), Health (25%), Reliability (15%)
        composite_score = (
            (final_network_score * 0.30) +
            (loss_score * 0.30) +
            (input_data.health_score * 0.25) +
            (reliability_score * 0.15)
        )

        # 5. Priority boost / requirement check
        if input_data.priority == "HIGH":
            # High priority devices get careful handling if network is degraded
            pass

        # 6. Determine Transfer Mode
        if (composite_score >= 80.0 and 
            input_data.packet_loss < 3.5 and 
            input_data.health_score >= 80.0 and 
            input_data.failure_count <= 1):
            
            mode = "FAST"
            threads = 4
            timeout = 1.5
            retries = 3
            block_size = 1024
            resume = True
            explanation = (
                f"Excellent network quality (RSSI: {input_data.wifi_rssi:.1f} dBm, Score: {final_network_score:.0f}%), "
                f"low packet loss ({input_data.packet_loss:.1f}%), and optimal health ({input_data.health_score:.0f}%) "
                f"allow FAST mode with higher block throughput ({block_size}B) and {threads} concurrent workers."
            )

        elif (composite_score >= 55.0 and 
              input_data.packet_loss < 8.0 and 
              input_data.health_score >= 65.0):
            
            mode = "NORMAL"
            threads = 2
            timeout = 2.5
            retries = 5
            block_size = 512
            resume = True
            explanation = (
                f"Moderate network conditions (RSSI: {input_data.wifi_rssi:.1f} dBm) and steady device health ({input_data.health_score:.0f}%). "
                f"NORMAL mode selected with standard RFC 1350 block size (512B) and standard 5-retry policy."
            )

        else:
            mode = "SAFE"
            threads = 1
            timeout = 4.0
            retries = 10
            block_size = 256
            resume = True
            reasons = []
            if input_data.packet_loss >= 8.0:
                reasons.append(f"high packet loss ({input_data.packet_loss:.1f}%)")
            if input_data.health_score < 65.0:
                reasons.append(f"degraded device health ({input_data.health_score:.0f}%)")
            if input_data.failure_count > 1:
                reasons.append(f"previous transfer failures ({input_data.failure_count})")
            if final_network_score < 55.0:
                reasons.append(f"poor Wi-Fi RSSI ({input_data.wifi_rssi:.1f} dBm)")
            
            reason_str = ", ".join(reasons) if reasons else "degraded composite metrics"
            explanation = (
                f"SAFE mode triggered due to {reason_str}. "
                f"Allocated single thread, reduced block size ({block_size}B), extended timeout ({timeout}s), "
                f"10 retries, and active block-level resume protection."
            )

        return AdaptiveDecisionOut(
            recommended_mode=mode,
            score=round(composite_score, 1),
            concurrency_threads=threads,
            timeout_seconds=timeout,
            max_retries=retries,
            block_size_bytes=block_size,
            resume_enabled=resume,
            explanation=explanation,
            input_breakdown={
                "network_score": round(final_network_score, 1),
                "packet_loss_score": round(loss_score, 1),
                "device_health": input_data.health_score,
                "reliability_score": round(reliability_score, 1),
                "failure_count": input_data.failure_count
            }
        )
