# 🪙 EduCoin Token System

> **A decentralized fungible token system on Internet Computer with Internet Identity integration**

## 🌐 **Live Application**

**🚀 Access EduCoin:** **https://5stdt-mqaaa-aaaab-qac3q-cai.icp0.io/**

**🔧 Backend API:** https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=oqjvn-fqaaa-aaaab-qab5q-cai

---

## ✨ **Key Features**

- 🔐 **Internet Identity Authentication** - Secure, anonymous login
- 🎁 **1000 EDU Welcome Bonus** - Only for Internet Identity users
- 💸 **Peer-to-Peer Transfers** - Send tokens between users
- 👑 **Creator Minting** - Authorized token creation
- 📊 **Real-time Token Explorer** - Live balance tracking
- 🛡️ **Secure & Persistent** - Stable memory storage

## 🎯 **How It Works**

1. **Register via Internet Identity** → Get 1000 EDU tokens
2. **Transfer tokens** to other users
3. **Explore balances** and token statistics
4. **Creators can mint** new tokens

## 🆔 **Deployment Info**

**Network:** ICP Playground  
**Frontend Canister:** `5stdt-mqaaa-aaaab-qac3q-cai`  
**Backend Canister:** `oqjvn-fqaaa-aaaab-qab5q-cai`  
**Creator Principal:** `vxwx5-ub6ab-gnobq-jrsk3-egfcp-tz3hj-3mpul-thqzf-dtzol-qb3gz-bqe`

## 🛠️ **Local Development**

```bash
# Start local replica
dfx start --background

# Deploy locally
dfx deploy

# Build frontend
npm run build
```

## 🏗️ **Architecture**

**Backend:** Rust canister with stable memory  
**Frontend:** Next.js/React with TypeScript  
**Auth:** Internet Identity integration  
**Storage:** Persistent across upgrades

## 🔧 **API Functions**

- `init_user()` - Register & get welcome bonus
- `transfer(to, amount)` - Send tokens
- `mint(to, amount)` - Create tokens (creator only)
- `get_balance(principal)` - Check balance
- `get_all_users()` - View token holders

## 🎊 **Try It Now**

**Visit:** **https://5stdt-mqaaa-aaaab-qac3q-cai.icp0.io/**

1. Login with Internet Identity
2. Receive 1000 EDU tokens automatically
3. Transfer tokens to friends
4. Explore the token ecosystem

**Login issues**
- Try clearing browser cache/cookies
- Ensure Internet Identity service is accessible
- Check that you're using the correct II anchor

**Canister not found**
- Verify canister IDs in environment files
- Redeploy canisters if necessary
- Check dfx.json configuration

### Development Issues

**Rust compilation errors**
- Ensure wasm32-unknown-unknown target is installed
- Check Rust version compatibility
- Review Cargo.toml dependencies

**Frontend build errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (should be v18+)
- Verify all environment variables are set

## Contributing

This is an internship project demonstrating ICP development best practices:

- Modern Rust canister with stable memory
- React/Next.js frontend with TailwindCSS
- Internet Identity authentication
- Comprehensive error handling
- Production deployment ready

## License

This project is for educational purposes as part of an internship program.
