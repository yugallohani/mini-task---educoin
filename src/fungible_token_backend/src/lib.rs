use candid::{CandidType, Principal};
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::{Bound, Storable},
    DefaultMemoryImpl, StableBTreeMap,
};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

// Memory types
type Memory = VirtualMemory<DefaultMemoryImpl>;

// Token metadata
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TokenInfo {
    pub name: String,
    pub symbol: String,
    pub total_supply: u64,
    pub creator: Principal,
}

impl Storable for TokenInfo {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Balance entry
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Balance {
    pub amount: u64,
}

impl Storable for Balance {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Principal wrapper for stable storage
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct PrincipalWrapper(pub Principal);

impl Storable for PrincipalWrapper {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self.0).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        PrincipalWrapper(candid::decode_one(&bytes).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

// User info for explorer
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UserInfo {
    pub user_principal: Principal,
    pub balance: u64,
}

// Registration info to track how users were registered
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegistrationInfo {
    pub registered_via_ii: bool, // true if registered through Internet Identity
}

impl Storable for RegistrationInfo {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Transfer result
#[derive(CandidType, Deserialize)]
pub enum TransferResult {
    Success,
    InsufficientBalance,
    SameAccount,
}

// Mint result
#[derive(CandidType, Deserialize)]
pub enum MintResult {
    Success,
    Unauthorized,
}

// Memory management
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static TOKEN_INFO: RefCell<ic_stable_structures::Cell<TokenInfo, Memory>> = RefCell::new(
        ic_stable_structures::Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
            TokenInfo {
                name: "EduCoin".to_string(),
                symbol: "EDU".to_string(),
                total_supply: 0,
                creator: Principal::anonymous(),
            }
        ).unwrap()
    );

    static BALANCES: RefCell<StableBTreeMap<PrincipalWrapper, Balance, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    static REGISTRATIONS: RefCell<StableBTreeMap<PrincipalWrapper, RegistrationInfo, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
}

#[init]
fn init() {
    // Use your Internet Identity Principal ID as the creator
    let creator_principal = Principal::from_text("vxwx5-ub6ab-gnobq-jrsk3-egfcp-tz3hj-3mpul-thqzf-dtzol-qb3gz-bqe").unwrap();
    let initial_supply = 1_000_000u64; // 1 million initial tokens
    
    // Initialize token info
    TOKEN_INFO.with(|token_info| {
        let mut info = token_info.borrow().get().clone();
        info.creator = creator_principal;
        info.total_supply = initial_supply;
        token_info.borrow_mut().set(info).unwrap();
    });

    // Give all initial tokens to creator
    BALANCES.with(|balances| {
        balances.borrow_mut().insert(
            PrincipalWrapper(creator_principal),
            Balance { amount: initial_supply }
        );
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    // Stable structures automatically handle persistence
}

#[post_upgrade]
fn post_upgrade() {
    // Stable structures automatically handle restoration
}

// Helper function to register a user through Internet Identity and give welcome bonus
fn register_user_via_ii(principal: Principal) -> bool {
    const WELCOME_BONUS: u64 = 1000; // 1000 EDU tokens for new users
    
    // Check if user is already registered
    let already_registered = REGISTRATIONS.with(|registrations| {
        registrations.borrow().contains_key(&PrincipalWrapper(principal))
    });
    
    if already_registered {
        return false; // User already registered, no bonus given
    }
    
    // Register the user as Internet Identity user
    REGISTRATIONS.with(|registrations| {
        registrations.borrow_mut().insert(
            PrincipalWrapper(principal),
            RegistrationInfo { registered_via_ii: true }
        );
    });
    
    // Give welcome bonus
    BALANCES.with(|balances| {
        let mut balances_ref = balances.borrow_mut();
        let current_balance = balances_ref
            .get(&PrincipalWrapper(principal))
            .map(|b| b.amount)
            .unwrap_or(0);
        
        balances_ref.insert(
            PrincipalWrapper(principal),
            Balance { amount: current_balance + WELCOME_BONUS }
        );
    });
    
    // Update total supply
    TOKEN_INFO.with(|token_info| {
        let mut info = token_info.borrow().get().clone();
        info.total_supply += WELCOME_BONUS;
        token_info.borrow_mut().set(info).unwrap();
    });
    
    true // Bonus was given
}

// Query functions

#[query]
fn get_token_info() -> TokenInfo {
    TOKEN_INFO.with(|token_info| token_info.borrow().get().clone())
}

#[query]
fn get_balance(account: Principal) -> u64 {
    // Simply return the balance without giving any bonus
    BALANCES.with(|balances| {
        balances
            .borrow()
            .get(&PrincipalWrapper(account))
            .map(|balance| balance.amount)
            .unwrap_or(0)
    })
}

#[query]
fn get_total_supply() -> u64 {
    TOKEN_INFO.with(|token_info| token_info.borrow().get().total_supply)
}

#[query]
fn get_all_users() -> Vec<UserInfo> {
    BALANCES.with(|balances| {
        balances
            .borrow()
            .iter()
            .map(|(principal_wrapper, balance)| UserInfo {
                user_principal: principal_wrapper.0,
                balance: balance.amount,
            })
            .collect()
    })
}

#[query]
fn is_creator(principal: Principal) -> bool {
    TOKEN_INFO.with(|token_info| token_info.borrow().get().creator == principal)
}

// Update functions

#[update]
fn init_user() -> u64 {
    let caller = ic_cdk::caller();
    
    // Register user via Internet Identity and give welcome bonus if new
    if caller != Principal::anonymous() {
        register_user_via_ii(caller);
    }
    
    // Return the user's balance
    BALANCES.with(|balances| {
        balances
            .borrow()
            .get(&PrincipalWrapper(caller))
            .map(|balance| balance.amount)
            .unwrap_or(0)
    })
}

#[update]
fn transfer(to: Principal, amount: u64) -> TransferResult {
    let caller = ic_cdk::caller();
    
    if caller == to {
        return TransferResult::SameAccount;
    }

    BALANCES.with(|balances| {
        let mut balances_ref = balances.borrow_mut();
        
        // Get sender balance
        let sender_balance = balances_ref
            .get(&PrincipalWrapper(caller))
            .map(|b| b.amount)
            .unwrap_or(0);

        if sender_balance < amount {
            return TransferResult::InsufficientBalance;
        }

        // Get receiver balance
        let receiver_balance = balances_ref
            .get(&PrincipalWrapper(to))
            .map(|b| b.amount)
            .unwrap_or(0);

        // Update sender balance
        if sender_balance == amount {
            balances_ref.remove(&PrincipalWrapper(caller));
        } else {
            balances_ref.insert(
                PrincipalWrapper(caller),
                Balance { amount: sender_balance - amount }
            );
        }

        // Update receiver balance
        balances_ref.insert(
            PrincipalWrapper(to),
            Balance { amount: receiver_balance + amount }
        );

        TransferResult::Success
    })
}

#[update]
fn mint(to: Principal, amount: u64) -> MintResult {
    let caller = ic_cdk::caller();
    
    // Check if caller is the creator
    let is_authorized = TOKEN_INFO.with(|token_info| {
        token_info.borrow().get().creator == caller
    });

    if !is_authorized {
        return MintResult::Unauthorized;
    }

    // Update total supply
    TOKEN_INFO.with(|token_info| {
        let mut info = token_info.borrow().get().clone();
        info.total_supply += amount;
        token_info.borrow_mut().set(info).unwrap();
    });

    // Update recipient balance
    BALANCES.with(|balances| {
        let mut balances_ref = balances.borrow_mut();
        let current_balance = balances_ref
            .get(&PrincipalWrapper(to))
            .map(|b| b.amount)
            .unwrap_or(0);
        
        balances_ref.insert(
            PrincipalWrapper(to),
            Balance { amount: current_balance + amount }
        );
    });

    MintResult::Success
}

// Export candid interface
ic_cdk::export_candid!();
