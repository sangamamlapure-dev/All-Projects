/* =========================================================
   AcadFlow — Academic Project Management & Evaluation System
   ========================================================= */

const STORAGE_KEY = "acadflow_state_v7";

// 15 Official Mentors / Faculty Guides
const MENTORS_LIST = [
  "Prof. Dr. Shabina Modi",
  "Prof. Dr. Ganesh Dangat",
  "Prof. Vaibhav Bhosale",
  "Prof. Dr. Shubhangi Dhane",
  "Prof. Dr. Rahul Patil",
  "Prof. Sneha Kulkarni",
  "Prof. Amit Deshmukh",
  "Prof. Priya Jadhav",
  "Prof. Nitin Pawar",
  "Prof. Swati Joshi",
  "Prof. Akshay More",
  "Prof. Neha Chavan",
  "Prof. Mahesh Kadam",
  "Prof. Pooja Shinde",
  "Prof. Rohit Desai",
  "Ms. Ashwini Sawant",
  "Mrs. Uma Bhokare",
  "Mr. Bhagwat Uchale",
  "Ms. Monika Sonmale",
  "Ms. Tarrannum Sayyad-Shaikh",
  "Mr. Manoj Rathod"
];

// Official Project Groups Dataset with Team Leaders & Members
const ALL_STUDENTS_DATASET = [
  // Group G39
  { srNo: 140, group: "G39", prn: "23063181242010", name: "Sangam Shivprasad Amlapure", role: "Team Leader", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 141, group: "G39", prn: "23063181242023", name: "Sumit Pradip Gaikwad", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 142, group: "G39", prn: "24063181242504", name: "Karan Narayan Ghodke", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 143, group: "G39", prn: "23063181242014", name: "Shruti Anil Salunke", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },

  // Group G40
  { srNo: 144, group: "G40", prn: "23062701242128", name: "Pranav Pratap Gaikwad", role: "Team Leader", guide: "Mr. Manoj Rathod" },
  { srNo: 145, group: "G40", prn: "23062701242058", name: "Sahil Balakrushna Rasker", role: "Team Member", guide: "Mr. Manoj Rathod" },
  { srNo: 146, group: "G40", prn: "23062701242069", name: "Saeed Javed Momin", role: "Team Member", guide: "Mr. Manoj Rathod" },
  { srNo: 147, group: "G40", prn: "23062701242004", name: "Ravindra Dayanand Shinde", role: "Team Member", guide: "Mr. Manoj Rathod" },

  // Group G41
  { srNo: 148, group: "G41", prn: "23062701242036", name: "Omkar Jeevan Kale", role: "Team Leader", guide: "Ms. Ashwini Sawant" },
  { srNo: 149, group: "G41", prn: "23062701242035", name: "Mayur Mahesh Kamte", role: "Team Member", guide: "Ms. Ashwini Sawant" },
  { srNo: 150, group: "G41", prn: "23062701242038", name: "Soham Bhairavkumar Kamble", role: "Team Member", guide: "Ms. Ashwini Sawant" },
  { srNo: 151, group: "G41", prn: "23062701242073", name: "Surya Kiran Gengaje", role: "Team Member", guide: "Ms. Ashwini Sawant" },

  // Group G42
  { srNo: 152, group: "G42", prn: "23062701242100", name: "Viraj Sachin Jaykar", role: "Team Leader", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 153, group: "G42", prn: "23062701242011", name: "Aditya Pramod Govekar", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 154, group: "G42", prn: "23062701242106", name: "Raj Vikram Jagtap", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },

  // Group G43
  { srNo: 155, group: "G43", prn: "24062701242501", name: "Sahil Ramdas Chavan", role: "Team Leader", guide: "Ms. Monika Sonmale" },
  { srNo: 156, group: "G43", prn: "23062701242138", name: "Varadraj Kaviraj Rajput", role: "Team Member", guide: "Ms. Monika Sonmale" },
  { srNo: 157, group: "G43", prn: "23062701242063", name: "Dikshant Jitendra Dubale", role: "Team Member", guide: "Ms. Monika Sonmale" },
  { srNo: 158, group: "G43", prn: "2262701242131", name: "Aditya Indrajeet Hande", role: "Team Member", guide: "Ms. Monika Sonmale" },

  // Group G44
  { srNo: 159, group: "G44", prn: "24063181242509", name: "Pratiksha Prakash Ujlambe", role: "Team Leader", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 160, group: "G44", prn: "24063181242502", name: "Divya Ramesh Bhalerao", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },
  { srNo: 161, group: "G44", prn: "2262701242016", name: "Aishwarya Balasaheb Tompe", role: "Team Member", guide: "Prof. Dr. Ganesh Dangat" },

  // Group G45
  { srNo: 162, group: "G45", prn: "23062701242096", name: "Shravani Mahadev Dhaigude", role: "Team Leader", guide: "Ms. Tarrannum Sayyad-Shaikh" },
  { srNo: 163, group: "G45", prn: "23062701242043", name: "Satish Ashok Dadas", role: "Team Member", guide: "Ms. Tarrannum Sayyad-Shaikh" },

  // Group G1
  { srNo: 1, group: "G1", prn: "23062701242024", name: "Sakshi Devidas Salunkhe", role: "Team Leader", guide: "Prof. Dr. Shabina Modi" },
  { srNo: 2, group: "G1", prn: "23062701242021", name: "Arpita Ganpat Kadam", role: "Team Member", guide: "Prof. Dr. Shabina Modi" },
  { srNo: 3, group: "G1", prn: "23062701242052", name: "Diksha Rajendra Mohite", role: "Team Member", guide: "Prof. Dr. Shabina Modi" },
  { srNo: 4, group: "G1", prn: "23062701242023", name: "Aishwarya Dadasaheb Gaikwad", role: "Team Member", guide: "Prof. Dr. Shabina Modi" },

  // Group G2
  { srNo: 6, group: "G2", prn: "23062701242031", name: "Sayali Satish Bhosale", role: "Team Leader", guide: "Ms. Ashwini Sawant" },
  { srNo: 7, group: "G2", prn: "23062701242109", name: "Vaishnavi Mahadev Karpe", role: "Team Member", guide: "Ms. Ashwini Sawant" },
  { srNo: 8, group: "G2", prn: "23062701242025", name: "Madhuri Gulchand Khade", role: "Team Member", guide: "Ms. Ashwini Sawant" },
  { srNo: 9, group: "G2", prn: "24062701242507", name: "Priti Suresh Kokare", role: "Team Member", guide: "Ms. Ashwini Sawant" },

  // Group G3
  { srNo: 10, group: "G3", prn: "24062701242507", name: "Pranali Laxman Kore", role: "Team Leader", guide: "Mrs. Uma Bhokare" },
  { srNo: 11, group: "G3", prn: "23062701242108", name: "Vaishnavi Jitendra Kale", role: "Team Member", guide: "Mrs. Uma Bhokare" },
  { srNo: 12, group: "G3", prn: "23062701242042", name: "Ghanasham Balkrushna Dalvi", role: "Team Member", guide: "Mrs. Uma Bhokare" },

  // Group G4
  { srNo: 13, group: "G4", prn: "23062701242113", name: "Khushi Adhik Jagadale", role: "Team Leader", guide: "Mr. Bhagwat Uchale" },
  { srNo: 14, group: "G4", prn: "23062701242044", name: "Swapnil Dilip Lohar", role: "Team Member", guide: "Mr. Bhagwat Uchale" },
  { srNo: 15, group: "G4", prn: "23062701242065", name: "Ganesh Mahankal Thite", role: "Team Member", guide: "Mr. Bhagwat Uchale" },
  { srNo: 16, group: "G4", prn: "23062701242088", name: "Prathamesh Vijaykumar Diwane", role: "Team Member", guide: "Mr. Bhagwat Uchale" },

  // Group G5
  { srNo: 17, group: "G5", prn: "23062701242020", name: "Saee Sachin Jambhale", role: "Team Leader", guide: "Prof. Dr. Shabina Modi" },
  { srNo: 18, group: "G5", prn: "23062701242060", name: "Vaibhav Madhav Kapde", role: "Team Member", guide: "Prof. Dr. Shabina Modi" },
  { srNo: 19, group: "G5", prn: "23062701242029", name: "Shruti Vikas Jadhav", role: "Team Member", guide: "Prof. Dr. Shabina Modi" },
  { srNo: 20, group: "G5", prn: "23062701242028", name: "Nikita Bipin Kadam", role: "Team Member", guide: "Prof. Dr. Shabina Modi" },

  // Group G6
  { srNo: 21, group: "G6", prn: "23062701242030", name: "Poorva Mahesh Jangam", role: "Team Leader", guide: "Ms. Monika Sonmale" },
  { srNo: 22, group: "G6", prn: "23062701242050", name: "Suyash Ankush Bhosale", role: "Team Member", guide: "Ms. Monika Sonmale" },
  { srNo: 23, group: "G6", prn: "23062701242084", name: "Samruddhi Sachin Dude", role: "Team Member", guide: "Ms. Monika Sonmale" },

  // Group G7
  { srNo: 24, group: "G7", prn: "23062701242026", name: "Mudassar Hidayatulla Sawardekar", role: "Team Leader", guide: "Ms. Tarrannum Sayyad-Shaikh" },
  { srNo: 25, group: "G7", prn: "230627012420135", name: "Vaibhav Tanaji Salunkhe", role: "Team Member", guide: "Ms. Tarrannum Sayyad-Shaikh" },
  { srNo: 26, group: "G7", prn: "2262701242058", name: "Sandesh Raju Gade", role: "Team Member", guide: "Ms. Tarrannum Sayyad-Shaikh" },
  { srNo: 27, group: "G7", prn: "23062701242022", name: "Parth Ramesh Sonawane", role: "Team Member", guide: "Ms. Tarrannum Sayyad-Shaikh" },

  // Group G8
  { srNo: 28, group: "G8", prn: "23062701242094", name: "Athrav Suryakant Suryawanshi", role: "Team Leader", guide: "Mr. Manoj Rathod" },
  { srNo: 29, group: "G8", prn: "23062701242077", name: "Faizan Nasir Shaikh", role: "Team Member", guide: "Mr. Manoj Rathod" },
  { srNo: 30, group: "G8", prn: "23062701242122", name: "Prathamesh Rajendra Ghadge", role: "Team Member", guide: "Mr. Manoj Rathod" },
  { srNo: 31, group: "G8", prn: "23062701242120", name: "Vivek Jitendra Shelar", role: "Team Member", guide: "Mr. Manoj Rathod" }
];

// Official Project Details
const OFFICIAL_PROJECT = {
  group: "G39",
  title: "AcadFlow – Academic Project Management and Evaluation System",
  guide: "Prof. Dr. Ganesh Dangat",
  college: "Karmaveer Bhaurao Patil College of Engineering, Satara",
  department: "Computer Science and Engineering",
  academicYear: "2026-27",
  status: "In Progress",
  progress: 68,
  startDate: "25/07/2026",
  reviewDate: "21/10/2026",
  members: ALL_STUDENTS_DATASET.filter(s => s.group === "G39")
};

// Official Academic Calendar (AY 2026-27)
const OFFICIAL_CALENDAR = [
  { no: 1, title: "Project Group Formation and/or Project Ideas Discussion", date: "25/07/2026", marks: "—" },
  { no: 2, title: "Project Guide finalization and Display of project members along with project guide", date: "01/08/2026", marks: "—" },
  { no: 3, title: "Project idea and Project Title Finalization (Presentation No.1)", date: "21/08/2026", marks: "—" },
  { no: 4, title: "Display of Project List", date: "25/08/2026", marks: "—" },
  { no: 5, title: "Synopsis Submission", date: "11/09/2026", marks: "CA 5" },
  { no: 6, title: "SEM-I Project Review-I (Presentation No.2)", date: "18/09/2026", marks: "CA 10" },
  { no: 7, title: "SEM-I Project Review-II (Presentation No.3)", date: "21/10/2026", marks: "CA 15" },
  { no: 8, title: "Paper presentation and/or publication", date: "Till marks uploaded on DBATU Portal", marks: "CA 10" },
  { no: 9, title: "Attendance in each meeting", date: "13/11/2026", marks: "CA 4" },
  { no: 10, title: "Participation in project competition", date: "19/11/2026", marks: "CA 4" },
  { no: 11, title: "Project Diary (Project Work Book) Submission", date: "22/11/2026", marks: "CA 2" },
  { no: 12, title: "Project Stage-I Report Submission", date: "22/11/2026", marks: "CA 10" },
  { no: 13, title: "Final Presentation and University examination", date: "22/11/2026 to 27/11/2026", marks: "ESE 40" },
  { no: 14, title: "Marks Compilation and Upload", date: "As per University Guidelines", marks: "—" }
];

// Mark Rubrics
const MARK_RUBRICS = [
  { id: "synopsis", title: "Project Synopsis / Initial submission", max: 5 },
  { id: "review1", title: "Review I (Presentation No.2)", max: 10 },
  { id: "review2", title: "Review II (Presentation No.3)", max: 15 },
  { id: "paper", title: "Paper presentation / publication", max: 10 },
  { id: "attendance", title: "Attendance in each meeting", max: 4 },
  { id: "competition", title: "Participation in project competition", max: 4 },
  { id: "diary", title: "Project Diary (Project Work Book)", max: 2 },
  { id: "stage1", title: "Project Stage-I Report", max: 10 }
];

// Demo accounts for Quick Login
const DEMO_ACCOUNTS = {
  student: {
    username: "23063181242010",
    password: "student123",
    name: "Sangam Shivprasad Amlapure",
    role: "student",
    prn: "23063181242010",
    email: "sangam.amlapure@kbpcoes.edu.in",
    group: "G39"
  },
  mentor: {
    username: "ganesh.dangat",
    password: "mentor123",
    name: "Prof. Dr. Ganesh Dangat",
    role: "mentor",
    prn: "FAC-CSE-02",
    email: "ganesh.dangat@kbpcoes.edu.in",
    dept: "Computer Science and Engineering"
  },
  admin: {
    username: "admin",
    password: "admin123",
    name: "Project Coordinator (Admin)",
    role: "admin",
    prn: "ADMIN-01",
    email: "projects.cse@kbpcoes.edu.in",
    dept: "Computer Science and Engineering"
  },
  panel: {
    username: "panel",
    password: "panel123",
    name: "Prof. Dr. Shabina Modi",
    role: "panel",
    prn: "PANEL-01",
    email: "shabina.modi@kbpcoes.edu.in",
    dept: "Computer Science and Engineering"
  }
};

// Initial State Generator
function getDefaultState() {
  const assignments = {};
  ALL_STUDENTS_DATASET.forEach(s => {
    assignments[s.group] = s.guide;
  });

  return {
    currentUser: null,
    activePage: "dashboard",
    theme: "light",
    mentorPreferences: {},
    mentorAssignments: assignments,
    tasks: [
      {
        id: 1,
        group: "G39",
        title: "SRS Document Finalization",
        desc: "Complete Software Requirements Specification based on guide's inputs.",
        assignedDate: "10/08/2026",
        dueDate: "20/08/2026",
        priority: "High",
        status: "Completed"
      },
      {
        id: 2,
        group: "G39",
        title: "Design Architecture & ER Models",
        desc: "Prepare system architecture, sequence diagrams and DB schema.",
        assignedDate: "22/08/2026",
        dueDate: "10/09/2026",
        priority: "High",
        status: "In Progress"
      },
      {
        id: 3,
        group: "G39",
        title: "Maintain Weekly Project Diary",
        desc: "Record all meetings, discussions with guide, and weekly milestones.",
        assignedDate: "01/08/2026",
        dueDate: "22/11/2026",
        priority: "Medium",
        status: "In Progress"
      }
    ],
    documents: [
      {
        id: 1,
        group: "G39",
        type: "Synopsis",
        name: "AcadFlow_Project_Synopsis_G39.pdf",
        submissionDate: "10/09/2026",
        status: "Approved",
        feedback: "Scope is clear. Approved for SEM-I Review-I."
      },
      {
        id: 2,
        group: "G39",
        type: "Project Proposal",
        name: "Project_Proposal_Draft_G39.pdf",
        submissionDate: "15/08/2026",
        status: "Approved",
        feedback: "Title and objectives verified."
      },
      {
        id: 3,
        group: "G39",
        type: "Stage-I Report",
        name: "Stage1_Report_Draft_G39.docx",
        submissionDate: "12/09/2026",
        status: "Under Review",
        feedback: "Needs formal bibliography format."
      }
    ],
    marks: {
      "G39": {
        synopsis: 5,
        review1: 9,
        review2: 13,
        paper: 8,
        attendance: 4,
        competition: 3,
        diary: 2,
        stage1: 9,
        ese: 36,
        caTotal: 53,
        grandTotal: 89,
        submitted: true,
        evaluatedBy: "Prof. Dr. Shabina Modi",
        evaluationDate: "12/09/2026"
      }
    },
    feedback: [
      {
        id: 1,
        group: "G39",
        mentor: "Prof. Dr. Ganesh Dangat",
        date: "10/09/2026",
        category: "Technical",
        text: "The frontend interface is responsive. Focus on verifying database schemas for rubric calculations."
      }
    ],
    notifications: [
      {
        id: 1,
        targetRole: "all",
        title: "Official Project Groups Uploaded",
        text: "Groups G1 to G8 and G39 to G45 mapped with Team Leaders & Guides.",
        date: "01/08/2026"
      },
      {
        id: 2,
        targetRole: "student",
        title: "Mentor Assignment Finalized",
        text: "Group G39 has been officially assigned to Prof. Dr. Ganesh Dangat.",
        date: "01/08/2026"
      },
      {
        id: 3,
        targetRole: "student",
        title: "Review-I Presentation Scheduled",
        text: "Presentation No.2 scheduled for 18/09/2026 in Lab 3.",
        date: "12/09/2026"
      }
    ]
  };
}

let state = getDefaultState();

/* =========================================================
   Persistence Helpers (Safe Deep Recovery)
   ========================================================= */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaultState();

      state = {
        ...defaults,
        ...parsed,
        marks: (parsed && typeof parsed.marks === "object" && parsed.marks !== null) ? { ...defaults.marks, ...parsed.marks } : defaults.marks,
        mentorAssignments: (parsed && typeof parsed.mentorAssignments === "object" && parsed.mentorAssignments !== null) ? { ...defaults.mentorAssignments, ...parsed.mentorAssignments } : defaults.mentorAssignments,
        mentorPreferences: (parsed && typeof parsed.mentorPreferences === "object" && parsed.mentorPreferences !== null) ? { ...defaults.mentorPreferences, ...parsed.mentorPreferences } : defaults.mentorPreferences,
        tasks: (parsed && Array.isArray(parsed.tasks)) ? parsed.tasks : defaults.tasks,
        documents: (parsed && Array.isArray(parsed.documents)) ? parsed.documents : defaults.documents,
        notifications: (parsed && Array.isArray(parsed.notifications)) ? parsed.notifications : defaults.notifications,
        feedback: (parsed && Array.isArray(parsed.feedback)) ? parsed.feedback : defaults.feedback
      };
    }
  } catch (err) {
    console.error("State loading error, resetting to default:", err);
    state = getDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("State save error:", err);
  }
}

function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  state = getDefaultState();
  location.reload();
}

function toast(msg, type = "ok") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = type;
  t.style.display = "block";
  setTimeout(() => {
    t.style.display = "none";
  }, 2600);
}

function esc(val = "") {
  return String(val).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  saveState();
  renderApp();
}

function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  if (sb) sb.classList.toggle("open");
}

/* =========================================================
   Authentication
   ========================================================= */

function quickLogin(roleKey) {
  const acc = DEMO_ACCOUNTS[roleKey];
  if (!acc) return;
  state.currentUser = { ...acc };
  state.activePage = "dashboard";
  saveState();
  renderApp();
  toast(`Logged in as ${acc.name} (${acc.role.toUpperCase()})`);
}

function renderLogin() {
  document.documentElement.setAttribute("data-theme", state.theme || "light");
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="login-brand">
          <div class="login-logo">AF</div>
          <h1>Acad<span>Flow</span></h1>
          <p>Manage • Collaborate • Track • Achieve</p>
        </div>

        <div class="quick-login-box">
          <span class="quick-login-title">⚡ 1-Click Instant Login</span>
          <div class="quick-btn-grid">
            <button class="btn btn-primary" onclick="quickLogin('student')">👨‍🎓 Student (G39)</button>
            <button class="btn btn-outline" onclick="quickLogin('mentor')">👨‍🏫 Mentor (Dr. Dangat)</button>
            <button class="btn btn-outline" onclick="quickLogin('admin')">⚙️ Administrator</button>
            <button class="btn btn-outline" onclick="quickLogin('panel')">📝 Panel Member</button>
          </div>
        </div>

        <form id="manualLoginForm" onsubmit="handleManualLogin(event)">
          <div class="form-group">
            <label class="form-label">Select Role</label>
            <select id="loginRole" class="select" onchange="fillCredentialsForRole()">
              <option value="student">Student (Sangam Amlapure - Leader G39)</option>
              <option value="mentor">Mentor (Prof. Dr. Ganesh Dangat)</option>
              <option value="admin">Administrator</option>
              <option value="panel">Panel Member (Prof. Dr. Shabina Modi)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Username / PRN</label>
            <input id="loginUsername" class="input" placeholder="Enter PRN or username" value="${DEMO_ACCOUNTS.student.username}">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="loginPassword" type="password" class="input" placeholder="Enter password" value="${DEMO_ACCOUNTS.student.password}">
          </div>

          <button type="submit" class="btn btn-primary btn-full">Sign In to Workspace →</button>
        </form>
      </div>
    </div>
  `;
}

function fillCredentialsForRole() {
  const role = document.getElementById("loginRole").value;
  const acc = DEMO_ACCOUNTS[role];
  if (acc) {
    document.getElementById("loginUsername").value = acc.username;
    document.getElementById("loginPassword").value = acc.password;
  }
}

function handleManualLogin(e) {
  if (e) e.preventDefault();
  const role = document.getElementById("loginRole").value;
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const targetAcc = DEMO_ACCOUNTS[role];
  if (targetAcc && (targetAcc.username === username || targetAcc.prn === username) && targetAcc.password === password) {
    state.currentUser = { ...targetAcc };
    state.activePage = "dashboard";
    saveState();
    renderApp();
    toast(`Welcome back, ${targetAcc.name}!`);
    return;
  }

  for (const r in DEMO_ACCOUNTS) {
    const acc = DEMO_ACCOUNTS[r];
    if ((acc.username === username || acc.prn === username) && acc.password === password) {
      state.currentUser = { ...acc };
      state.activePage = "dashboard";
      saveState();
      renderApp();
      toast(`Welcome back, ${acc.name}!`);
      return;
    }
  }

  toast("Invalid username/PRN or password. Please use 1-Click login.", "err");
}

function handleLogout() {
  state.currentUser = null;
  state.activePage = "dashboard";
  saveState();
  renderLogin();
}

/* =========================================================
   Sidebar Navigation Menus
   ========================================================= */

function getNavigationMenus() {
  const r = state.currentUser ? state.currentUser.role : "student";
  if (r === "student") {
    return [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "projects", label: "My Projects", icon: "▣" },
      { id: "tasks", label: "Tasks", icon: "✓" },
      { id: "team", label: "Team", icon: "👥" },
      { id: "mentor-preferences", label: "Mentor Preference", icon: "★" },
      { id: "documentation", label: "Documentation", icon: "▤" },
      { id: "notifications", label: "Notifications", icon: "🔔" },
      { id: "reports", label: "Reports & Marks", icon: "▥" },
      { id: "calendar", label: "Project Calendar", icon: "▦" },
      { id: "profile", label: "Profile", icon: "●" },
      { id: "settings", label: "Settings", icon: "⚙" }
    ];
  }
  if (r === "mentor") {
    return [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "projects", label: "My Projects", icon: "▣" },
      { id: "students", label: "My Students", icon: "👥" },
      { id: "tasks", label: "Tasks", icon: "✓" },
      { id: "documentation", label: "Documentation Review", icon: "▤" },
      { id: "feedback", label: "Feedback", icon: "✎" },
      { id: "calendar", label: "Project Calendar", icon: "▦" },
      { id: "notifications", label: "Notifications", icon: "🔔" },
      { id: "profile", label: "Profile", icon: "●" },
      { id: "settings", label: "Settings", icon: "⚙" }
    ];
  }
  if (r === "admin") {
    return [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "projects", label: "Projects", icon: "▣" },
      { id: "students", label: "Students Master", icon: "👥" },
      { id: "mentors", label: "Mentors", icon: "★" },
      { id: "assignment", label: "Mentor Assignment", icon: "⇄" },
      { id: "teams", label: "All Teams", icon: "◈" },
      { id: "documentation", label: "Documentation", icon: "▥" },
      { id: "monitoring", label: "Project Monitoring", icon: "◉" },
      { id: "calendar", label: "Project Calendar", icon: "▦" },
      { id: "notifications", label: "Notifications", icon: "🔔" },
      { id: "profile", label: "Profile", icon: "●" },
      { id: "settings", label: "Settings", icon: "⚙" }
    ];
  }
  return [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "projects", label: "Assigned Projects", icon: "▣" },
    { id: "evaluation", label: "Project Evaluation", icon: "✓" },
    { id: "documentation", label: "Documentation", icon: "▤" },
    { id: "calendar", label: "Project Calendar", icon: "▦" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "reports", label: "Reports", icon: "▥" },
    { id: "profile", label: "Profile", icon: "●" },
    { id: "settings", label: "Settings", icon: "⚙" }
  ];
}

/* =========================================================
   Application Layout
   ========================================================= */

function renderApp() {
  loadState();
  if (!state.currentUser) {
    renderLogin();
    return;
  }

  document.documentElement.setAttribute("data-theme", state.theme || "light");
  const user = state.currentUser;
  const menus = getNavigationMenus();

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand-bar">
          <div class="brand-icon">AF</div>
          <div class="brand-title">Acad<span>Flow</span></div>
        </div>

        <div class="role-tag">
          <div class="role-dot"></div>
          ${user.role.toUpperCase()} WORKSPACE
        </div>

        <nav class="nav">
          ${menus.map(m => `
            <button class="nav-item ${state.activePage === m.id ? 'active' : ''}" onclick="navigate('${m.id}')">
              <span class="nav-icon">${m.icon}</span>
              <span>${m.label}</span>
            </button>
          `).join('')}
        </nav>

        <div style="padding:14px; border-top:1px solid var(--border);">
          <button class="nav-item" style="color:var(--danger);" onclick="handleLogout()">
            <span class="nav-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div style="display:flex; align-items:center; gap:14px;">
            <button class="mobile-toggle" onclick="toggleSidebar()">☰</button>
            <div>
              <h3 style="font-size:16px; font-weight:800;">Karmaveer Bhaurao Patil College of Engineering, Satara</h3>
              <p style="font-size:12px; color:var(--text-muted);">Department of Computer Science and Engineering • AY 2026-27</p>
            </div>
          </div>

          <div class="user-panel">
            <button class="theme-btn" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
              ${state.theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div class="avatar">${initials(user.name)}</div>
            <div>
              <div style="font-size:13px; font-weight:800;">${esc(user.name)}</div>
              <div style="font-size:11px; color:var(--text-muted);">${user.role.toUpperCase()} • ${user.group || user.prn || 'CSE'}</div>
            </div>
          </div>
        </header>

        <section class="content">
          ${renderPageContent()}
        </section>
      </main>
    </div>
  `;
}

function navigate(pageId) {
  state.activePage = pageId;
  saveState();
  renderApp();
}

/* =========================================================
   Page Router
   ========================================================= */

function renderPageContent() {
  const page = state.activePage;
  const role = state.currentUser ? state.currentUser.role : "student";

  switch (page) {
    case "dashboard":
      if (role === "student") return renderStudentDashboard();
      if (role === "mentor") return renderMentorDashboard();
      if (role === "admin") return renderAdminDashboard();
      return renderPanelDashboard();

    case "projects":
      if (role === "mentor" || role === "panel") return renderAssignedProjectsView();
      return renderProjectsView();

    case "tasks":
      return renderTasksView();

    case "team":
    case "teams":
      return renderTeamView();

    case "mentor-preferences":
      return renderMentorPreferencesView();

    case "assignment":
      return renderMentorAssignmentView();

    case "documentation":
      return renderDocumentationView();

    case "reports":
      return renderReportsView();

    case "calendar":
      return renderCalendarView();

    case "students":
      return renderStudentsView();

    case "mentors":
      return renderMentorsDirectoryView();

    case "evaluation":
      return renderPanelEvaluationView();

    case "monitoring":
      return renderProjectMonitoringView();

    case "feedback":
      return renderFeedbackView();

    case "notifications":
      return renderNotificationsView();

    case "profile":
      return renderProfileView();

    case "settings":
      return renderSettingsView();

    default:
      return renderStudentDashboard();
  }
}

/* =========================================================
   1. STUDENT MODULE
   ========================================================= */

function renderStudentDashboard() {
  const marksObj = state.marks && state.marks["G39"] ? state.marks["G39"] : { caTotal: 0, grandTotal: 0 };
  const assignedMentor = state.mentorAssignments && state.mentorAssignments["G39"] ? state.mentorAssignments["G39"] : "Prof. Dr. Ganesh Dangat";
  const pendingTasks = (state.tasks || []).filter(t => t.group === "G39" && t.status !== "Completed").length;

  return `
    <div class="page-head">
      <div>
        <h2>Student Dashboard</h2>
        <p>Project Track: Group G39 • ${esc(OFFICIAL_PROJECT.title)}</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('mentor-preferences')">★ Set Mentor Preferences</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">◈</div>
        <div class="stat-info">
          <small>Project Progress</small>
          <strong>${OFFICIAL_PROJECT.progress}%</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">★</div>
        <div class="stat-info">
          <small>Assigned Mentor</small>
          <strong style="font-size:14px;">${esc(assignedMentor)}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✓</div>
        <div class="stat-info">
          <small>Pending Tasks</small>
          <strong>${pendingTasks}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">▥</div>
        <div class="stat-info">
          <small>Total Evaluation</small>
          <strong style="color:var(--primary);">${marksObj.grandTotal} / 100</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Project Information & Status</h3>
        <span class="badge green">Stage-I Active</span>
      </div>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.7;">
        <b>Title:</b> ${esc(OFFICIAL_PROJECT.title)}<br>
        <b>Group ID:</b> ${OFFICIAL_PROJECT.group} • <b>Academic Year:</b> ${OFFICIAL_PROJECT.academicYear}<br>
        <b>Official Guide:</b> ${esc(assignedMentor)}<br>
        <b>Upcoming Review:</b> SEM-I Project Review-II (Presentation No.3) on <b>21/10/2026</b>
      </p>
      <div style="margin-top:14px;">
        <div class="progress-container">
          <div class="progress-fill" style="width:${OFFICIAL_PROJECT.progress}%;"></div>
        </div>
        <small style="display:block; margin-top:6px; color:var(--text-muted); font-size:11px;">Stage-I Completion: ${OFFICIAL_PROJECT.progress}%</small>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Sprint Action Items & Milestones</h3>
        <button class="btn btn-outline" onclick="navigate('tasks')">View All Tasks →</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(state.tasks || []).map(t => `
              <tr>
                <td><b>${esc(t.title)}</b></td>
                <td>${t.dueDate}</td>
                <td><span class="badge ${t.priority==='High'?'orange':'blue'}">${t.priority}</span></td>
                <td><span class="badge ${t.status==='Completed'?'green':'gray'}">${t.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderProjectsView() {
  const p = OFFICIAL_PROJECT;
  const guide = state.mentorAssignments && state.mentorAssignments[p.group] ? state.mentorAssignments[p.group] : p.guide;
  return `
    <div class="page-head">
      <div>
        <h2>Project Repository</h2>
        <p>Comprehensive overview of registered academic project</p>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <span class="badge blue" style="margin-bottom:6px;">Group ${p.group}</span>
          <h3 style="font-size:18px;">${esc(p.title)}</h3>
        </div>
        <span class="badge green">${p.status}</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin:20px 0; font-size:13px;">
        <div><b>College:</b><br><span style="color:var(--text-muted);">${p.college}</span></div>
        <div><b>Department:</b><br><span style="color:var(--text-muted);">${p.department}</span></div>
        <div><b>Project Guide:</b><br><span style="color:var(--text); font-weight:700;">${esc(guide)}</span></div>
        <div><b>Start Date:</b><br><span style="color:var(--text-muted);">${p.startDate}</span></div>
      </div>

      <h4 style="font-size:14px; margin-bottom:10px;">Registered Team Members:</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Member Name</th>
              <th>PRN</th>
              <th>Project Role</th>
            </tr>
          </thead>
          <tbody>
            ${p.members.map((m) => `
              <tr>
                <td>${m.srNo}</td>
                <td><b>${esc(m.name)}</b></td>
                <td>${m.prn}</td>
                <td><span class="badge ${m.role==='Team Leader'?'purple':'gray'}">${m.role}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMentorPreferencesView() {
  const existingPrefs = state.mentorPreferences && state.mentorPreferences["G39"] ? state.mentorPreferences["G39"] : [];

  return `
    <div class="page-head">
      <div>
        <h2>15 Mentor Preference Ranking</h2>
        <p>Rank all 15 faculty mentors in order of priority (1 to 15). Every rank must be unique.</p>
      </div>
    </div>

    <div class="card">
      <div class="notice">
        <b>Important Guidelines:</b><br>
        1. You must assign each rank from <b>1 to 15</b> exactly once.<br>
        2. Mentor preference is only a preference. Student cannot directly finalize the mentor.<br>
        3. Final mentor assignment will be made by the Department Project Coordinator (Admin).
      </div>

      <form id="mentorPrefForm" onsubmit="handleSaveMentorPreferences(event)">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mentor Name</th>
                <th>Designation / Dept</th>
                <th>Your Preference Rank (1 to 15)</th>
              </tr>
            </thead>
            <tbody>
              ${MENTORS_LIST.slice(0, 15).map((mentor, index) => {
                const found = existingPrefs.find(p => p.mentor === mentor);
                const assignedRank = found ? found.rank : "";
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><b>${esc(mentor)}</b></td>
                    <td>Faculty, Computer Science & Engg</td>
                    <td>
                      <select class="select pref-rank-select" data-mentor="${esc(mentor)}" style="width:160px;">
                        <option value="">Select Rank</option>
                        ${Array.from({ length: 15 }, (_, i) => i + 1).map(r => `
                          <option value="${r}" ${assignedRank === r ? 'selected' : ''}>Rank ${r}</option>
                        `).join('')}
                      </select>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top:20px; display:flex; justify-content:flex-end;">
          <button type="submit" class="btn btn-primary">Submit Preferences to Admin</button>
        </div>
      </form>
    </div>
  `;
}

function handleSaveMentorPreferences(e) {
  e.preventDefault();
  const selects = [...document.querySelectorAll(".pref-rank-select")];
  const values = selects.map(s => s.value).filter(Boolean);

  if (values.length !== 15) {
    toast("Please select a rank for all 15 mentors.", "err");
    return;
  }

  const uniqueRanks = new Set(values);
  if (uniqueRanks.size !== 15) {
    toast("Each rank from 1 to 15 must be unique with no duplicates.", "err");
    return;
  }

  const sortedPreferences = selects.map(s => ({
    mentor: s.dataset.mentor,
    rank: parseInt(s.value, 10)
  })).sort((a, b) => a.rank - b.rank);

  if (!state.mentorPreferences) state.mentorPreferences = {};
  state.mentorPreferences["G39"] = sortedPreferences;

  if (!state.notifications) state.notifications = [];
  state.notifications.unshift({
    id: Date.now(),
    targetRole: "admin",
    title: "Preferences Submitted: Group G39",
    text: "Group G39 has submitted their 15 mentor preference rankings.",
    date: "13/09/2026"
  });

  saveState();
  toast("Mentor preferences successfully saved!");
  renderApp();
}

function renderDocumentationView() {
  const isStudent = state.currentUser && state.currentUser.role === "student";
  return `
    <div class="page-head">
      <div>
        <h2>Project Documentation Repository</h2>
        <p>Stage-I submission tracks: Synopsis, Proposal, SRS, Design, Diary, and Reports</p>
      </div>
      ${isStudent ? `<button class="btn btn-primary" onclick="openUploadDocumentModal()">+ Upload New Artifact</button>` : ''}
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Document Type</th>
              <th>File Name</th>
              <th>Submitted Date</th>
              <th>Review Status</th>
              <th>Reviewer Feedback</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${(state.documents || []).map(doc => `
              <tr>
                <td><b>${esc(doc.type)}</b></td>
                <td>${esc(doc.name)}</td>
                <td>${doc.submissionDate}</td>
                <td>
                  <span class="badge ${doc.status==='Approved'?'green':doc.status==='Under Review'?'orange':'red'}">
                    ${doc.status}
                  </span>
                </td>
                <td><small style="color:var(--text-muted);">${esc(doc.feedback || 'Pending review')}</small></td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="toast('Downloading ${esc(doc.name)}...')">Download</button>
                    ${!isStudent ? `
                      <button class="btn btn-success" style="padding:4px 8px; font-size:11px;" onclick="approveDocument(${doc.id})">Approve</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openUploadDocumentModal() {
  document.getElementById("modal-container").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <div class="modal-head">
          <h3 style="font-weight:800;">Upload Project Artifact</h3>
          <button class="btn btn-outline" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleUploadDocument(event)">
          <div class="form-group">
            <label class="form-label">Document Category</label>
            <select id="docType" class="select">
              <option value="Synopsis">Synopsis</option>
              <option value="Project Proposal">Project Proposal</option>
              <option value="SRS">SRS Document</option>
              <option value="Design">Design & Architecture</option>
              <option value="Progress Report">Progress Report</option>
              <option value="Stage-I Report">Stage-I Report</option>
              <option value="Presentation">Presentation (PPTX)</option>
              <option value="Other">Other Document</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Document File Name</label>
            <input id="docFileName" class="input" placeholder="e.g. Stage1_Architecture_Diagrams.pdf" required>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Submit Artifact</button>
        </form>
      </div>
    </div>
  `;
}

function handleUploadDocument(e) {
  e.preventDefault();
  const type = document.getElementById("docType").value;
  const name = document.getElementById("docFileName").value.trim();
  if (!name) return;

  if (!state.documents) state.documents = [];
  state.documents.push({
    id: Date.now(),
    group: "G39",
    type,
    name,
    submissionDate: "13/09/2026",
    status: "Under Review",
    feedback: "Submitted for guide evaluation."
  });

  saveState();
  closeModal();
  renderApp();
  toast("Document uploaded successfully!");
}

function approveDocument(docId) {
  state.documents = (state.documents || []).map(d => d.id === docId ? { ...d, status: "Approved", feedback: "Verified by mentor/panel." } : d);
  saveState();
  renderApp();
  toast("Document marked as Approved.");
}

function renderReportsView() {
  const marks = state.marks && state.marks["G39"] ? state.marks["G39"] : {
    synopsis: 0, review1: 0, review2: 0, paper: 0, attendance: 0,
    competition: 0, diary: 0, stage1: 0, ese: 0, caTotal: 0, grandTotal: 0
  };

  return `
    <div class="page-head">
      <div>
        <h2>Continuous Assessment & University Examination Marks</h2>
        <p>Evaluated under Dr. Babasaheb Ambedkar Technological University (DBATU) Norms</p>
      </div>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print Marksheet</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">▥</div>
        <div class="stat-info">
          <small>Continuous Assessment (CA)</small>
          <strong style="color:var(--primary);">${marks.caTotal} / 60</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✓</div>
        <div class="stat-info">
          <small>University ESE Exam</small>
          <strong>${marks.ese} / 40</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <small>Total Final Marks</small>
          <strong style="color:var(--success);">${marks.grandTotal} / 100</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">●</div>
        <div class="stat-info">
          <small>Evaluation Status</small>
          <strong>${marks.submitted ? 'Published' : 'Draft'}</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Stage-I Component Breakdown</h3>
        <small style="color:var(--text-muted);">Evaluated by: ${esc(marks.evaluatedBy || 'Panel Members')}</small>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Evaluation Component</th>
              <th>Marks Obtained</th>
              <th>Maximum Marks</th>
              <th>Assessment Mode</th>
            </tr>
          </thead>
          <tbody>
            ${MARK_RUBRICS.map(r => `
              <tr>
                <td><b>${r.title}</b></td>
                <td><b style="color:var(--primary); font-size:14px;">${marks[r.id] || 0}</b></td>
                <td>${r.max}</td>
                <td>Continuous Assessment (CA)</td>
              </tr>
            `).join('')}
            <tr style="background:var(--primary-subtle);">
              <td><b>Continuous Assessment (CA) Sub-Total</b></td>
              <td><b>${marks.caTotal}</b></td>
              <td><b>60</b></td>
              <td><b>CA Total</b></td>
            </tr>
            <tr>
              <td><b>Final Presentation and University Examination</b></td>
              <td><b style="color:var(--primary); font-size:14px;">${marks.ese || 0}</b></td>
              <td>40</td>
              <td>End Semester Exam (ESE)</td>
            </tr>
            <tr style="background:var(--primary-subtle); font-size:15px;">
              <td><b>Overall Grand Total (CA + ESE)</b></td>
              <td><b style="color:var(--primary);">${marks.grandTotal}</b></td>
              <td><b>100</b></td>
              <td><b>Final Grade</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCalendarView() {
  return `
    <div class="page-head">
      <div>
        <h2>Project Academic Calendar</h2>
        <p>Karmaveer Bhaurao Patil College of Engineering, Satara • AY 2026-27</p>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Milestone / Activity</th>
              <th>Target Timeline</th>
              <th>Examination Weightage</th>
            </tr>
          </thead>
          <tbody>
            ${OFFICIAL_CALENDAR.map(c => `
              <tr>
                <td>${c.no}</td>
                <td><b>${esc(c.title)}</b></td>
                <td>${esc(c.date)}</td>
                <td><span class="badge ${c.marks.includes('CA')?'blue':c.marks.includes('ESE')?'purple':'gray'}">${esc(c.marks)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTeamView() {
  const isStudent = state.currentUser && state.currentUser.role === "student";
  const myGroup = isStudent ? (state.currentUser.group || "G39") : null;

  if (isStudent && myGroup) {
    const groupMembers = ALL_STUDENTS_DATASET.filter(s => s.group === myGroup);
    return `
      <div class="page-head">
        <div>
          <h2>Group ${myGroup} Team Directory</h2>
          <p>Project: ${esc(OFFICIAL_PROJECT.title)}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px;">
        ${groupMembers.map(m => `
          <div class="card" style="display:flex; align-items:center; gap:16px;">
            <div class="avatar" style="width:52px; height:52px; font-size:18px;">${initials(m.name)}</div>
            <div>
              <h4 style="font-size:15px; font-weight:800;">${esc(m.name)}</h4>
              <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">PRN: <b>${m.prn}</b></p>
              <span class="badge ${m.role === 'Team Leader' ? 'purple' : 'gray'}" style="margin-top:8px;">${m.role}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Admin / Mentor / Panel view: All Project Groups Grouped
  const distinctGroups = [...new Set(ALL_STUDENTS_DATASET.map(s => s.group))];

  return `
    <div class="page-head">
      <div>
        <h2>All B.Tech Project Teams</h2>
        <p>Groups G1 to G8 and G39 to G45 with Team Leaders & Guides</p>
      </div>
      <input class="input" style="width:260px;" placeholder="Search group or student..." oninput="handleTeamFilter(this.value)">
    </div>

    <div style="display:flex; flex-direction:column; gap:20px;" id="teamsContainer">
      ${distinctGroups.map(grp => {
        const grpMembers = ALL_STUDENTS_DATASET.filter(s => s.group === grp);
        const leader = grpMembers.find(s => s.role === "Team Leader") || grpMembers[0];
        const guideName = grpMembers[0].guide;

        return `
          <div class="card team-group-card">
            <div class="card-head">
              <div>
                <span class="badge blue">Group ${grp}</span>
                <h3 style="display:inline; margin-left:10px;">Guide: ${esc(guideName)}</h3>
              </div>
              <span class="badge purple">Leader: ${esc(leader.name)}</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sr. No</th>
                    <th>Member Name</th>
                    <th>PRN</th>
                    <th>Project Role</th>
                  </tr>
                </thead>
                <tbody>
                  ${grpMembers.map(m => `
                    <tr>
                      <td>${m.srNo}</td>
                      <td><b>${esc(m.name)}</b></td>
                      <td>${m.prn}</td>
                      <td><span class="badge ${m.role==='Team Leader'?'purple':'gray'}">${m.role}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function handleTeamFilter(val) {
  const q = val.toLowerCase();
  document.querySelectorAll(".team-group-card").forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

function renderTasksView() {
  return `
    <div class="page-head">
      <div>
        <h2>Tasks & Sprints Management</h2>
        <p>Task tracking for academic milestone delivery</p>
      </div>
      <button class="btn btn-primary" onclick="openCreateTaskModal()">+ Add New Task</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task Title & Scope</th>
              <th>Assigned Date</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${(state.tasks || []).map(t => `
              <tr>
                <td>
                  <b>${esc(t.title)}</b>
                  <p style="font-size:12px; color:var(--text-muted);">${esc(t.desc)}</p>
                </td>
                <td>${t.assignedDate}</td>
                <td>${t.dueDate}</td>
                <td><span class="badge ${t.priority==='High'?'orange':'blue'}">${t.priority}</span></td>
                <td>
                  <span class="badge ${t.status==='Completed'?'green':'gray'}">${t.status}</span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="toggleTaskStatus(${t.id})">
                      ${t.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                    </button>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="deleteTask(${t.id})">✕</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openCreateTaskModal() {
  document.getElementById("modal-container").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <div class="modal-head">
          <h3 style="font-weight:800;">Create Academic Task</h3>
          <button class="btn btn-outline" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleCreateTask(event)">
          <div class="form-group">
            <label class="form-label">Task Title</label>
            <input id="taskTitle" class="input" placeholder="e.g. Review-II Presentation Preparation" required>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="taskDesc" class="textarea" placeholder="Detailed requirements and deliverables..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input id="taskDueDate" type="date" class="input" value="2026-10-21" required>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="taskPriority" class="select">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Create Task</button>
        </form>
      </div>
    </div>
  `;
}

function handleCreateTask(e) {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const dueDate = document.getElementById("taskDueDate").value;
  const priority = document.getElementById("taskPriority").value;

  if (!state.tasks) state.tasks = [];
  state.tasks.unshift({
    id: Date.now(),
    group: "G39",
    title,
    desc,
    assignedDate: "13/09/2026",
    dueDate: dueDate.split('-').reverse().join('/'),
    priority,
    status: "In Progress"
  });

  saveState();
  closeModal();
  renderApp();
  toast("Task created successfully!");
}

function toggleTaskStatus(id) {
  state.tasks = (state.tasks || []).map(t => {
    if (t.id === id) {
      const next = t.status === "Completed" ? "In Progress" : "Completed";
      return { ...t, status: next };
    }
    return t;
  });
  saveState();
  renderApp();
  toast("Task status updated.");
}

function deleteTask(id) {
  state.tasks = (state.tasks || []).filter(t => t.id !== id);
  saveState();
  renderApp();
  toast("Task removed.", "err");
}

/* =========================================================
   2. MENTOR MODULE
   ========================================================= */

function renderMentorDashboard() {
  const myMentorName = state.currentUser ? state.currentUser.name : "";
  const myStudents = ALL_STUDENTS_DATASET.filter(s => s.guide === myMentorName);
  const myGroups = [...new Set(myStudents.map(s => s.group))];
  const pendingDocs = (state.documents || []).filter(d => d.status === "Under Review").length;

  return `
    <div class="page-head">
      <div>
        <h2>Mentor Dashboard</h2>
        <p>Logged in as: <b>${esc(myMentorName)}</b> • Department of CSE</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('feedback')">✎ Submit Student Feedback</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">▣</div>
        <div class="stat-info">
          <small>Assigned Groups</small>
          <strong>${myGroups.length} Groups (${myGroups.join(', ') || 'None'})</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <small>Assigned Students</small>
          <strong>${myStudents.length} Students</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">▤</div>
        <div class="stat-info">
          <small>Pending Document Reviews</small>
          <strong style="color:var(--warning);">${pendingDocs}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✓</div>
        <div class="stat-info">
          <small>Upcoming Review</small>
          <strong style="font-size:14px;">Review-II (21/10)</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Supervised Batches & Team Leaders</h3>
        <button class="btn btn-outline" onclick="navigate('students')">All Supervised Students →</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Team Leader</th>
              <th>PRN</th>
              <th>Total Members</th>
            </tr>
          </thead>
          <tbody>
            ${myGroups.map(grp => {
              const grpMembers = myStudents.filter(s => s.group === grp);
              const leader = grpMembers.find(s => s.role === "Team Leader") || grpMembers[0];
              return `
                <tr>
                  <td><b>${grp}</b></td>
                  <td><b>${esc(leader.name)}</b></td>
                  <td>${leader.prn}</td>
                  <td>${grpMembers.length} Members</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAssignedProjectsView() {
  const user = state.currentUser;
  const isMentor = user && user.role === "mentor";
  const guideName = isMentor ? user.name : "Prof. Dr. Ganesh Dangat";
  const assignedStudents = ALL_STUDENTS_DATASET.filter(s => s.guide === guideName);
  const distinctGroups = [...new Set(assignedStudents.map(s => s.group))];

  return `
    <div class="page-head">
      <div>
        <h2>Assigned Projects Directory</h2>
        <p>Projects allocated to ${esc(guideName)}</p>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:16px;">
      ${distinctGroups.map(grp => {
        const members = assignedStudents.filter(s => s.group === grp);
        const leader = members.find(s => s.role === "Team Leader") || members[0];
        return `
          <div class="card">
            <div class="card-head">
              <div>
                <span class="badge blue">Group ${grp}</span>
                <h3 style="display:inline; margin-left:8px;">Leader: ${esc(leader.name)}</h3>
              </div>
              <span class="badge green">In Progress</span>
            </div>
            <p style="font-size:13px; color:var(--text-muted); margin:10px 0;">
              <b>Guide:</b> ${esc(guideName)}<br>
              <b>Team Members:</b> ${members.map(m => `${esc(m.name)} (${m.role})`).join(" • ")}
            </p>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-primary" onclick="navigate('documentation')">Review Artifacts</button>
              ${user && user.role === 'panel' ? `<button class="btn btn-success" onclick="navigate('evaluation')">Enter Rubric Marks</button>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderStudentsView() {
  const user = state.currentUser;
  const isMentor = user && user.role === "mentor";
  const studentsList = isMentor ? ALL_STUDENTS_DATASET.filter(s => s.guide === user.name) : ALL_STUDENTS_DATASET;

  return `
    <div class="page-head">
      <div>
        <h2>Students Master Register</h2>
        <p>${studentsList.length} Students Listed with Roles and Guides</p>
      </div>
      <input class="input" style="width:260px;" placeholder="Search student, group, PRN..." oninput="handleStudentSearch(this.value)">
    </div>

    <div class="card">
      <div class="table-wrap">
        <table id="studentsTable">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Student Name</th>
              <th>PRN</th>
              <th>Group</th>
              <th>Role</th>
              <th>Guide</th>
            </tr>
          </thead>
          <tbody>
            ${studentsList.map(s => `
              <tr class="student-row">
                <td>${s.srNo}</td>
                <td><b>${esc(s.name)}</b></td>
                <td>${s.prn}</td>
                <td><span class="badge blue">${s.group}</span></td>
                <td><span class="badge ${s.role==='Team Leader'?'purple':'gray'}">${s.role}</span></td>
                <td>${esc(s.guide)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleStudentSearch(val) {
  const q = val.toLowerCase();
  document.querySelectorAll(".student-row").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

function renderFeedbackView() {
  const isMentor = state.currentUser && state.currentUser.role === "mentor";
  return `
    <div class="page-head">
      <div>
        <h2>Mentor Advisory & Feedback</h2>
        <p>Continuous progress appraisal and technical recommendations</p>
      </div>
    </div>

    ${isMentor ? `
      <div class="card">
        <h3 style="margin-bottom:12px;">Submit Feedback for Supervised Groups</h3>
        <form onsubmit="handleSendFeedback(event)">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="fbCategory" class="select">
              <option value="Technical">Technical Implementation</option>
              <option value="Documentation">Documentation & Report</option>
              <option value="Progress">Milestone Progress</option>
              <option value="General">General Remarks</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Feedback Notes</label>
            <textarea id="fbText" class="textarea" placeholder="Enter structured suggestions or required modifications..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Dispatch Feedback</button>
        </form>
      </div>
    ` : ''}

    <div class="card">
      <h3 style="margin-bottom:14px;">Historical Advisory Log</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${(state.feedback || []).map(f => `
          <div style="padding:14px; border:1px solid var(--border); border-radius:10px; background:var(--bg);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge purple">${f.category}</span>
              <small style="color:var(--text-muted);">${f.date} • By ${esc(f.mentor)}</small>
            </div>
            <p style="font-size:13px; margin-top:8px;">${esc(f.text)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleSendFeedback(e) {
  e.preventDefault();
  const category = document.getElementById("fbCategory").value;
  const text = document.getElementById("fbText").value.trim();
  if (!text) return;

  if (!state.feedback) state.feedback = [];
  state.feedback.unshift({
    id: Date.now(),
    group: "G39",
    mentor: state.currentUser.name,
    date: "13/09/2026",
    category,
    text
  });

  if (!state.notifications) state.notifications = [];
  state.notifications.unshift({
    id: Date.now(),
    targetRole: "student",
    title: "New Mentor Feedback",
    text: `${state.currentUser.name} has posted ${category} feedback for Group G39.`,
    date: "13/09/2026"
  });

  saveState();
  renderApp();
  toast("Feedback recorded and shared with students!");
}

/* =========================================================
   3. ADMIN MODULE
   ========================================================= */

function renderAdminDashboard() {
  const distinctGroups = [...new Set(ALL_STUDENTS_DATASET.map(s => s.group))];

  return `
    <div class="page-head">
      <div>
        <h2>Administrator Command Console</h2>
        <p>Department of Computer Science & Engineering • AY 2026-27</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('assignment')">⇄ Manage Mentor Allocations</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">▣</div>
        <div class="stat-info">
          <small>Total Groups</small>
          <strong>${distinctGroups.length} Batches</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <small>Total Students</small>
          <strong>${ALL_STUDENTS_DATASET.length} Registered</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">★</div>
        <div class="stat-info">
          <small>Available Mentors</small>
          <strong>${MENTORS_LIST.length} Faculty</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">◈</div>
        <div class="stat-info">
          <small>Group G39 Progress</small>
          <strong style="color:var(--success);">68% Stage-I</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Master Groups & Guide Allocations</h3>
        <button class="btn btn-outline" onclick="navigate('teams')">View Detailed Teams →</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Team Leader</th>
              <th>Guide Name</th>
              <th>Members Count</th>
            </tr>
          </thead>
          <tbody>
            ${distinctGroups.map(grp => {
              const grpMembers = ALL_STUDENTS_DATASET.filter(s => s.group === grp);
              const leader = grpMembers.find(s => s.role === "Team Leader") || grpMembers[0];
              const guide = state.mentorAssignments && state.mentorAssignments[grp] ? state.mentorAssignments[grp] : grpMembers[0].guide;
              return `
                <tr>
                  <td><b>${grp}</b></td>
                  <td><b>${esc(leader.name)}</b> (${leader.prn})</td>
                  <td>${esc(guide)}</td>
                  <td>${grpMembers.length} Students</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMentorAssignmentView() {
  const distinctGroups = [...new Set(ALL_STUDENTS_DATASET.map(s => s.group))];

  return `
    <div class="page-head">
      <div>
        <h2>Mentor Allocation Matrix</h2>
        <p>Review student groups and commit official faculty assignments</p>
      </div>
    </div>

    <div class="card">
      <div class="notice">
        <b>Administrative Allocation Rule:</b><br>
        Student preferences are only recommendations. Only Administrator possesses authorization to finalize guide allocation.
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Team Leader</th>
              <th>Current Guide</th>
              <th>Reassign Guide</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${distinctGroups.map(grp => {
              const grpMembers = ALL_STUDENTS_DATASET.filter(s => s.group === grp);
              const leader = grpMembers.find(s => s.role === "Team Leader") || grpMembers[0];
              const currentGuide = state.mentorAssignments && state.mentorAssignments[grp] ? state.mentorAssignments[grp] : grpMembers[0].guide;

              return `
                <tr>
                  <td><b>${grp}</b></td>
                  <td><b>${esc(leader.name)}</b></td>
                  <td><span class="badge blue">${esc(currentGuide)}</span></td>
                  <td>
                    <select id="assignGuide_${grp}" class="select" style="min-width:200px;">
                      ${MENTORS_LIST.map(m => `
                        <option value="${esc(m)}" ${currentGuide === m ? 'selected' : ''}>${esc(m)}</option>
                      `).join('')}
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-primary" onclick="handleCommitGroupMentor('${grp}')">Assign</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleCommitGroupMentor(group) {
  const sel = document.getElementById("assignGuide_" + group);
  const val = sel.value;
  if (!val) {
    toast("Please select a faculty mentor", "err");
    return;
  }

  if (!state.mentorAssignments) state.mentorAssignments = {};
  state.mentorAssignments[group] = val;

  // Also update dataset in-memory
  ALL_STUDENTS_DATASET.forEach(s => {
    if (s.group === group) s.guide = val;
  });

  saveState();
  renderApp();
  toast(`Mentor ${val} allocated to Group ${group}!`);
}

function renderMentorsDirectoryView() {
  return `
    <div class="page-head">
      <div>
        <h2>Faculty Mentors Directory</h2>
        <p>${MENTORS_LIST.length} Faculty Members • Department of Computer Science and Engineering</p>
      </div>
      <input class="input" style="width:260px;" placeholder="Search faculty name..." oninput="handleMentorSearch(this.value)">
    </div>

    <div class="card">
      <div class="table-wrap">
        <table id="mentorsTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Faculty Name</th>
              <th>Department</th>
              <th>Assigned Batches</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${MENTORS_LIST.map((m, idx) => {
              const batches = ALL_STUDENTS_DATASET.filter(s => (state.mentorAssignments && state.mentorAssignments[s.group] === m) || s.guide === m);
              const distinct = [...new Set(batches.map(b => b.group))];
              return `
                <tr class="mentor-row">
                  <td>${idx + 1}</td>
                  <td><b>${esc(m)}</b></td>
                  <td>Computer Science and Engineering</td>
                  <td>${distinct.length > 0 ? `<span class="badge blue">${distinct.join(', ')}</span>` : '<span class="badge gray">0 Batches</span>'}</td>
                  <td><span class="badge green">Available</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleMentorSearch(val) {
  const q = val.toLowerCase();
  document.querySelectorAll(".mentor-row").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

function renderProjectMonitoringView() {
  const p = OFFICIAL_PROJECT;
  const marks = state.marks && state.marks["G39"] ? state.marks["G39"] : { grandTotal: 0 };

  return `
    <div class="page-head">
      <div>
        <h2>Comprehensive Project Monitoring</h2>
        <p>Institutional stage tracking and milestone compliance</p>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3>${esc(p.title)}</h3>
        <span class="badge green">Milestone Met</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; font-size:13px; margin-bottom:18px;">
        <div><b>Group:</b> G39</div>
        <div><b>Guide:</b> ${esc(state.mentorAssignments && state.mentorAssignments["G39"] ? state.mentorAssignments["G39"] : 'Prof. Dr. Ganesh Dangat')}</div>
        <div><b>Tasks Completed:</b> ${(state.tasks || []).filter(t=>t.status==='Completed').length} / ${(state.tasks || []).length}</div>
        <div><b>Documents Approved:</b> ${(state.documents || []).filter(d=>d.status==='Approved').length} / ${(state.documents || []).length}</div>
        <div><b>Total Score:</b> ${marks.grandTotal} / 100</div>
      </div>

      <div class="progress-container" style="height:10px;">
        <div class="progress-fill" style="width:${p.progress}%;"></div>
      </div>
      <small style="display:block; margin-top:6px; color:var(--text-muted); font-size:11px;">Calculated Institutional Progress: ${p.progress}%</small>
    </div>
  `;
}

/* =========================================================
   4. PANEL MEMBER MODULE
   ========================================================= */

function renderPanelDashboard() {
  const marks = state.marks && state.marks["G39"] ? state.marks["G39"] : { grandTotal: 0, submitted: false };
  return `
    <div class="page-head">
      <div>
        <h2>Panel Examiner Dashboard</h2>
        <p>Evaluation Committee • Dr. Babasaheb Ambedkar Technological University</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('evaluation')">✓ Enter Evaluation Marks</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">▣</div>
        <div class="stat-info">
          <small>Assigned Batches</small>
          <strong>Group G39</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✓</div>
        <div class="stat-info">
          <small>Completed Evaluations</small>
          <strong style="color:var(--success);">${marks.submitted ? '1 Batch' : '0'}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱</div>
        <div class="stat-info">
          <small>Pending Reviews</small>
          <strong style="color:var(--warning);">${marks.submitted ? '0' : '1'}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">▥</div>
        <div class="stat-info">
          <small>CA Max / ESE Max</small>
          <strong>60 / 40</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Group G39 Evaluation Status</h3>
        <span class="badge ${marks.submitted ? 'green' : 'orange'}">${marks.submitted ? 'Submitted' : 'Pending Evaluation'}</span>
      </div>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.7;">
        <b>Title:</b> ${esc(OFFICIAL_PROJECT.title)}<br>
        <b>Team Leader:</b> Sangam Shivprasad Amlapure (PRN: 23063181242010)<br>
        <b>Team Members:</b> Sumit Gaikwad, Karan Ghodke, Shruti Salunke<br>
        <b>Latest Evaluated Score:</b> <b>${marks.grandTotal} / 100</b> (CA: ${marks.caTotal}/60, ESE: ${marks.ese}/40)
      </p>
      <div style="margin-top:14px;">
        <button class="btn btn-primary" onclick="navigate('evaluation')">Launch 100-Mark Rubric Evaluation Sheet →</button>
      </div>
    </div>
  `;
}

function renderPanelEvaluationView() {
  const currentMarks = state.marks && state.marks["G39"] ? state.marks["G39"] : {
    synopsis: 5, review1: 9, review2: 13, paper: 8, attendance: 4,
    competition: 3, diary: 2, stage1: 9, ese: 36, caTotal: 53, grandTotal: 89
  };

  return `
    <div class="page-head">
      <div>
        <h2>Autonomous Stage-I Project Evaluation Form</h2>
        <p>Continuous Assessment (CA = 60) + End Semester Exam (ESE = 40) = 100 Marks</p>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <span class="badge blue">Group G39</span>
          <h3 style="margin-top:4px;">${esc(OFFICIAL_PROJECT.title)}</h3>
        </div>
      </div>

      <form id="evaluationForm" onsubmit="handleSaveEvaluationMarks(event)">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evaluation Parameter</th>
                <th>Maximum</th>
                <th>Awarded Marks</th>
              </tr>
            </thead>
            <tbody>
              ${MARK_RUBRICS.map(r => `
                <tr>
                  <td><b>${r.title}</b></td>
                  <td>${r.max}</td>
                  <td>
                    <input type="number" min="0" max="${r.max}" id="eval_${r.id}" value="${currentMarks[r.id] || 0}" class="input rubric-score-input" style="width:100px; text-align:center; font-weight:800;" onchange="calculateLiveMarks()">
                  </td>
                </tr>
              `).join('')}
              <tr style="background:var(--primary-subtle);">
                <td><b>Continuous Assessment (CA) Total</b></td>
                <td><b>60</b></td>
                <td><b id="liveCaTotal" style="color:var(--primary); font-size:15px;">${currentMarks.caTotal}</b></td>
              </tr>
              <tr>
                <td><b>Final Presentation & University Examination (ESE)</b></td>
                <td>40</td>
                <td>
                  <input type="number" min="0" max="40" id="eval_ese" value="${currentMarks.ese || 0}" class="input" style="width:100px; text-align:center; font-weight:800;" onchange="calculateLiveMarks()">
                </td>
              </tr>
              <tr style="background:var(--primary-subtle); font-size:16px;">
                <td><b>Grand Cumulative Total (CA + ESE)</b></td>
                <td><b>100</b></td>
                <td><b id="liveGrandTotal" style="color:var(--primary); font-size:18px;">${currentMarks.grandTotal}</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:var(--text-muted);">Entered marks will update student reports and marks sections in real-time.</span>
          <button type="submit" class="btn btn-primary">Publish Evaluation Marks</button>
        </div>
      </form>
    </div>
  `;
}

function calculateLiveMarks() {
  let ca = 0;
  MARK_RUBRICS.forEach(r => {
    const el = document.getElementById("eval_" + r.id);
    if (el) ca += Number(el.value) || 0;
  });

  const eseEl = document.getElementById("eval_ese");
  const ese = eseEl ? Number(eseEl.value) || 0 : 0;
  const grand = ca + ese;

  const caDisp = document.getElementById("liveCaTotal");
  const grandDisp = document.getElementById("liveGrandTotal");
  if (caDisp) caDisp.textContent = ca;
  if (grandDisp) grandDisp.textContent = grand;
}

function handleSaveEvaluationMarks(e) {
  e.preventDefault();
  let ca = 0;
  const result = {};

  for (const r of MARK_RUBRICS) {
    const val = Number(document.getElementById("eval_" + r.id).value);
    if (isNaN(val) || val < 0 || val > r.max) {
      toast(`Invalid score for ${r.title} (0 to ${r.max})`, "err");
      return;
    }
    result[r.id] = val;
    ca += val;
  }

  const eseVal = Number(document.getElementById("eval_ese").value);
  if (isNaN(eseVal) || eseVal < 0 || eseVal > 40) {
    toast("Invalid score for ESE Examination (0 to 40)", "err");
    return;
  }

  result.ese = eseVal;
  result.caTotal = ca;
  result.grandTotal = ca + eseVal;
  result.submitted = true;
  result.evaluatedBy = state.currentUser ? state.currentUser.name : "Panel Member";
  result.evaluationDate = "13/09/2026";

  if (!state.marks) state.marks = {};
  state.marks["G39"] = result;

  if (!state.notifications) state.notifications = [];
  state.notifications.unshift({
    id: Date.now(),
    targetRole: "student",
    title: "Stage-I Marks Published",
    text: `Panel member has published official marks. Total Score: ${result.grandTotal}/100.`,
    date: "13/09/2026"
  });

  saveState();
  renderApp();
  toast("Evaluation marks published and synchronized with student portal!");
}

/* =========================================================
   5. COMMON MODULES
   ========================================================= */

function renderNotificationsView() {
  const role = state.currentUser ? state.currentUser.role : "student";
  const filtered = (state.notifications || []).filter(n => n.targetRole === "all" || n.targetRole === role);

  return `
    <div class="page-head">
      <div>
        <h2>System Announcements & Notices</h2>
        <p>Institutional audit trail and milestone broadcasts</p>
      </div>
      ${role === 'admin' ? `<button class="btn btn-primary" onclick="openAnnouncementModal()">+ Broadcast Announcement</button>` : ''}
    </div>

    <div class="card">
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${filtered.map(n => `
          <div style="padding:16px; border:1px solid var(--border); border-radius:12px; background:var(--bg);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b style="font-size:14px;">${esc(n.title)}</b>
              <small style="color:var(--text-muted);">${n.date}</small>
            </div>
            <p style="font-size:13px; color:var(--text-muted); margin-top:6px;">${esc(n.text)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openAnnouncementModal() {
  document.getElementById("modal-container").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-box">
        <div class="modal-head">
          <h3 style="font-weight:800;">Create Department Announcement</h3>
          <button class="btn btn-outline" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleSendAnnouncement(event)">
          <div class="form-group">
            <label class="form-label">Recipient Target</label>
            <select id="anTarget" class="select">
              <option value="all">All Roles (Students, Mentors, Panel)</option>
              <option value="student">Students Only</option>
              <option value="mentor">Mentors Only</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Subject</label>
            <input id="anTitle" class="input" placeholder="e.g. Stage-I Report Binding Guidelines" required>
          </div>
          <div class="form-group">
            <label class="form-label">Notice Content</label>
            <textarea id="anText" class="textarea" placeholder="Enter broadcast message..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Publish Announcement</button>
        </form>
      </div>
    </div>
  `;
}

function handleSendAnnouncement(e) {
  e.preventDefault();
  const targetRole = document.getElementById("anTarget").value;
  const title = document.getElementById("anTitle").value.trim();
  const text = document.getElementById("anText").value.trim();

  if (!state.notifications) state.notifications = [];
  state.notifications.unshift({
    id: Date.now(),
    targetRole,
    title,
    text,
    date: "13/09/2026"
  });

  saveState();
  closeModal();
  renderApp();
  toast("Announcement broadcasted successfully!");
}

function renderProfileView() {
  const u = state.currentUser || DEMO_ACCOUNTS.student;
  const currentAssigned = state.mentorAssignments && state.mentorAssignments[u.group] ? state.mentorAssignments[u.group] : 'Prof. Dr. Ganesh Dangat';

  return `
    <div class="page-head">
      <div>
        <h2>User Account Profile</h2>
        <p>Institutional identity details on AcadFlow</p>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; align-items:center; gap:20px; padding-bottom:20px; border-bottom:1px solid var(--border); margin-bottom:20px;">
        <div class="avatar" style="width:72px; height:72px; font-size:24px; border-radius:18px;">${initials(u.name)}</div>
        <div>
          <h3 style="font-size:20px;">${esc(u.name)}</h3>
          <p style="color:var(--text-muted); font-size:13px;">${u.role.toUpperCase()} • Karmaveer Bhaurao Patil College of Engineering, Satara</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; font-size:13px;">
        <div><b>Username / ID:</b><br><span style="color:var(--text-muted);">${esc(u.username)}</span></div>
        <div><b>PRN / Faculty Code:</b><br><span style="color:var(--text-muted);">${esc(u.prn || '—')}</span></div>
        <div><b>Registered Email:</b><br><span style="color:var(--text-muted);">${esc(u.email || '—')}</span></div>
        <div><b>System Role:</b><br><span class="badge blue">${u.role.toUpperCase()}</span></div>
        ${u.group ? `<div><b>Assigned Batch:</b><br><span style="color:var(--text-muted);">Group ${u.group}</span></div>` : ''}
        ${u.group ? `<div><b>Project Guide:</b><br><span style="color:var(--text-muted);">${esc(currentAssigned)}</span></div>` : ''}
      </div>
    </div>
  `;
}

function renderSettingsView() {
  const isAdmin = state.currentUser && state.currentUser.role === "admin";
  return `
    <div class="page-head">
      <div>
        <h2>System Settings & Preferences</h2>
        <p>Manage application preferences and data lifecycle</p>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:14px;">Display & Interface</h3>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
        <div>
          <b>Color Theme</b>
          <p style="font-size:12px; color:var(--text-muted);">Toggle dark or light mode theme</p>
        </div>
        <button class="btn btn-outline" onclick="toggleTheme()">
          ${state.theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
        </button>
      </div>
    </div>

    ${isAdmin ? `
      <div class="card">
        <h3 style="margin-bottom:14px; color:var(--danger);">Danger Zone & Data Maintenance</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
          Restore initial demo state with complete official project groups dataset.
        </p>
        <button class="btn btn-danger" onclick="if(confirm('Are you sure you want to reset all data to default demo state?')) resetDemoData()">
          Reset Demo Data
        </button>
      </div>
    ` : ''}
  `;
}

function closeModal() {
  const modal = document.getElementById("modal-container");
  if (modal) modal.innerHTML = "";
}

/* =========================================================
   Application Bootstrap
   ========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  if (state.currentUser) {
    renderApp();
  } else {
    renderLogin();
  }
});