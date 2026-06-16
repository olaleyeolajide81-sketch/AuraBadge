#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, symbol_short, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct BadgeMetadata {
    pub owner: Address,
    pub level: u32,
    pub role: Symbol,
    pub messages_count: u64,
    pub votes_count: u64,
    pub ipfs_cid: String,
    pub last_updated: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum BadgeError {
    NotFound = 1,
    AlreadyMinted = 2,
    Unauthorized = 3,
}

fn badge_key(owner: &Address) -> Address {
    owner.clone()
}

pub fn get_level(messages: u64, votes: u64) -> u32 {
    let score = messages + votes * 2;
    match score {
        0..=9 => 1,
        10..=49 => 2,
        50..=199 => 3,
        200..=999 => 4,
        _ => 5,
    }
}

#[contract]
pub struct AuraBadgeContract;

#[contractimpl]
impl AuraBadgeContract {
    pub fn mint(env: Env, owner: Address, role: Symbol, ipfs_cid: String) -> Result<(), BadgeError> {
        owner.require_auth();
        if env.storage().persistent().has(&badge_key(&owner)) {
            return Err(BadgeError::AlreadyMinted);
        }
        let badge = BadgeMetadata {
            owner: owner.clone(),
            level: 1,
            role,
            messages_count: 0,
            votes_count: 0,
            ipfs_cid,
            last_updated: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&badge_key(&owner), &badge);
        Ok(())
    }

    pub fn update(
        env: Env,
        owner: Address,
        messages_count: u64,
        votes_count: u64,
        ipfs_cid: String,
    ) -> Result<(), BadgeError> {
        owner.require_auth();
        let key = badge_key(&owner);
        let mut badge: BadgeMetadata = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(BadgeError::NotFound)?;

        if badge.owner != owner {
            return Err(BadgeError::Unauthorized);
        }

        badge.messages_count = messages_count;
        badge.votes_count = votes_count;
        badge.ipfs_cid = ipfs_cid;
        badge.level = get_level(messages_count, votes_count);
        badge.last_updated = env.ledger().timestamp();
        env.storage().persistent().set(&key, &badge);
        Ok(())
    }

    pub fn get_badge(env: Env, owner: Address) -> Result<BadgeMetadata, BadgeError> {
        env.storage()
            .persistent()
            .get(&badge_key(&owner))
            .ok_or(BadgeError::NotFound)
    }

    pub fn get_level(messages: u64, votes: u64) -> u32 {
        get_level(messages, votes)
    }
}
