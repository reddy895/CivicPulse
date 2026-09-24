import uuid
import hashlib
from typing import Dict, Optional, List
from ..models.schemas import UserProfile, UserRole, LoginRequest, RegisterRequest, AuthTokenResponse, CountryCode

# Password hashing helper
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

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
        self.users: Dict[str, Dict] = {u["email"].lower(): u for u in INITIAL_USERS}
        self.tokens: Dict[str, str] = {} # token -> email
        
        # Pre-seed active tokens for instant demo access
        for u in INITIAL_USERS:
            demo_token = f"civic_token_{u['role'].value}_{u['id']}"
            self.tokens[demo_token] = u["email"].lower()

    def authenticate(self, req: LoginRequest) -> Optional[AuthTokenResponse]:
        clean_email = req.email_or_username.strip().lower()
        
        # Find user by email
        user_record = self.users.get(clean_email)
        
        # Fallback: check by username or create on the fly for seamless demo
        if not user_record:
            # Check if username match
            for u in self.users.values():
                if u["name"].lower() == clean_email or u["id"] == clean_email:
                    user_record = u
                    break
                    
        if not user_record:
            # If standard demo password or generic login, auto-register seamless profile
            req_role = req.role or UserRole.CITIZEN
            c_code = "IND"
            new_id = f"usr_{req_role.value}_{uuid.uuid4().hex[:6]}"
            user_record = {
                "id": new_id,
                "name": req.email_or_username.split("@")[0].replace(".", " ").title(),
                "email": clean_email,
                "password_hash": hash_password(req.password),
                "role": req_role,
                "country_code": c_code,
                "country_name": COUNTRY_NAMES.get(c_code, "India"),
                "district": "Municipal Jurisdiction" if req_role == UserRole.GOVERNMENT else "Citizen Ward",
                "department": "Municipal Public Works Department" if req_role == UserRole.GOVERNMENT else None,
                "clearance_level": "Departmental Officer" if req_role == UserRole.GOVERNMENT else "Verified Citizen",
                "avatar_url": None
            }
            self.users[clean_email] = user_record

        # Check password hash (accept correct hash or demo defaults 'citizen123' / 'admin123' / identical password)
        submitted_hash = hash_password(req.password)
        if user_record["password_hash"] != submitted_hash and req.password not in ["citizen123", "admin123", "password", "demo123"]:
            # Check if password match was plain text stored
            if user_record.get("plain_password") != req.password:
                return None

        # Verify role if requested
        if req.role and user_record["role"] != req.role:
            # Allow role change for test accounts if user chose government or citizen
            user_record["role"] = req.role

        token = f"cp_tok_{uuid.uuid4().hex}"
        self.tokens[token] = user_record["email"]

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
        clean_email = req.email.strip().lower()
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
        token = f"cp_tok_{uuid.uuid4().hex}"
        self.tokens[token] = clean_email

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
        clean_token = token.replace("Bearer ", "").strip()
        email = self.tokens.get(clean_token)
        if not email:
            # Check if it is a demo token
            for t, em in self.tokens.items():
                if t == clean_token:
                    email = em
                    break
        if not email:
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
