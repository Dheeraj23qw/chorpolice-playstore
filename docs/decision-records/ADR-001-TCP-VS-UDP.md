# ADR-001: TCP Sockets over UDP

## Context
Choosing the transport layer for mobile hotspot multiplayer.

## Decision
We chose **TCP Sockets** (via a framed packet approach) instead of UDP.

## Rationale
1. **Reliability**: Chor Police is a turn-based strategy game where every packet (Role Assign, Reveal, Result) is mission-critical. TCP guarantees delivery and ordering, eliminating the need for custom retry logic at the application layer.
2. **Offline Environment**: In mobile hotspot environments, UDP packets are frequently dropped by the Android OS to save power. TCP's persistent connection keeps the socket alive more reliably.
3. **Complexity**: Framing JSON over TCP is significantly simpler than implementing a reliable-UDP (R-UDP) layer from scratch in React Native.

## Consequences
- Slightly higher latency than UDP (irrelevant for a turn-based game).
- Handled via `GameSessionTransport` with a 4-byte length prefix to handle TCP stream fragmentation.
