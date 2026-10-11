import uuid
import hashlib
import hmac
import os
import secrets
import time
from typing import Dict, Optional, List
from ..models.schemas import UserProfile, UserRole, LoginRequest, RegisterRequest, AuthTokenResponse, CountryCode

# Versioned PBKDF2 storage keeps existing auth self-contained without fast hashes.
PASSWORD_ITERATIONS = 600_000

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), int(iterations))
        return hmac.compare_digest(digest.hex(), expected)
    except (ValueError, TypeError):
        return False

COUNTRY_NAMES = {
    "IND": "India",
    "BRA": "Brazil",
    "ZAF": "South Africa",
    "CHN": "China",
    "RUS": "Russia",
    "USA": "United States",
    "ALL": "Global BRICS"
}

# Seeded pre-configured accounts
INITIAL_USERS: List[Dict] = [
    # --- CITIZENS ---
    {
        "id": "usr_cit_ind_01",
        "name": "Rajesh Sharma",
        "email": "citizen.india@civicpulse.org",
        "password_hash": hash_password("citizen123"),
        "role": UserRole.CITIZEN,
        "country_code": "IND",
        "country_name": "India",
        "district": "Varanasi Rural, Uttar Pradesh",
        "department": None,
        "clearance_level": "Verified Citizen Voice",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "usr_cit_bra_02",
        "name": "Maria Silva",
        "email": "citizen.brazil@civicpulse.org",
        "password_hash": hash_password("citizen123"),
        "role": UserRole.CITIZEN,
        "country_code": "BRA",
        "country_name": "Brazil",
        "district": "Santaluz Municipality, Bahia",
        "department": None,
        "clearance_level": "Community Delegate",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "usr_cit_zaf_03",
        "name": "Sipho Dlamini",
        "email": "citizen.safrica@civicpulse.org",
        "password_hash": hash_password("citizen123"),
        "role": UserRole.CITIZEN,
        "country_code": "ZAF",
        "country_name": "South Africa",
        "district": "OR Tambo District, Eastern Cape",
        "department": None,
        "clearance_level": "Verified Citizen Voice",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    # --- GOVERNMENT OFFICIALS ---
    {
        "id": "usr_gov_ind_01",
        "name": "Dr. Sunita Rao",
        "email": "director.infra@gov.in",
        "password_hash": hash_password("admin123"),
        "role": UserRole.GOVERNMENT,
        "country_code": "IND",
        "country_name": "India",
        "district": "New Delhi Central",
        "department": "Ministry of Housing & Urban Infrastructure",
        "clearance_level": "Level 4 - National Infrastructure Director",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "usr_gov_bra_02",
        "name": "Eng. Alexandre Santos",
        "email": "minister.planning@gov.br",
        "password_hash": hash_password("admin123"),
        "role": UserRole.GOVERNMENT,
        "country_code": "BRA",
        "country_name": "Brazil",
        "district": "Brasília Federal District",
        "department": "Ministério da Infraestrutura e Logística",
        "clearance_level": "Federal Executive Authority",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "usr_gov_all_03",
        "name": "BRICS Command Admin",
        "email": "admin.brics@civicpulse.org",
        "password_hash": hash_password("admin123"),
        "role": UserRole.GOVERNMENT,
        "country_code": "ALL",
        "country_name": "Global BRICS Alliance",
        "district": "DPGA Secretariat",
        "department": "Digital Public Goods Alliance Secretariat",
        "clearance_level": "Chief Operations Director",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    }
]

class AuthService:
    def __init__(self):
        demo_mode = os.getenv("CIVICPULSE_DEMO_MODE", "false").lower() == "true"
        self.users: Dict[str, Dict] = {u["email"].lower(): u for u in INITIAL_USERS} if demo_mode else {}
        self.tokens: Dict[str, tuple[str, float]] = {}
        self.session_ttl_seconds = int(os.getenv("CIVICPULSE_SESSION_TTL_SECONDS", "28800"))

    def authenticate(self, req: LoginRequest) -> Optional[AuthTokenResponse]:
        clean_email = req.email_or_username.strip().lower()
        
        # Demo usernames are accepted only for explicitly enabled demo accounts.
        user_record = self.users.get(clean_email)
        if not user_record:
            for u in self.users.values():
                if u["name"].lower() == clean_email or u["id"] == clean_email:
                    user_record = u
                    break
        if not user_record or not verify_password(req.password, user_record["password_hash"]):
            return None
        if req.role and user_record["role"] != req.role:
            return None

        token = secrets.token_urlsafe(32)
        self.tokens[token] = (user_record["email"], time.time() + self.session_ttl_seconds)

        profile = UserProfile(
            id=user_record["id"],
            name=user_record["name"],
            email=user_record["email"],
            role=user_record["role"],
            country_code=user_record["country_code"],
            country_name=user_record["country_name"],
            district=user_record.get("district"),
            department=user_record.get("department"),
            clearance_level=user_record.get("clearance_level"),
            avatar_url=user_record.get("avatar_url")
        )

        return AuthTokenResponse(token=token, token_type="Bearer", user=profile)

    def register(self, req: RegisterRequest) -> AuthTokenResponse:
        if req.role != UserRole.CITIZEN:
            raise PermissionError("Government accounts must be provisioned by an administrator.")
        clean_email = req.email.strip().lower()
        if clean_email in self.users:
            raise ValueError("An account with this email already exists.")
        if len(req.password) < 12:
            raise ValueError("Password must be at least 12 characters.")
        c_code = req.country_code.value
        user_record = {
            "id": f"usr_{req.role.value}_{uuid.uuid4().hex[:6]}",
            "name": req.name.strip(),
            "email": clean_email,
            "password_hash": hash_password(req.password),
            "role": req.role,
            "country_code": c_code,
            "country_name": COUNTRY_NAMES.get(c_code, "India"),
            "district": req.district or "Central District",
            "department": req.department or ("Directorate of Urban Infrastructure" if req.role == UserRole.GOVERNMENT else None),
            "clearance_level": "Accredited Government Official" if req.role == UserRole.GOVERNMENT else "Registered Citizen",
            "avatar_url": None
        }
        self.users[clean_email] = user_record
        token = secrets.token_urlsafe(32)
        self.tokens[token] = (clean_email, time.time() + self.session_ttl_seconds)

        profile = UserProfile(
            id=user_record["id"],
            name=user_record["name"],
            email=user_record["email"],
            role=user_record["role"],
            country_code=user_record["country_code"],
            country_name=user_record["country_name"],
            district=user_record["district"],
            department=user_record["department"],
            clearance_level=user_record["clearance_level"],
            avatar_url=None
        )
        return AuthTokenResponse(token=token, token_type="Bearer", user=profile)

    def get_user_by_token(self, token: str) -> Optional[UserProfile]:
        session = self.tokens.get(token.strip())
        if not session:
            return None
        email, expires_at = session
        if expires_at <= time.time():
            self.tokens.pop(token.strip(), None)
            return None
        user_record = self.users.get(email)
        if not user_record:
            return None
        return UserProfile(
            id=user_record["id"],
            name=user_record["name"],
            email=user_record["email"],
            role=user_record["role"],
            country_code=user_record["country_code"],
            country_name=user_record["country_name"],
            district=user_record.get("district"),
            department=user_record.get("department"),
            clearance_level=user_record.get("clearance_level"),
            avatar_url=user_record.get("avatar_url")
        )

auth_service = AuthService()
