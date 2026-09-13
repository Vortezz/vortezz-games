# Vortezz Games

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.md)
[![Website](https://img.shields.io/badge/Website-games.vortezz.dev-brightgreen)](https://games.vortezz.dev)

An open-source, real-time multiplayer gaming platform built with TypeScript, React, Turborepo, and WebSockets.

Play for free directly in your browser with no account required at **[games.vortezz.dev](https://games.vortezz.dev)**.

## Repository Architecture

This project is structured as a monorepo and managed using Turborepo:

* **`apps/web`** - Frontend app using ReactJS.
* **`apps/api`** - Backend app and WebSocket server.
* **`packages/shared`** - Shared types, constants and utilities used in both frontend and backend.

## Getting Started

The following describes how to set up the development environment locally:

### Requirements

* Node.js (v18 or higher recommended)
* [pnpm](https://pnpm.io/installation) package manager

### Local Setup

1. Clone the repository:
    ```bash
   git clone git@github.com:Vortezz/vortezz-games.git
   cd vortezz-games
   ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

3. Launch the development server:
    ```bash
    pnpm run dev
    ```

## Contributing

Contributions are always appreciated! Whether you're fixing a bug or proposing new features.

* **Bug Reports & Ideas:** Please open an issue first to discuss what you would like changed or added.
* **Adding a New Game:** Please open an issue before you start implementation so the community can discuss the game
  mechanics and scope.
* **Pull Requests:** Please describe your changes and reference any related issues.

### AI Usage Guidelines

In an effort to protect code quality and developer intent, this project has strict rules for AI tools:

* AI generation is **strictly restricted to documentation and text content**.
* AI-generated code is **not allowed**.

*Note: AI was used to help improve this README and write the Terms of Service.*

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE.md).

You are free to modify and redistribute the code, provided all derivative works remain open-source under the same
GPL-3.0 license.