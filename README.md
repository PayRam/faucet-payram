# Payram Sepolia Faucet

A modern, secure Ethereum Sepolia testnet faucet built with Next.js 15, featuring wallet connectivity, Twitter verification, and comprehensive claim management.

![Payram Faucet](public/green-payram-badge-350x100.png)

## 🌟 Features

- **Multi-Wallet Support**: Connect with MetaMask, Coinbase Wallet, WalletConnect, and more via RainbowKit
- **Twitter Verification**: Tweet-to-earn system with 2x bonus rewards
- **Mainnet Balance Check**: Requires minimum 0.0025 ETH on Ethereum Mainnet to prevent abuse
- **Rate Limiting**:
  - 5-minute cooldown between claims
  - Maximum 3 claims per day per wallet
  - Daily token budget system for sustainable distribution
- **Database Tracking**: Complete claim history with wallet addresses, IP addresses, and timestamps
- **Responsive Design**: Mobile-first UI with Tailwind CSS and custom Payram branding
- **Real-time Status**: Transaction tracking and claim verification
- **FAQ Section**: Comprehensive help documentation for users

## 🚀 Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Blockchain**:
  - Ethers.js 6.13
  - Wagmi 2.12
  - Viem 2.21
  - RainbowKit 2.1.5
- **Database**: PostgreSQL with TypeORM 0.3.20
- **APIs**: Twitter API via twitterapi.io
- **Icons**: Lucide React
- **State Management**: React 19 with Hooks

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (can use Neon, Supabase, or local)
- Ethereum wallet private keys for treasury wallets
- Alchemy or Infura RPC endpoints
- Twitter API key (optional, for tweet verification)
- WalletConnect Project ID

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/faucet-payram.git
   cd faucet-payram
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   If you encounter peer dependency issues with React 19:

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables**

   Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # Database Configuration
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   DB_DATABASE=faucet_db

   # Ethereum Configuration
   ETHEREUM_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

   # Treasury Wallet Private Keys (comma separated for rotation)
   TREASURY_PRIVATE_KEYS=0xYOUR_PRIVATE_KEY_1,0xYOUR_PRIVATE_KEY_2

   # Faucet Configuration
   MIN_MAINNET_BALANCE=0.0025
   COOLDOWN_MINUTES=5
   DAILY_CLAIM_LIMIT=3
   MAX_DAILY_CLAIMS=100
   FAUCET_AMOUNT=0.05

   # Twitter API (for tweet verification)
   TWITTER_API_KEY=your_TWITTER_API_KEY

   # WalletConnect Project ID
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

4. **Set up the database**

   The database schema will be automatically created when you first run the application thanks to TypeORM's synchronization feature. The `FaucetClaim` entity includes:

   - `to_wallet_address`: Recipient wallet
   - `from_wallet_address`: Treasury wallet that sent the funds
   - `tweet_id`: Unique tweet identifier
   - `tweet_account`: Twitter account username
   - `amount`: Amount of ETH sent
   - `ip_address`: User's IP address (for additional fraud prevention)
   - `time_stamp`: Claim timestamp

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
faucet-payram/
├── app/
│   ├── api/
│   │   ├── check-balance/
│   │   │   └── route.ts          # Mainnet balance verification
│   │   ├── claim/
│   │   │   └── route.ts          # Main claim processing endpoint
│   │   └── status/
│   │       └── route.ts          # Faucet status and health check
│   ├── globals.css               # Global styles and RainbowKit customization
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main faucet interface
│   └── providers.tsx             # Wagmi and RainbowKit providers
├── components/
│   ├── LoadingSpinner.tsx        # Loading animation component
│   ├── StatusBadge.tsx           # Status indicator component
│   └── TransactionLink.tsx       # Etherscan link component
├── data/
│   └── FAQ.json                  # FAQ content
├── hooks/
│   └── useFaucet.ts              # Custom faucet logic hook
├── lib/
│   ├── entities/
│   │   └── FaucetClaim.ts        # TypeORM entity definition
│   ├── config-validator.ts       # Environment validation
│   ├── constants.ts              # App constants and messages
│   ├── database.ts               # Database connection
│   ├── utils.ts                  # Helper functions
│   └── wagmi-config.ts           # Wagmi configuration
├── public/
│   ├── payram_horizontalVividGreen.svg
│   ├── payram_logoIconVividGreen.svg
│   └── PayRam_longshadow_long_1.svg
├── types/
│   └── index.ts                  # TypeScript type definitions
├── .env.local.example            # Environment variables template
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 Customization

### Brand Colors

The faucet uses Payram's brand colors defined in `tailwind.config.ts`:

```typescript
colors: {
  "payram-green": "#01E46F",    // Primary accent
  "payram-dark": "#003401",     // Dark green
  "payram-lime": "#CAFF54",     // Bright lime
  "payram-magenta": "#FF00FF",  // Accent magenta
  "payram-purple": "#6A0DAD",   // Accent purple
}
```

### Faucet Limits

Adjust claim limits in your `.env.local`:

- `MIN_MAINNET_BALANCE`: Minimum ETH required on mainnet (default: 0.0025)
- `COOLDOWN_MINUTES`: Minutes between claims (default: 5)
- `DAILY_CLAIM_LIMIT`: Max claims per wallet per day (default: 3)
- `MAX_DAILY_CLAIMS`: Total ETH budget per day (default: 100)
- `FAUCET_AMOUNT`: ETH amount per claim (default: 0.05)

### FAQ Content

Edit the FAQ section by modifying `data/FAQ.json`:

```json
[
  {
    "id": 1,
    "question": "Your question here?",
    "answer": "Your answer here."
  }
]
```

## 🔒 Security Features

- **IP Address Tracking**: Records IP addresses to prevent multi-account abuse
- **Treasury Wallet Rotation**: Supports multiple private keys for load distribution
- **Tweet Uniqueness**: Each tweet URL can only be used once
- **Mainnet Balance Verification**: Requires real ETH holdings to claim
- **Rate Limiting**: Multiple layers of protection against abuse
- **Database Validation**: Comprehensive checks before ETH distribution
- **Environment Validation**: Startup checks for critical configuration

## 📊 Database Schema

```sql
CREATE TABLE faucet_claims (
  id SERIAL PRIMARY KEY,
  to_wallet_address VARCHAR(42) NOT NULL,
  from_wallet_address VARCHAR(42) NOT NULL,
  tweet_id VARCHAR(255) UNIQUE NOT NULL,
  tweet_account VARCHAR(255) NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  ip_address VARCHAR(45) NULL,
  time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 API Endpoints

### POST `/api/claim`

Process a faucet claim with tweet verification.

**Request Body:**

```json
{
  "walletAddress": "0x...",
  "tweetUrl": "https://twitter.com/user/status/..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully claimed 0.05 Sepolia ETH!",
  "txHash": "0x...",
  "amount": "0.05"
}
```

### GET `/api/check-balance?address=0x...`

Verify mainnet balance requirements.

**Response:**

```json
{
  "hasMinBalance": true,
  "balance": "0.0050",
  "required": "0.0025"
}
```

### GET `/api/status`

Check faucet operational status.

**Response:**

```json
{
  "status": "operational",
  "network": "sepolia",
  "faucetAmount": "0.05"
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Hosting

```bash
npm run build
npm start
```

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# TypeORM CLI
npm run typeorm
```

## 📝 Environment Variables Reference

| Variable                               | Description                            | Required | Default |
| -------------------------------------- | -------------------------------------- | -------- | ------- |
| `DB_HOST`                              | PostgreSQL host                        | Yes      | -       |
| `DB_PORT`                              | PostgreSQL port                        | Yes      | 5432    |
| `DB_USERNAME`                          | Database username                      | Yes      | -       |
| `DB_PASSWORD`                          | Database password                      | Yes      | -       |
| `DB_DATABASE`                          | Database name                          | Yes      | -       |
| `ETHEREUM_MAINNET_RPC`                 | Mainnet RPC URL                        | Yes      | -       |
| `SEPOLIA_RPC`                          | Sepolia RPC URL                        | Yes      | -       |
| `TREASURY_PRIVATE_KEYS`                | Treasury wallet keys (comma-separated) | Yes      | -       |
| `MIN_MAINNET_BALANCE`                  | Minimum mainnet ETH                    | No       | 0.0025  |
| `COOLDOWN_MINUTES`                     | Cooldown period                        | No       | 5       |
| `DAILY_CLAIM_LIMIT`                    | Claims per day                         | No       | 3       |
| `MAX_DAILY_CLAIMS`                     | Daily budget (ETH)                     | No       | 100     |
| `FAUCET_AMOUNT`                        | ETH per claim                          | No       | 0.05    |
| `TWITTER_API_KEY`                      | Twitter API key                        | No       | -       |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect ID                       | Yes      | -       |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Wallet connectivity by [RainbowKit](https://www.rainbowkit.com/)
- Blockchain interactions with [Ethers.js](https://docs.ethers.org/)
- Icons from [Lucide](https://lucide.dev/)
- Database ORM by [TypeORM](https://typeorm.io/)

## 📞 Support

For support, email dev@payram.com or visit our [website](https://payram.com).

## 🔗 Links

- [Website](https://faucet.payram.com)
- [Twitter](https://x.com/PayRamApp)
- [LinkedIn](https://www.linkedin.com/company/payram)

---

Built with ❤️ by the Payram Team

```typescript
colors: {
  'payram-green': '#01E46F',
  'payram-dark': '#003401',
  // Add your custom colors
}
```

### Updating Faucet Parameters

Modify environment variables:

```env
MIN_MAINNET_BALANCE=0.0025
COOLDOWN_MINUTES=5
DAILY_CLAIM_LIMIT=3
FAUCET_AMOUNT=0.05
```

### Adding Logo

Place your logo files in the `public` directory:

- `public/logo-horizontal.png`
- `public/logo-vertical.png`
- `public/logo-badge.png`

Update the logo in `app/page.tsx`.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials in `.env.local`
- Ensure database exists: `createdb faucet_db`

### Wallet Connection Issues

- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check that you're using a supported wallet
- Ensure you're on the correct network

### Transaction Failures

- Verify treasury wallets have sufficient Sepolia ETH
- Check RPC endpoint is working
- Ensure private keys are correct format (include '0x' prefix)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Open an issue on GitHub
- Contact: support@payram.io

## Acknowledgments

- Built with Next.js 15
- Wallet integration by RainbowKit
- Inspired by QuickNode Faucet design
