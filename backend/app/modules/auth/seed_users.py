import logging
from app.database.connection import SessionLocal
from app.modules.auth.models import User, UserAssessment, UserVenture
from app.modules.auth.security import hash_password

logger = logging.getLogger(__name__)

INITIAL_USERS = [
    {
        "id": "usr_bhoomi",
        "email": "bhoomika@entrevision.in",
        "password": "entrevision123",
        "full_name": "Bhoomika Vaishya",
        "role": "Agro-Entrepreneur",
        "tehsil": "Katol",
        "district": "Nagpur",
        "phone": "+91 98765 43210",
        "avatar": "🍊",
        "active_venture": {
            "id": "OPP02",
            "opportunity_id": "2",
            "name": "Disease-Free Certified Citrus Nursery",
            "category": "Agriculture & Cultivation",
            "location": "Katol, Nagpur District",
            "suitability_score": 92,
            "feasibility_score": 92,
            "capital_fit": 90,
            "infrastructure_fit": 94,
            "land_fit": 94,
            "skill_fit": 95,
            "market_fit": 90,
            "resource_fit": 88,
            "location_fit": 92,
            "score_type": "MCDA",
            "total_cost": 2000000,
            "own_equity": 400000,
            "subsidy_amount": 700000,
            "subsidy_scheme": "MIDH / NHM Commercial Horticulture Subsidy",
            "bank_loan": 900000,
            "journey_phase": 2,
            "current_task": "CCRI Mother Plant Certification & Registration",
            "next_deadline": "Next 14 Days"
        },
        "assessment": {
            "about_me": {
                "fullName": "Bhoomika Vaishya",
                "ageGroup": "26–35",
                "education": "Graduate",
                "currentSituation": "looking_opportunity",
                "goals": ["first_business", "explore_local"]
            },
            "skills_detailed": [{"skillId": "SKL01", "proficiency": "expert", "yearsExperience": 3}],
            "willingness_to_learn": "willing_to_learn",
            "location_detailed": {"selectedCluster": "Katol", "operatingArea": "Nagpur District"},
            "finance_detailed": {"availableCapitalINR": 500000, "borrowingComfort": "loan_with_subsidy"}
        }
    },
    {
        "id": "usr_ramesh",
        "email": "ramesh.patil@vidarbhaagro.org",
        "password": "farmer123",
        "full_name": "Ramesh Patil",
        "role": "Citrus Grower & Aggregator",
        "tehsil": "Narkhed",
        "district": "Nagpur",
        "phone": "+91 94221 88321",
        "avatar": "🌾",
        "active_venture": {
            "id": "OPP03",
            "opportunity_id": "3",
            "name": "Micro-Budding Commercial Citrus Propagation Unit",
            "category": "Agriculture & Cultivation",
            "location": "Narkhed, Nagpur District",
            "suitability_score": 96,
            "feasibility_score": 96,
            "capital_fit": 95,
            "infrastructure_fit": 98,
            "land_fit": 98,
            "skill_fit": 96,
            "market_fit": 92,
            "resource_fit": 95,
            "location_fit": 96,
            "score_type": "MCDA",
            "total_cost": 800000,
            "own_equity": 160000,
            "subsidy_amount": 280000,
            "subsidy_scheme": "MIDH / NHM Commercial Horticulture Subsidy",
            "bank_loan": 360000,
            "journey_phase": 1,
            "current_task": "ICAR-CCRI Micro-Budding Masterclass Registration",
            "next_deadline": "Next 7 Days"
        },
        "assessment": {
            "about_me": {
                "fullName": "Ramesh Patil",
                "ageGroup": "26–35",
                "education": "High School / 10th / 12th",
                "currentSituation": "looking_opportunity",
                "existingBusinessType": "unused_land_machinery",
                "goals": ["first_business", "explore_local", "monetize_assets"]
            },
            "skills_detailed": [
                {"skillId": "SKL01", "proficiency": "intermediate", "yearsExperience": 2},
                {"skillId": "SKL02", "proficiency": "intermediate", "yearsExperience": 2},
                {"skillId": "SKL03", "proficiency": "intermediate", "yearsExperience": 3}
            ],
            "willingness_to_learn": "willing_to_learn",
            "resources_detailed": {
                "hasLand": True,
                "landAcres": 1.5,
                "hasWorkspace": True,
                "transportModes": [{"type": "tractor", "ownership": "owned"}]
            },
            "location_detailed": {"selectedCluster": "Narkhed", "operatingArea": "Nagpur District"},
            "finance_detailed": {"availableCapitalINR": 500000, "borrowingComfort": "loan_with_subsidy"}
        }
    },
    {
        "id": "usr_pooja",
        "email": "pooja.deshmukh@nagpuragro.com",
        "password": "pooja123",
        "full_name": "Pooja Deshmukh",
        "role": "Agri-Business Founder",
        "tehsil": "Kalmeshwar",
        "district": "Nagpur",
        "phone": "+91 98230 11234",
        "avatar": "🏭",
        "active_venture": {
            "id": "OPP09",
            "opportunity_id": "9",
            "name": "Organic Fruit Surface Waxing & Antifungal Coating Line",
            "category": "Food Processing & Value Addition",
            "location": "Kalmeshwar, Nagpur District",
            "suitability_score": 94,
            "feasibility_score": 94,
            "capital_fit": 92,
            "infrastructure_fit": 95,
            "land_fit": 95,
            "skill_fit": 92,
            "market_fit": 96,
            "resource_fit": 90,
            "location_fit": 94,
            "score_type": "MCDA",
            "total_cost": 1500000,
            "own_equity": 300000,
            "subsidy_amount": 525000,
            "subsidy_scheme": "PMFME 35% Credit-Linked Capital Subsidy",
            "bank_loan": 675000,
            "journey_phase": 2,
            "current_task": "Procure Food-Grade Shellac Wax Applicator",
            "next_deadline": "Next 12 Days"
        },
        "assessment": {
            "about_me": {
                "fullName": "Pooja Deshmukh",
                "ageGroup": "26–35",
                "education": "Graduate",
                "currentSituation": "planning_startup",
                "goals": ["first_business", "high_margin"]
            },
            "skills_detailed": [{"skillId": "SKL06", "proficiency": "expert", "yearsExperience": 4}],
            "willingness_to_learn": "willing_to_learn",
            "location_detailed": {"selectedCluster": "Kalmeshwar", "operatingArea": "Nagpur District"},
            "finance_detailed": {"availableCapitalINR": 800000, "borrowingComfort": "loan_with_subsidy"}
        }
    }
]


def seed_auth_users():
    db = SessionLocal()
    try:
        for udata in INITIAL_USERS:
            existing = db.query(User).filter(User.id == udata["id"]).first()
            if not existing:
                pwd_hash, salt = hash_password(udata["password"])
                user = User(
                    id=udata["id"],
                    email=udata["email"],
                    password_hash=pwd_hash,
                    salt=salt,
                    full_name=udata["full_name"],
                    role=udata["role"],
                    tehsil=udata["tehsil"],
                    district=udata["district"],
                    phone=udata["phone"],
                    avatar=udata["avatar"]
                )
                db.add(user)
                db.flush()

                # Assessment
                if "assessment" in udata:
                    a = udata["assessment"]
                    assessment = UserAssessment(
                        user_id=user.id,
                        about_me=a.get("about_me"),
                        skills_detailed=a.get("skills_detailed"),
                        willingness_to_learn=a.get("willingness_to_learn", "willing_to_learn"),
                        resources_detailed=a.get("resources_detailed"),
                        location_detailed=a.get("location_detailed"),
                        finance_detailed=a.get("finance_detailed"),
                        business_preferences=a.get("business_preferences")
                    )
                    db.add(assessment)

                # Venture
                if "active_venture" in udata:
                    v = udata["active_venture"]
                    venture = UserVenture(
                        user_id=user.id,
                        opportunity_id=v.get("opportunity_id"),
                        venture_name=v.get("name"),
                        venture_data=v,
                        journey_phase=v.get("journey_phase", 1),
                        current_task=v.get("current_task"),
                        next_deadline=v.get("next_deadline")
                    )
                    db.add(venture)

                db.commit()
                logger.info(f"Seeded user: {user.email}")
            else:
                logger.info(f"User already exists: {existing.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding auth users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_auth_users()
