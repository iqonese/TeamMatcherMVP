// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let db = null;
let useFirebase = false;

if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    useFirebase = true;
    console.log("Firebase initialized successfully");
  } catch (err) {
    console.warn("Failed to initialize Firebase:", err);
  }
} else {
  console.log("Firebase not configured. Running in Local Storage Mode.");
}

// --- State ---
let currentUser = null;
let allStudents = []; // Will be fetched from Firestore / Local Storage
let currentRatings = { overall: 0, match: 0, ease: 0 };
let currentFilter = 'all';
let currentSort = 'score';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  renderScheduleGrid();
  
  // Try to load user from localStorage
  const savedUser = localStorage.getItem('teamMatchUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    fillProfileForm();
  }

  // Initial fetch of potential teammates
  fetchTeammates();
});

async function fetchTeammates() {
  try {
    if (useFirebase && db) {
      const snapshot = await db.collection('students').get();
      allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      throw new Error("Running in Local Storage database mode.");
    }
  } catch (err) {
    console.warn("Database notice:", err.message);
    const localStudents = localStorage.getItem('teamMatchStudents');
    allStudents = localStudents ? JSON.parse(localStudents) : [];
  }
  
  // If we are on matches page, re-render
  if (document.getElementById('page-matches').classList.contains('active')) {
    renderMatches();
  }
}

async function saveStudentToDb(student) {
  if (useFirebase && db) {
    try {
      await db.collection('students').doc(student.email).set(student);
      return;
    } catch (err) {
      console.error("Firebase write failed, falling back to local storage:", err);
    }
  }
  
  // Local storage DB write
  const localStudentsStr = localStorage.getItem('teamMatchStudents');
  let localStudents = localStudentsStr ? JSON.parse(localStudentsStr) : [];
  
  // Remove existing record for this email to update it
  localStudents = localStudents.filter(s => s.email !== student.email);
  
  // Save with id
  localStudents.push({ id: student.email, ...student });
  localStorage.setItem('teamMatchStudents', JSON.stringify(localStudents));
}

// --- Seeding Engine ---
const names = [
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
];

const majors = [
  "Computer Science", "Information Technology", "Software Engineering", "Data Science",
  "Cognitive Science", "UI/UX Design", "Graphic Design", "Business Administration",
  "Marketing & Analytics", "Bioengineering", "Electrical Engineering", "Mechanical Engineering",
  "Physics", "Mathematics & Statistics", "Digital Media", "Communications", "Economics"
];

const yearLevels = [
  "Freshman (1st Year)", "Sophomore (2nd Year)", "Junior (3rd Year)", "Senior (4th Year)", "Graduate Student"
];

const rolesList = ["Leader", "Developer", "Designer", "Researcher", "Presenter"];

const techSkillsPool = [
  "Python", "JavaScript", "Java", "C/C++", "React / Vue", "Machine Learning", 
  "Data Analysis", "UI/UX Design", "Figma", "Databases / SQL", "Mobile Dev", 
  "Cloud / DevOps", "Cybersecurity", "Game Dev"
];

const softSkillsPool = [
  "Leadership", "Public Speaking", "Research", "Writing", "Project Management", 
  "Creative Thinking", "Problem Solving", "Communication"
];

const interestsPool = [
  "AI / Chatbot", "Web Application", "Mobile App", "Data Dashboard", "Social Impact", 
  "Education Tech", "Health & Wellness", "Sustainability", "Fintech", "Gaming"
];

const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const slotsList = ['Morning', 'Afternoon', 'Evening'];

function generateRandomProfile(index) {
  const name = names[index % names.length] + " " + String.fromCharCode(65 + Math.floor(index / names.length));
  const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}@university.edu`;
  const major = majors[Math.floor(Math.random() * majors.length)];
  const year = yearLevels[Math.floor(Math.random() * yearLevels.length)];
  const role = rolesList[Math.floor(Math.random() * rolesList.length)];
  
  let roleTechSkills = [];
  let roleSoftSkills = [];
  
  if (role === 'Developer') {
    roleTechSkills = ["Python", "JavaScript", "Java", "C/C++", "React / Vue", "Databases / SQL", "Mobile Dev", "Cloud / DevOps", "Machine Learning"];
    roleSoftSkills = ["Problem Solving", "Creative Thinking", "Communication"];
  } else if (role === 'Designer') {
    roleTechSkills = ["UI/UX Design", "Figma", "React / Vue", "Mobile Dev"];
    roleSoftSkills = ["Creative Thinking", "Communication", "Problem Solving"];
  } else if (role === 'Researcher') {
    roleTechSkills = ["Data Analysis", "Python", "Databases / SQL", "Machine Learning"];
    roleSoftSkills = ["Research", "Writing", "Problem Solving"];
  } else if (role === 'Presenter') {
    roleTechSkills = ["Figma", "Data Analysis"];
    roleSoftSkills = ["Public Speaking", "Communication", "Writing", "Creative Thinking"];
  } else if (role === 'Leader') {
    roleTechSkills = ["Data Analysis", "Databases / SQL"];
    roleSoftSkills = ["Leadership", "Project Management", "Communication", "Problem Solving"];
  }
  
  const selectedTech = [];
  const numTech = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numTech; i++) {
    const s = roleTechSkills[Math.floor(Math.random() * roleTechSkills.length)];
    if (!selectedTech.includes(s)) selectedTech.push(s);
  }
  if (Math.random() > 0.5) {
    const s = techSkillsPool[Math.floor(Math.random() * techSkillsPool.length)];
    if (!selectedTech.includes(s)) selectedTech.push(s);
  }

  const selectedSoft = [];
  const numSoft = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numSoft; i++) {
    const s = roleSoftSkills[Math.floor(Math.random() * roleSoftSkills.length)];
    if (!selectedSoft.includes(s)) selectedSoft.push(s);
  }
  if (Math.random() > 0.5) {
    const s = softSkillsPool[Math.floor(Math.random() * softSkillsPool.length)];
    if (!selectedSoft.includes(s)) selectedSoft.push(s);
  }

  const selectedInterests = [];
  const numInterests = 2 + Math.floor(Math.random() * 2);
  while (selectedInterests.length < numInterests) {
    const interest = interestsPool[Math.floor(Math.random() * interestsPool.length)];
    if (!selectedInterests.includes(interest)) selectedInterests.push(interest);
  }
  
  const selectedSchedule = [];
  const numSlots = 3 + Math.floor(Math.random() * 4);
  while (selectedSchedule.length < numSlots) {
    const day = daysList[Math.floor(Math.random() * daysList.length)];
    const slot = slotsList[Math.floor(Math.random() * slotsList.length)];
    const key = `${day}-${slot}`;
    if (!selectedSchedule.includes(key)) selectedSchedule.push(key);
  }

  const colors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)"
  ];
  
  return {
    name,
    major,
    year,
    email,
    skills: [...selectedTech, ...selectedSoft],
    techSkills: selectedTech,
    softSkills: selectedSoft,
    interests: selectedInterests,
    schedule: selectedSchedule,
    role,
    avatar: name.charAt(0),
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

async function seedDemoProfiles() {
  const generated = [];
  for (let i = 0; i < 50; i++) {
    generated.push(generateRandomProfile(i));
  }
  
  if (useFirebase && db) {
    try {
      const batch = db.batch();
      generated.forEach(s => {
        const docRef = db.collection('students').doc(s.email);
        batch.set(docRef, s);
      });
      await batch.commit();
    } catch (err) {
      console.error("Firebase batch save failed, saving locally:", err);
    }
  }
  
  // Always save locally as well so local matches work
  const localStudentsStr = localStorage.getItem('teamMatchStudents');
  let localStudents = localStudentsStr ? JSON.parse(localStudentsStr) : [];
  
  generated.forEach(g => {
    localStudents = localStudents.filter(s => s.email !== g.email);
    localStudents.push({ id: g.email, ...g });
  });
  
  localStorage.setItem('teamMatchStudents', JSON.stringify(localStudents));
  
  showToast("Successfully generated 50 demo profiles!");
  await fetchTeammates();
}

// --- Page Navigation ---
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navLink = document.getElementById(`nav-${pageId}`);
  if (navLink) navLink.classList.add('active');
  
  window.scrollTo(0, 0);
  
  if (pageId === 'matches') {
    renderMatches();
  }
}

// --- Profile Handling ---
function toggleTag(btn) {
  btn.classList.toggle('active');
}

function renderScheduleGrid() {
  const grid = document.getElementById('scheduleGrid');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const slots = ['Morning', 'Afternoon', 'Evening'];
  
  grid.innerHTML = '<div class="schedule-header"></div>';
  slots.forEach(slot => {
    grid.innerHTML += `<div class="schedule-header">${slot}</div>`;
  });
  
  days.forEach(day => {
    grid.innerHTML += `<div class="schedule-day">${day}</div>`;
    slots.forEach(slot => {
      grid.innerHTML += `<div class="schedule-slot" data-day="${day}" data-slot="${slot}" onclick="this.classList.toggle('active')"></div>`;
    });
  });
}

async function submitProfile(e) {
  e.preventDefault();
  
  const techSkills = Array.from(document.querySelectorAll('#techSkills .tag-btn.active')).map(b => b.innerText);
  const softSkills = Array.from(document.querySelectorAll('#softSkills .tag-btn.active')).map(b => b.innerText);
  const interests = Array.from(document.querySelectorAll('#projectInterests .tag-btn.active')).map(b => b.innerText);
  const schedule = Array.from(document.querySelectorAll('.schedule-slot.active')).map(s => `${s.dataset.day}-${s.dataset.slot}`);
  const role = document.querySelector('input[name="role"]:checked')?.value || "Flexible";
  
  // Generate a simple avatar and color if new
  const colors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)"
  ];

  currentUser = {
    name: document.getElementById('fullName').value,
    major: document.getElementById('major').value,
    year: document.getElementById('year').value,
    email: document.getElementById('email').value,
    skills: [...techSkills, ...softSkills], // combined for simplicity
    techSkills,
    softSkills,
    interests,
    schedule,
    role,
    avatar: document.getElementById('fullName').value.charAt(0),
    color: colors[Math.floor(Math.random() * colors.length)]
  };
  
  try {
    // Save to database / local wrapper
    await saveStudentToDb(currentUser);
    localStorage.setItem('teamMatchUser', JSON.stringify(currentUser));
    showToast("Profile saved successfully!");
    showPage('matches');
    await fetchTeammates(); // Refresh list
  } catch (err) {
    console.error("Error saving profile:", err);
    showToast("Error saving profile.");
  }
}

function fillProfileForm() {
  if (!currentUser) return;
  
  document.getElementById('fullName').value = currentUser.name || "";
  document.getElementById('major').value = currentUser.major || "";
  document.getElementById('year').value = currentUser.year || "";
  document.getElementById('email').value = currentUser.email || "";
  
  // Tags
  const allTags = document.querySelectorAll('.tag-btn');
  allTags.forEach(tag => {
    if (currentUser.techSkills?.includes(tag.innerText) || 
        currentUser.softSkills?.includes(tag.innerText) || 
        currentUser.interests?.includes(tag.innerText)) {
      tag.classList.add('active');
    }
  });
  
  // Schedule
  const allSlots = document.querySelectorAll('.schedule-slot');
  allSlots.forEach(slot => {
    const key = `${slot.dataset.day}-${slot.dataset.slot}`;
    if (currentUser.schedule?.includes(key)) {
      slot.classList.add('active');
    }
  });
  
  // Role
  const roleRadio = document.querySelector(`input[name="role"][value="${currentUser.role}"]`);
  if (roleRadio) roleRadio.checked = true;
}

// --- Matching Logic ---
function calculateMatchScoreDetailed(student) {
  if (!currentUser) return { score: 0, reasons: [] };
  
  let score = 0;
  const reasons = [];
  
  // 1. Synergy (Max 50 points total)
  // 1a. Role Synergy (Max 25 points)
  let roleScore = 0;
  if (currentUser.role !== student.role) {
    if (
      (currentUser.role === 'Developer' && student.role === 'Designer') ||
      (currentUser.role === 'Designer' && student.role === 'Developer')
    ) {
      roleScore = 25;
      reasons.push(`Role Synergy: Premium Developer & Designer combination`);
    } else if (
      (currentUser.role === 'Leader' && student.role === 'Researcher') ||
      (currentUser.role === 'Researcher' && student.role === 'Leader')
    ) {
      roleScore = 24;
      reasons.push(`Role Synergy: Strong Leader & Researcher pairing`);
    } else if (
      (currentUser.role === 'Presenter' && student.role === 'Researcher') ||
      (currentUser.role === 'Researcher' && student.role === 'Presenter')
    ) {
      roleScore = 24;
      reasons.push(`Role Synergy: Complementary Researcher & Presenter roles`);
    } else {
      roleScore = 20;
      reasons.push(`Role Synergy: Complementary roles (${currentUser.role} & ${student.role})`);
    }
  } else if (currentUser.role === 'Flexible' || student.role === 'Flexible') {
    roleScore = 15;
    reasons.push(`Role Synergy: Flexible role alignment`);
  } else {
    roleScore = 5;
    reasons.push(`Same Roles: Both prefer ${currentUser.role}`);
  }
  score += roleScore;

  // 1b. Skill Complementarity (Max 25 points)
  const userSkillsSet = new Set(currentUser.skills || []);
  const teammateSkills = student.skills || [];
  const complementarySkills = teammateSkills.filter(s => !userSkillsSet.has(s));
  
  if (complementarySkills.length > 0) {
    const skillBonus = Math.min(complementarySkills.length * 5, 25);
    score += skillBonus;
    const displayedSkills = complementarySkills.slice(0, 3).join(", ");
    const moreCount = complementarySkills.length > 3 ? ` and ${complementarySkills.length - 3} more` : '';
    reasons.push(`Skill Complementarity: Brings expertise you lack (${displayedSkills}${moreCount})`);
  }

  // 2. Availability / Schedule Overlap (Max 30 points)
  const userSchedule = currentUser.schedule || [];
  const teammateSchedule = student.schedule || [];
  const overlappingSlots = teammateSchedule.filter(slot => userSchedule.includes(slot));
  
  if (overlappingSlots.length > 0) {
    const scheduleScore = Math.min(overlappingSlots.length * 5, 30);
    score += scheduleScore;
    const formattedSlots = overlappingSlots.slice(0, 2).map(s => {
      const parts = s.split('-');
      return `${parts[0]} ${parts[1]}`;
    }).join(", ");
    const moreSlotsCount = overlappingSlots.length > 2 ? ` (+${overlappingSlots.length - 2} more)` : '';
    reasons.push(`Schedule Overlap: High availability overlap on ${formattedSlots}${moreSlotsCount}`);
  }

  // 3. Shared Interests (Max 20 points)
  const userInterests = currentUser.interests || [];
  const teammateInterests = student.interests || [];
  const sharedInterests = teammateInterests.filter(i => userInterests.includes(i));
  
  if (sharedInterests.length > 0) {
    const interestScore = Math.min(sharedInterests.length * 10, 20);
    score += interestScore;
    reasons.push(`Shared Interests: Shared passion for ${sharedInterests.join(", ")}`);
  }

  return {
    score: Math.min(score, 100),
    reasons: reasons
  };
}

function renderMatches() {
  const container = document.getElementById('matchesGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!currentUser) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Filter out self (case-insensitive email matching)
  let matches = allStudents.filter(s => s.email.toLowerCase() !== currentUser.email.toLowerCase());
  
  // Compute match details for each
  matches = matches.map(s => {
    const matchDetails = calculateMatchScoreDetailed(s);
    return {
      ...s,
      matchScore: matchDetails.score,
      reasons: matchDetails.reasons
    };
  });
  
  // Apply Filter
  if (currentFilter === 'tech') matches = matches.filter(m => m.role === 'Developer');
  if (currentFilter === 'design') matches = matches.filter(m => m.role === 'Designer');
  if (currentFilter === 'soft') matches = matches.filter(m => ['Leader', 'Presenter', 'Researcher'].includes(m.role));

  // Apply Sort
  if (currentSort === 'score') {
    matches.sort((a, b) => b.matchScore - a.matchScore);
  } else if (currentSort === 'name') {
    matches.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'skills') {
    matches.sort((a, b) => b.skills.length - a.skills.length);
  }

  if (matches.length === 0) {
    container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">No matching students found.</p>';
    return;
  }

  // Split into primary (>= 65%) and secondary (< 65%)
  const primaryMatches = matches.filter(m => m.matchScore >= 65);
  const secondaryMatches = matches.filter(m => m.matchScore < 65);

  let htmlContent = '';

  const renderCard = (m, isPrimary) => {
    const reasonsHtml = m.reasons.length > 0 
      ? `<div class="match-reasons-list">
           ${m.reasons.map(r => `<div class="match-reason-item"><span>⚡</span> ${r}</div>`).join('')}
         </div>`
      : `<p style="font-size: 0.85rem; color: var(--text-muted)">No strong overlapping factors found.</p>`;

    return `
      <div class="match-card ${isPrimary ? 'primary-match-card' : 'secondary-match-card'}">
        <div class="match-avatar" style="background: ${m.color}">${m.avatar}</div>
        <div class="match-info">
          <h3>${m.name} <span class="role-badge-small">${m.role}</span></h3>
          <div class="match-meta">
            <span>🎓 ${m.major}</span>
            <span>📅 ${m.year}</span>
          </div>
          
          <div class="match-reasons-container">
            <strong>Compatibility Breakdown:</strong>
            ${reasonsHtml}
          </div>

          <div class="match-tags" style="margin-top: 1rem;">
            ${m.skills.slice(0, 3).map(s => `<span class="match-tag">${s}</span>`).join('')}
            ${m.skills.length > 3 ? `<span class="match-tag">+${m.skills.length - 3} more</span>` : ''}
          </div>
        </div>
        <div class="match-score">
          <div class="score-circle" style="border-color: ${isPrimary ? 'var(--primary)' : 'var(--text-muted)'}">
            <span class="score-num">${m.matchScore}%</span>
            <span class="score-label">Match</span>
          </div>
          <button class="btn-primary" onclick="openMatchDetails('${m.id}')">View Profile</button>
        </div>
      </div>
    `;
  };

  if (primaryMatches.length > 0) {
    htmlContent += `
      <div class="match-section-header">
        <h2 class="section-title"><span class="section-glow"></span>🔥 Most Fitting Matches</h2>
        <p class="section-subtitle">Highly recommended candidates with excellent role/skill alignment and shared interests</p>
      </div>
      <div class="match-group">
        ${primaryMatches.map(m => renderCard(m, true)).join('')}
      </div>
    `;
  } else {
    htmlContent += `
      <div class="match-section-header">
        <h2 class="section-title">🔥 Most Fitting Matches</h2>
        <p class="section-subtitle">No high-compatibility matches found. Try expanding your profile preferences!</p>
      </div>
    `;
  }

  if (secondaryMatches.length > 0) {
    htmlContent += `
      <div class="match-section-header" style="margin-top: 3rem;">
        <h2 class="section-title">✨ Secondary Matches</h2>
        <p class="section-subtitle">Teammates with some overlap who could still be a great fit for your project</p>
      </div>
      <div class="match-group">
        ${secondaryMatches.map(m => renderCard(m, false)).join('')}
      </div>
    `;
  }

  container.innerHTML = htmlContent;
}

function filterMatches(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = type;
  renderMatches();
}

function sortMatches(val) {
  currentSort = val;
  renderMatches();
}

// --- Modals ---
function openMatchDetails(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;
  
  const content = document.getElementById('modalContent');
  const scoreDetails = calculateMatchScoreDetailed(student);
  const score = scoreDetails.score;
  
  const reasonsHtml = scoreDetails.reasons.length > 0
    ? scoreDetails.reasons.map(r => `<li style="margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.5rem;"><span style="color:#fbbf24;">⚡</span> <span>${r}</span></li>`).join('')
    : `<li style="margin-bottom: 0.5rem; color: var(--text-muted);">No strong overlapping factors found.</li>`;
  
  content.innerHTML = `
    <div style="text-align:center; margin-bottom: 2rem;">
      <div class="match-avatar" style="background: ${student.color}; width: 120px; height: 120px; margin: 0 auto 1.5rem; font-size: 4rem;">${student.avatar}</div>
      <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${student.name}</h2>
      <p style="color: var(--text-muted)">${student.major} · ${student.year}</p>
      <div class="hero-badge" style="margin-top: 1rem;">${student.role} Role</div>
    </div>
    
    <div class="glass-card" style="padding: 1.5rem; margin-bottom: 2rem; border-color: var(--primary); text-align: left;">
      <h4 style="margin-bottom: 1rem; display: flex; justify-content: space-between;">
        <span>Compatibility Analysis</span>
        <span style="color: var(--primary)">${score}% Match</span>
      </h4>
      <ul style="font-size: 0.9rem; color: var(--text-main); list-style: none; padding-left: 0; line-height: 1.6; margin: 0;">
        ${reasonsHtml}
      </ul>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h4 style="margin-bottom: 1rem;">Expertise</h4>
        <div class="tag-grid">
          ${student.skills.map(s => `<span class="tag-btn" style="cursor:default">${s}</span>`).join('')}
        </div>
      </div>
      <div>
        <h4 style="margin-bottom: 1rem;">Interests</h4>
        <div class="tag-grid">
          ${student.interests.map(i => `<span class="tag-btn active" style="cursor:default">${i}</span>`).join('')}
        </div>
      </div>
    </div>

    <div style="margin-top: 3rem; text-align: center;">
      <button class="btn-primary btn-lg" style="width: 100%" onclick="connectRequest('${student.name}')">Send Connection Request</button>
    </div>
  `;
  
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

function connectRequest(name) {
  closeModal();
  showToast(`Request sent to ${name}!`);
}

// --- Feedback ---
function setRating(field, val) {
  currentRatings[field] = val;
  const container = document.getElementById(`star-${field}`);
  const stars = container.querySelectorAll('.star');
  stars.forEach((s, idx) => {
    s.classList.toggle('active', idx < val);
  });
}

function submitFeedback(e) {
  e.preventDefault();
  showToast("Thank you for your feedback!");
  document.getElementById('feedbackForm').reset();
  // Reset stars
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
  currentRatings = { overall: 0, match: 0, ease: 0 };
}

// --- Helpers ---
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
