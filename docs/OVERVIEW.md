# Project Overview: Chor Police Multiplayer

## 📌 Purpose
Chor Police is a production-grade, local-multiplayer game built for Android/iOS. It brings the classic "King, Queen, Thief, Police" (Rajamantri Chor Police) game to a high-fidelity digital format, featuring hotspot-based networking, cinematic animations, and educational "Think & Count" quiz mechanics.

## 🎮 Game Modes
- **Multiplayer (Local/Hotspot)**: 4-player real-time sessions via TCP sockets.
- **Bot Support**: Seamless integration of AI players for partial lobbies or dropped connections.

## 🛠️ Technology Stack
- **Framework**: React Native / Expo.
- **State Management**: Redux Toolkit (Single Source of Truth).
- **Networking**: Raw TCP Sockets (Packet-framed over Wi-Fi/Hotspot).
- **Audio**: Custom AudioEngine for multi-channel spatial feedback.
- **Animations**: React Native Animated API for cinematic transitions.

## 🏛️ Architecture Philosophy
The project follows a **Host-Authoritative** model with a **Modular Packet Router Architecture**.

### 1. Redux Single Source of Truth (SSOT)
All gameplay states (Phase, Roles, Scores, Rounds) are managed in a centralized Redux store (`sessionSlice`). UI components listen exclusively to Redux, ensuring that "What the Host sees is what the Client sees."

### 2. Host-Authoritative Design
The Host device is the "Source of Truth" for:
- Shuffling roles.
- Evaluating police guesses.
- Calculating leaderboard standings.
- Handling bot decisions.
Clients are "Passive Observers" that render the state dictated by Host packets.

### 3. Modular Packet Router
To prevent monolithic hooks, all incoming network packets are passed through a `PacketRouter`. This router dispatches packets to specialized handler modules (`revealHandlers`, `policeHandlers`, etc.), keeping the logic decoupled and maintainable.

---
[Multiplayer Architecture](./multiplayer-architecture.md) | [Gameplay Phases](./gameplay-phases.md) | [Debugging Guide](./debugging-guide.md)
