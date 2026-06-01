import json
import random

class Student:
    def __init__(self, name, skills, interests, role, schedule, major, year, email):
        self.name = name
        self.skills = set(skills)
        self.interests = set(interests)
        self.role = role
        self.schedule = set(schedule)
        self.major = major
        self.year = year
        self.email = email

def calculate_match_score_detailed(user, teammate):
    """
    Calculates a compatibility score and lists reasons between two students.
    Higher score means better compatibility.
    """
    score = 0
    reasons = []
    
    # 1. Synergy (Max 50 points total)
    # 1a. Role Synergy (Max 25 points)
    role_score = 0
    if user.role != teammate.role:
        if (user.role == 'Developer' and teammate.role == 'Designer') or \
           (user.role == 'Designer' and teammate.role == 'Developer'):
            role_score = 25
            reasons.append("Role Synergy: Premium Developer & Designer combination")
        elif (user.role == 'Leader' and teammate.role == 'Researcher') or \
             (user.role == 'Researcher' and teammate.role == 'Leader'):
            role_score = 24
            reasons.append("Role Synergy: Strong Leader & Researcher pairing")
        elif (user.role == 'Presenter' and teammate.role == 'Researcher') or \
             (user.role == 'Researcher' and teammate.role == 'Presenter'):
            role_score = 24
            reasons.append("Role Synergy: Complementary Researcher & Presenter roles")
        else:
            role_score = 20
            reasons.append(f"Role Synergy: Complementary roles ({user.role} & {teammate.role})")
    elif user.role == 'Flexible' or teammate.role == 'Flexible':
        role_score = 15
        reasons.append("Role Synergy: Flexible role alignment")
    else:
        role_score = 5
        reasons.append(f"Same Roles: Both prefer {user.role}")
    score += role_score
        
    # 1b. Skill Complementarity (Max 25 points)
    complementary_skills = teammate.skills - user.skills
    if complementary_skills:
        skill_bonus = min(len(complementary_skills) * 5, 25)
        score += skill_bonus
        skills_str = ", ".join(list(complementary_skills)[:3])
        more_str = f" and {len(complementary_skills)-3} more" if len(complementary_skills) > 3 else ""
        reasons.append(f"Skill Complementarity: Brings expertise you lack ({skills_str}{more_str})")
        
    # 2. Availability / Schedule Overlap (Max 30 points)
    shared_schedule = user.schedule.intersection(teammate.schedule)
    if shared_schedule:
        schedule_score = min(len(shared_schedule) * 5, 30)
        score += schedule_score
        slots_list = list(shared_schedule)[:2]
        slots_str = ", ".join([s.replace('-', ' ') for s in slots_list])
        more_str = f" (+{len(shared_schedule)-2} more)" if len(shared_schedule) > 2 else ""
        reasons.append(f"Schedule Overlap: High availability overlap on {slots_str}{more_str}")
        
    # 3. Shared Interests (Max 20 points)
    shared_interests = user.interests.intersection(teammate.interests)
    if shared_interests:
        interest_score = min(len(shared_interests) * 10, 20)
        score += interest_score
        reasons.append(f"Shared Interests: Shared passion for {', '.join(shared_interests)}")
        
    return min(score, 100), reasons

# Seeding lists
names = [
  "Min-jun Kim", "Temirlan Alipov", "Seo-joon Park", "Aruzhan Saparova", "Do-yoon Lee",
  "Alikhan Smakov", "Ye-jun Choi", "Madina Karimova", "Ha-joon Jung", "Sanzhar Ospanov",
  "Joo-won Kang", "Aisulu Suleimenova", "Ji-ho Cho", "Dias Talgatov", "Ji-woo Yoon",
  "Yerzhan Akhmetov", "Seo-hyeon Jang", "Tomiris Zhumabekova", "Min-seo Lim", "Danial Kassenov",
  "Ha-eun Han", "Amina Askarova", "Seo-yeon Oh", "Madi Yesimov", "Ji-a Seo",
  "Karlygash Nurtasova", "Da-eun Shin", "Dilnaz Serikova", "Ji-min Kwon", "Zhansaya Abdulla",
  "Min-ji Hwang", "Aigerim Bolatova", "Eun-ji Song", "Bekzat Myrzakhmet", "Hyun-woo An",
  "Dastan Utepov", "Woo-jin Hong", "Rustem Kenzhebek", "Sang-hun Jeon", "Yermek Orazayev",
  "Yong-min Ko", "Fariza Amangeldinova", "Soo-min Moon", "Nurbol Samat", "Sun-woo Yang",
  "Nurlan Sadykov", "Tae-hyun Son", "Sultan Tazhibayev", "Yoon-seo Bae", "Alibek Nurpeisov"
]

majors = [
  "Computer Science", "Information Technology", "Software Engineering", "Data Science",
  "Cognitive Science", "UI/UX Design", "Graphic Design", "Business Administration",
  "Marketing & Analytics", "Bioengineering", "Electrical Engineering", "Mechanical Engineering",
  "Physics", "Mathematics & Statistics", "Digital Media", "Communications", "Economics"
]

years = [
  "Freshman (1st Year)", "Sophomore (2nd Year)", "Junior (3rd Year)", "Senior (4th Year)", "Graduate Student"
]

rolesList = ["Leader", "Developer", "Designer", "Researcher", "Presenter"]

tech_skills = ["Python", "JavaScript", "Java", "C/C++", "React / Vue", "Machine Learning", "Data Analysis", "UI/UX Design", "Figma", "Databases / SQL", "Mobile Dev", "Cloud / DevOps", "Cybersecurity", "Game Dev"]
soft_skills = ["Leadership", "Public Speaking", "Research", "Writing", "Project Management", "Creative Thinking", "Problem Solving", "Communication"]
interests = ["AI / Chatbot", "Web Application", "Mobile App", "Data Dashboard", "Social Impact", "Education Tech", "Health & Wellness", "Sustainability", "Fintech", "Gaming"]
days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
slots = ['Morning', 'Afternoon', 'Evening']

def generate_random_profile(index):
    # Fixed seed for consistent random generation per index
    random.seed(index * 13)
    
    name = f"{names[index % len(names)]} {chr(65 + index // len(names))}"
    email = f"{name.lower().replace(' ', '')}@university.edu"
    major = random.choice(majors)
    year = random.choice(years)
    role = random.choice(rolesList)
    
    role_tech = []
    role_soft = []
    
    if role == 'Developer':
        role_tech = ["Python", "JavaScript", "Java", "C/C++", "React / Vue", "Databases / SQL", "Mobile Dev", "Cloud / DevOps", "Machine Learning"]
        role_soft = ["Problem Solving", "Creative Thinking", "Communication"]
    elif role == 'Designer':
        role_tech = ["UI/UX Design", "Figma", "React / Vue", "Mobile Dev"]
        role_soft = ["Creative Thinking", "Communication", "Problem Solving"]
    elif role == 'Researcher':
        role_tech = ["Data Analysis", "Python", "Databases / SQL", "Machine Learning"]
        role_soft = ["Research", "Writing", "Problem Solving"]
    elif role == 'Presenter':
        role_tech = ["Figma", "Data Analysis"]
        role_soft = ["Public Speaking", "Communication", "Writing", "Creative Thinking"]
    elif role == 'Leader':
        role_tech = ["Data Analysis", "Databases / SQL"]
        role_soft = ["Leadership", "Project Management", "Communication", "Problem Solving"]
        
    # Select skills
    sel_tech = random.sample(role_tech, min(len(role_tech), random.randint(2, 4)))
    if random.random() > 0.5:
        sel_tech.append(random.choice(tech_skills))
        
    sel_soft = random.sample(role_soft, min(len(role_soft), random.randint(2, 3)))
    if random.random() > 0.5:
        sel_soft.append(random.choice(soft_skills))
        
    sel_skills = list(set(sel_tech + sel_soft))
    
    # Select interests
    sel_interests = random.sample(interests, random.randint(2, 3))
    
    # Select schedule
    sel_schedule = []
    for _ in range(random.randint(3, 6)):
        sel_schedule.append(f"{random.choice(days)}-{random.choice(slots)}")
    sel_schedule = list(set(sel_schedule))
    
    return Student(name, sel_skills, sel_interests, role, sel_schedule, major, year, email)

if __name__ == "__main__":
    # Generate 50 random candidates
    candidates = [generate_random_profile(i) for i in range(50)]
    
    # Create current user
    current_user = Student(
        name="Alex Johnson",
        skills={"JavaScript", "React / Vue", "Communication", "Problem Solving"},
        interests={"Web Application", "AI / Chatbot", "Fintech"},
        role="Developer",
        schedule={"Mon-Afternoon", "Wed-Evening", "Fri-Morning"},
        major="Computer Science",
        year="Junior (3rd Year)",
        email="alex@university.edu"
    )
    
    print(f"Finding matches for {current_user.name} ({current_user.role})...\n")
    
    # Calculate scores
    scored_candidates = []
    for teammate in candidates:
        score, reasons = calculate_match_score_detailed(current_user, teammate)
        scored_candidates.append({
            "student": teammate,
            "score": score,
            "reasons": reasons
        })
        
    # Sort descending by score
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    
    # Split primary (>= 65) vs secondary (< 65)
    primary = [c for c in scored_candidates if c["score"] >= 65]
    secondary = [c for c in scored_candidates if c["score"] < 65]
    
    print("🔥 MOST FITTING MATCHES (Score >= 65%):")
    if not primary:
        print("  No high compatibility matches found.")
    else:
        for idx, item in enumerate(primary, 1):
            s = item["student"]
            print(f"{idx}. {s.name} ({s.role}) - Match Score: {item['score']}%")
            print(f"   Major: {s.major} | Year: {s.year}")
            print("   Compatibility Reasons:")
            for r in item["reasons"]:
                print(f"     - {r}")
            print()
            
    print("✨ SECONDARY MATCHES (Score < 65%):")
    if not secondary:
        print("  No secondary matches found.")
    else:
        # Show top 5 secondary matches to keep output readable
        for idx, item in enumerate(secondary[:5], 1):
            s = item["student"]
            print(f"{idx}. {s.name} ({s.role}) - Match Score: {item['score']}%")
            print(f"   Major: {s.major} | Year: {s.year}")
            print("   Compatibility Reasons:")
            for r in item["reasons"]:
                print(f"     - {r}")
            print()
        if len(secondary) > 5:
            print(f"  ... and {len(secondary) - 5} more secondary matches.")
