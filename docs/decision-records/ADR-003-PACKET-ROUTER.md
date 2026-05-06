# ADR-003: Modular Packet Router Architecture

## Context
Initial implementations had a 1500+ line `useEffect` containing all packet handling logic, leading to "God Hook" complexity.

## Decision
We extracted all packet handling into a **Modular Packet Router** architecture.

## Rationale
1. **Separation of Concerns**: Packet parsing is handled by the `PacketRouter`, while side-effects (animations, score updates) are handled by specialized modules (`revealHandlers`, `policeHandlers`).
2. **Maintainability**: New features (like a new game mode or extra result animations) can be added by creating a new handler without touching the main game hook.
3. **Ref-Safety**: The orchestrator hook passes a `context` object containing **Refs** to the handlers. This ensures that handlers always access the most current state without being trapped in stale React closures.

## Consequences
- Requires a centralized `types.ts` to maintain the `CPMultiplayerContext` interface.
- Drastically reduced the size of the main orchestrator hook from 1460 to ~370 lines.
