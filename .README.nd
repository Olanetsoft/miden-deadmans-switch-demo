# 🛡️ Miden Dead Man's Switch Demo

Privacy-preserving inheritance on the blockchain — because your crypto shouldn't disappear when you do.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://miden-deadmans-switch.vercel.app)
[![Miden SDK](https://img.shields.io/badge/miden--sdk-v0.9.4-blue)](https://www.npmjs.com/package/@demox-labs/miden-sdk)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

## Overview

A dead man's switch implementation showcasing Miden's revolutionary privacy features. Unlike traditional blockchains where inheritance contracts are publicly visible, this demonstrates how Miden keeps everything private until activation.

**[Try the Live Demo →](https://miden-deadmans-switch.vercel.app)**

## ✨ Features

- **Complete Privacy**: Nobody knows you have a dead man's switch until it activates
- **Client-Side Proving**: Generate zero-knowledge proofs in your browser
- **Automatic Execution**: No lawyers, courts, or multi-sig coordination needed
- **Interactive Demo**: Learn Miden concepts without complex setup

## 🛠️ Tech Stack

- **Miden SDK** (v0.9.4) - Zero-knowledge blockchain SDK
- **TypeScript** - Type-safe implementation
- **Vanilla JS** - No framework dependencies
- **Modern CSS** - Glassmorphism, animations, responsive design

## 📁 Project Structure

```
miden-deadmans-switch/
├── index.html              # Landing page
├── deadmans-switch.html    # Interactive demo
├── package.json            # Dependencies
└── README.md              # You are here
```

## 🏃‍♂️ Quick Start

### Option 1: Visit Live Demo
[https://miden-deadmans-switch.vercel.app](https://miden-deadmans-switch.vercel.app)

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/olanetsoft/miden-deadmans-switch-demo.git
cd miden-deadmans-switch

# Install dependencies
npm install

# Serve locally (use any static server)
npx serve .

# Open http://localhost:3000
```

## 💡 How It Works

1. **Private Account Creation**: Accounts exist only locally until used
2. **Time-Lock Script**: Miden Assembly enforces the inheritance rules
3. **Secret Check-ins**: Owner resets timer without revealing identity
4. **Automatic Transfer**: After timeout, beneficiary can claim funds

## 🔍 Key Concepts Demonstrated

- **Privacy by Default**: Miden's accounts are invisible until they transact
- **Client-Side Proving**: Zero-knowledge proofs generated in the browser
- **Note-Based Model**: Different from account-based blockchains
- **Programmable Notes**: Smart contract logic embedded in transactions

## 📝 Code Example

```typescript
// Create a private dead man's switch
const switchAccount = await client.newWallet(
  AccountStorageMode.private(),
  true
);

// Set up time-locked inheritance (30 days)
const deadMansSwitch = await createSwitch(
  beneficiaryAccountId,
  amount,
  30,
  "Secret message for beneficiary"
);

// Owner checks in privately (resets timer)
await checkIn(deadMansSwitch.id);
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Miden team for building privacy-first blockchain technology
- The zero-knowledge community for pushing boundaries

---

<p align="center">
  Built with 💜 for the Miden ecosystem
</p>