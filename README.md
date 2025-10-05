# Solana Airdrop Tool

A Next.js application for distributing tokens to multiple addresses on the Solana network.

## Features

- 🔗 **Wallet Connection**: Connect with Phantom, Solflare, and Backpack wallets
- 🪙 **Token Selection**: Support for SOL, USDC, USDT, and custom tokens (like HODL)
- 📊 **CSV Upload**: Upload recipient lists with wallet addresses and amounts
- 🚀 **Batch Airdrop**: Execute token distributions to multiple recipients
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Supported Tokens

- **SOL** (Wrapped Solana)
- **USDC** (USD Coin)
- **USDT** (Tether USD)
- **HODL** (Half Orange Drinking Lemonade)
- **Custom Tokens**: Add your own token mint addresses

## CSV Format

Upload a CSV file with the following columns:

```csv
wallet,amount
EVyCWRZMtMgGr2nyATXYSqQANRuGDnvBXBezFNvnmxqq,100
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,50
```

### Column Requirements:

- **wallet**: Solana wallet addresses (Base58 format)
- **amount**: Token amounts to distribute

Rows with missing addresses or amounts (including 0 values) will be skipped.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Solana wallet (Phantom, Solflare, or Backpack)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/gmussi/airdrop-sol.git
cd airdrop-sol
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run export
```

## Usage

1. **Connect Your Wallet**: Click the "Connect Wallet" button and select your preferred wallet
2. **Select Token**: Choose the token you want to distribute from your wallet
3. **Upload CSV**: Upload a CSV file with recipient addresses and amounts
4. **Execute Airdrop**: Review the details and execute the token distribution

## Technology Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Blockchain**: Solana Web3.js
- **Wallet Integration**: Solana Wallet Adapter
- **CSV Parsing**: Papa Parse

## Deployment

This application is automatically deployed to GitHub Pages when changes are pushed to the main branch.

**Live Demo**: [https://gmussi.github.io/airdrop-sol/](https://gmussi.github.io/airdrop-sol/)

## Security Notes

- Always verify recipient addresses before executing airdrops
- Test with small amounts first
- Ensure you have sufficient SOL for transaction fees
- Use at your own risk

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ for the Solana ecosystem
