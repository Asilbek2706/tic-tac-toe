# 🎮 Tic-Tac-Toe Pro (Professional Edition)

A high-performance, visually stunning Tic-Tac-Toe game built with modern web technologies. This version features a sophisticated UI/UX design, smooth animations, and an unbeatable Artificial Intelligence.

---

## ✨ Features

* **🌐 Dual Game Modes:**
    * **PvP (Player vs Player):** Challenge a friend on the same device.
    * **PvC (Player vs Computer):** Face off against an unbeatable AI powered by the Minimax algorithm.
* **💎 Glassmorphism Design:** A modern aesthetic using backdrop-blur effects, semi-transparent surfaces, and neon glow.
* **🕹️ 3D Interactive UI:** Buttons with physical depth (3D push effect), dynamic scaling, and haptic-style feedback.
* **🧠 Unbeatable AI:** The computer uses a recursive Minimax decision tree to ensure it never loses.
* **📱 Fully Responsive:** Optimized for all screen sizes, from mobile phones to large desktop monitors.
* **⚡ Smooth Animations:** Entrance transitions, winning line strikes, and pulse effects for game-ending moves.

---

## 🛠️ Technology Stack

* **HTML5:** Semantic structure for optimal accessibility.
* **SASS (SCSS):** Advanced styling with mixins, variables, and nested hierarchies for a professional CSS architecture.
* **JavaScript (ES6+):** Clean, state-driven logic and recursive algorithms.
* **Minimax Algorithm:** Used for game theory-based decision making.

---

## 🧠 How the AI Works: Minimax Algorithm

The AI doesn't just play randomly; it calculates every possible future move. It assigns a score to each outcome:
* **Robot Wins:** `+10`
* **Human Wins:** `-10`
* **Draw:** `0`



The algorithm recursively explores the game tree to choose the move that maximizes its score while minimizing the player's advantage.

---

## 📂 Project Structure

```bash
├── index.html       # Game structure and layout
├── style.scss       # Source SASS file (3D effects, glassmorphism, animations)
├── style.css        # Compiled production CSS
└── app.js           # Core game logic & Minimax implementation