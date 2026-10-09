
// Toast notification helper
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast-notification");
  const toastMsg = document.getElementById("toast-message");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove("translate-y-24", "opacity-0", "pointer-events-none");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-24", "opacity-0", "pointer-events-none");
  }, duration);
}

function copyToClipboard(text, msg = "Copied to clipboard!") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg);
  }).catch(() => {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    showToast(msg);
  });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ==============================================================================
// 1. PROJECT CODE SNIPPETS FOR CODE VIEWER
// ==============================================================================
const projectsCode = {
  "checklist-app": {
    title: "ChecklistApp: Unidirectional Task Suite",
    code: `// Pure Reducer Function Governing ChecklistApp State Transitions
fun checklistReducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
    return when (action) {
        is ChecklistAction.AddItem -> {
            val trimmedTitle = action.title.trim()
            if (trimmedTitle.isEmpty()) {
                state.copy(errorMessage = "Task title cannot be empty")
            } else {
                val newItem = ChecklistItem(
                    title = trimmedTitle,
                    description = action.description.trim(),
                    category = action.category,
                    priority = action.priority,
                    dueDate = action.dueDate.trim(),
                    isCompleted = false,
                    createdAt = System.currentTimeMillis()
                )
                state.copy(items = listOf(newItem) + state.items, isAddDialogOpen = false)
            }
        }
        is ChecklistAction.ToggleItem -> {
            val updated = state.items.map { item ->
                if (item.id == action.id) {
                    val toggled = !item.isCompleted
                    item.copy(isCompleted = toggled, completedAt = if (toggled) System.currentTimeMillis() else null)
                } else item
            }
            state.copy(items = updated)
        }
        is ChecklistAction.DeleteItem -> {
            val target = state.items.find { it.id == action.id }
            state.copy(items = state.items.filter { it.id != action.id }, recentlyDeletedItem = target)
        }
        ChecklistAction.UndoDelete -> {
            state.recentlyDeletedItem?.let { restored ->
                state.copy(items = listOf(restored) + state.items, recentlyDeletedItem = null)
            } ?: state
        }
    }
}`
  },

  "calculator-app": {
    title: "CalculatorApp: Modern OLED Material 3",
    code: `// Hoisted State & Centralized Action Dispatcher (Jetpack Compose)
@Composable
fun CalculatorScreen(modifier: Modifier = Modifier) {
    var state by remember { mutableStateOf(CalculatorState()) }
    val onAction: (CalculatorAction) -> Unit = { action ->
        state = onCalculatorAction(action, state)
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF121316) // OLED surface
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            val expression = "\${state.number1} \${state.operation?.symbol ?: \"\"} \${state.number2}".trim()
            Text(text = if (expression.isEmpty()) "0" else expression, fontSize = 36.sp, color = Color(0xFFA0A5AD))
            if (state.result.isNotBlank()) {
                Text(text = "= \${state.result}", fontSize = 44.sp, color = Color(0xFF4CAF50), fontWeight = FontWeight.Bold)
            }
            // 5-Row Tactile Keypad Grid...
        }
    }
}`
  },

  "kotlin-state-blog": {
    title: "Kotlin CLI Blog Engine & State Reducer (BlogEngine.kt)",
    code: `// =============================================================
// KOTLIN CLI COMMUNITY BLOG ENGINE (BlogEngine.kt)
// =============================================================
package blog

data class Comment(val id: Int, val author: String, val content: String)

data class Post(
    val id: Int,
    val author: String,
    val title: String,
    val content: String,
    val likes: Int = 0,
    val dislikes: Int = 0,
    val comments: List<Comment> = emptyList()
) {
    // Computed property: recalculates dynamically on-the-fly without stale cache
    val engagementScore: Int
        get() = (likes - dislikes) + (comments.size * 2)
}

data class BlogState(
    val posts: List<Post> = emptyList(),
    val nextPostId: Int = 1,
    val nextCommentId: Int = 1,
    val currentUser: String = "User",
    val statusMessage: String = "System ready."
)

// PURE REDUCER OBJECT
object BlogEngine {
    fun createPost(state: BlogState, title: String, content: String): BlogState {
        val newPost = Post(state.nextPostId, state.currentUser, title.trim(), content.trim())
        return state.copy(
            posts = state.posts + newPost,
            nextPostId = state.nextPostId + 1,
            statusMessage = "Successfully published Post #\${newPost.id}!"
        )
    }

    fun likePost(state: BlogState, postId: Int): BlogState {
        var matched = false
        val updated = state.posts.map { p ->
            if (p.id == postId) {
                matched = true
                p.copy(likes = p.likes + 1)
            } else p
        }
        return if (matched) state.copy(posts = updated, statusMessage = "Liked Post #$postId (+1)")
        else state.copy(statusMessage = "Error: Post #$postId not found")
    }
}`
  },

  "campuspulse-app": {
    title: "CampusPulse: Student Academic Planner",
    code: `// Dynamic Semester GPA Calculation & Room Flow
class AcademicViewModel(private val repository: CourseRepository) : ViewModel() {
    val courses: StateFlow<List<Course>> = repository.getAllCourses()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val cumulativeGpa: StateFlow<Double> = courses.map { list ->
        if (list.isEmpty()) 0.0
        else {
            val totalPoints = list.sumOf { it.credits * it.gradePoints }
            val totalCredits = list.sumOf { it.credits }
            if (totalCredits == 0) 0.0 else totalPoints / totalCredits.toDouble()
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
}`
  }
};

function openCodeModal(projectId) {
  const p = projectsCode[projectId];
  if (!p) return;

  document.getElementById("code-modal-title").textContent = p.title;
  document.getElementById("code-modal-body").textContent = p.code;

  const modal = document.getElementById("code-viewer-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeCodeModal() {
  const modal = document.getElementById("code-viewer-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ==============================================================================
// 2. LIVE SIMULATOR MODAL (Phone Bezel & Terminal)
// ==============================================================================
let activeSimulatorType = "calculator";

function launchInteractiveSimulator(type = "calculator") {
  activeSimulatorType = type;
  const modal = document.getElementById("simulator-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  ["calculator", "checklist", "terminal", "campuspulse"].forEach(t => {
    const btn = document.getElementById(`sim-nav-${t}`);
    if (btn) {
      if (t === type) {
        btn.classList.add("bg-black", "text-white");
        btn.classList.remove("bg-slate-100", "text-slate-600");
      } else {
        btn.classList.remove("bg-black", "text-white");
        btn.classList.add("bg-slate-100", "text-slate-600");
      }
    }
  });

  const phoneContainer = document.getElementById("phone-viewport-container");
  const terminalContainer = document.getElementById("terminal-viewport-container");

  if (type === "terminal") {
    phoneContainer.classList.add("hidden");
    terminalContainer.classList.remove("hidden");
    initTerminalSimulator();
  } else {
    phoneContainer.classList.remove("hidden");
    terminalContainer.classList.add("hidden");

    document.querySelectorAll(".phone-screen-content").forEach(el => el.classList.add("hidden"));

    if (type === "calculator") {
      document.getElementById("calc-screen-content").classList.remove("hidden");
      document.getElementById("simulator-app-title").textContent = "CalculatorApp (OLED Jetpack Compose)";
    } else if (type === "checklist") {
      document.getElementById("checklist-screen-content").classList.remove("hidden");
      document.getElementById("simulator-app-title").textContent = "ChecklistApp (UDF Reducer)";
      renderChecklistAppUI();
    } else if (type === "campuspulse") {
      document.getElementById("campuspulse-screen-content").classList.remove("hidden");
      document.getElementById("simulator-app-title").textContent = "CampusPulse (Academic GPA Hub)";
      renderCampusPulseUI();
    }
  }
}

function closeSimulatorModal() {
  const modal = document.getElementById("simulator-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ==============================================================================
// 3. APP SIMULATOR 1: CALCULATOR
// ==============================================================================
let calcState = { number1: "", number2: "", operation: null, result: "" };

function onCalcNumber(num) {
  if (calcState.operation === null) {
    if (calcState.number1.length >= 10) return;
    calcState.number1 += num;
  } else {
    if (calcState.number2.length >= 10) return;
    calcState.number2 += num;
  }
  updateCalcDisplay();
}

function onCalcDecimal() {
  if (calcState.operation === null) {
    if (!calcState.number1.includes(".")) {
      calcState.number1 = (calcState.number1 === "" ? "0" : calcState.number1) + ".";
    }
  } else {
    if (!calcState.number2.includes(".")) {
      calcState.number2 = (calcState.number2 === "" ? "0" : calcState.number2) + ".";
    }
  }
  updateCalcDisplay();
}

function onCalcOperation(op) {
  if (calcState.number1.trim() !== "") {
    if (calcState.number2.trim() !== "") {
      performCalcEvaluation();
    }
    calcState.operation = op;
    updateCalcDisplay();
  }
}

function onCalcClear() {
  calcState = { number1: "", number2: "", operation: null, result: "" };
  updateCalcDisplay();
}

function onCalcDelete() {
  if (calcState.number2.length > 0) {
    calcState.number2 = calcState.number2.slice(0, -1);
  } else if (calcState.operation !== null) {
    calcState.operation = null;
  } else if (calcState.number1.length > 0) {
    calcState.number1 = calcState.number1.slice(0, -1);
  }
  updateCalcDisplay();
}

function onCalcPercentage() {
  const target = calcState.operation === null ? calcState.number1 : calcState.number2;
  const num = parseFloat(target);
  if (!isNaN(num)) {
    const percentVal = (num / 100).toString();
    if (calcState.operation === null) calcState.number1 = percentVal;
    else calcState.number2 = percentVal;
    updateCalcDisplay();
  }
}

function performCalcEvaluation() {
  const n1 = parseFloat(calcState.number1);
  const n2 = parseFloat(calcState.number2);

  if (isNaN(n1) || isNaN(n2) || !calcState.operation) return;

  let computed = 0;
  if (calcState.operation === "+") computed = n1 + n2;
  else if (calcState.operation === "-") computed = n1 - n2;
  else if (calcState.operation === "×") computed = n1 * n2;
  else if (calcState.operation === "÷") {
    if (n2 === 0) {
      calcState.result = "Error: Div by 0";
      updateCalcDisplay();
      return;
    }
    computed = n1 / n2;
  }

  let formatted = (computed % 1 === 0) ? Math.round(computed).toString() : parseFloat(computed.toFixed(4)).toString();
  calcState.result = formatted;
  calcState.number1 = formatted;
  calcState.number2 = "";
  calcState.operation = null;
  updateCalcDisplay();
}

function updateCalcDisplay() {
  const exprEl = document.getElementById("calc-expression-display");
  const resEl = document.getElementById("calc-result-display");
  if (!exprEl || !resEl) return;

  const expression = `${calcState.number1} ${calcState.operation || ""} ${calcState.number2}`.trim();
  exprEl.textContent = expression === "" ? "0" : expression;

  if (calcState.result) {
    resEl.textContent = `= ${calcState.result}`;
    resEl.classList.remove("hidden");
  } else {
    resEl.classList.add("hidden");
  }
}

// ==============================================================================
// 4. APP SIMULATOR 2: CHECKLIST APP
// ==============================================================================
let checklistItems = [
  {
    id: "sample-1",
    title: "Review Kotlin Compose architecture",
    description: "Verify unidirectional state flow and pure reducer pattern",
    category: "WORK",
    priority: "HIGH",
    dueDate: "Today, 5:00 PM",
    isCompleted: true
  },
  {
    id: "sample-2",
    title: "Prepare quarterly project budget",
    description: "Include cloud infrastructure and tool licenses",
    category: "FINANCE",
    priority: "URGENT",
    dueDate: "Tomorrow",
    isCompleted: false
  },
  {
    id: "sample-3",
    title: "Pick up organic groceries",
    description: "Fresh vegetables, oat milk, whole grain bread",
    category: "SHOPPING",
    priority: "MEDIUM",
    dueDate: "Wednesday",
    isCompleted: false
  },
  {
    id: "sample-4",
    title: "Schedule annual dental checkup",
    description: "Call clinic reception for afternoon appointment",
    category: "HEALTH",
    priority: "LOW",
    dueDate: "Next Week",
    isCompleted: false
  },
  {
    id: "sample-5",
    title: "Study Jetpack Compose animation APIs",
    description: "Practice AnimatedVisibility and Crossfade transitions",
    category: "STUDY",
    priority: "MEDIUM",
    dueDate: "Friday",
    isCompleted: true
  }
];

let checklistFilter = "ALL";
let checklistCategory = null;
let checklistSearchQuery = "";
let recentlyDeletedItem = null;

function renderChecklistAppUI() {
  const listEl = document.getElementById("checklist-tasks-container");
  const statsCountEl = document.getElementById("checklist-stats-count");
  const statsPercentEl = document.getElementById("checklist-stats-percent");
  const progressBarEl = document.getElementById("checklist-progress-bar");
  if (!listEl) return;

  const total = checklistItems.length;
  const completed = checklistItems.filter(i => i.isCompleted).length;
  const percent = total === 0 ? 0 : Math.round((completed * 100) / total);

  if (statsCountEl) statsCountEl.textContent = `${completed}/${total} Done`;
  if (statsPercentEl) statsPercentEl.textContent = `${percent}%`;
  if (progressBarEl) progressBarEl.style.width = `${percent}%`;

  const visible = checklistItems.filter(item => {
    const matchStatus = checklistFilter === "ALL" ? true : (checklistFilter === "ACTIVE" ? !item.isCompleted : item.isCompleted);
    const matchCategory = checklistCategory === null || item.category === checklistCategory;
    const matchSearch = checklistSearchQuery.trim() === "" ||
      item.title.toLowerCase().includes(checklistSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(checklistSearchQuery.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  if (visible.length === 0) {
    listEl.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs">No tasks match filter</div>`;
    return;
  }

  const priorityColors = {
    URGENT: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    HIGH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    MEDIUM: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    LOW: "bg-slate-500/20 text-slate-400 border-slate-500/30"
  };

  listEl.innerHTML = visible.map(item => `
    <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5 ${item.isCompleted ? 'opacity-60' : ''}">
      <button onclick="toggleChecklistItem('${item.id}')" class="mt-0.5 w-5 h-5 rounded border ${item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 bg-slate-900'} flex items-center justify-center shrink-0">
        ${item.isCompleted ? '<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
      </button>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1 mb-1">
          <h4 class="text-xs font-semibold text-white truncate ${item.isCompleted ? 'line-through text-slate-400' : ''}">
            ${item.title}
          </h4>
          <span class="text-[9px] px-1.5 py-0.5 rounded border font-mono ${priorityColors[item.priority] || priorityColors.LOW}">
            ${item.priority}
          </span>
        </div>
        <p class="text-[10px] text-slate-400 truncate mb-1.5">${item.description}</p>
        <div class="flex items-center justify-between text-[10px] text-slate-400">
          <span>${item.category} • ${item.dueDate}</span>
          <button onclick="deleteChecklistItem('${item.id}')" class="text-rose-400 hover:text-rose-300">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function toggleChecklistItem(id) {
  checklistItems = checklistItems.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item);
  renderChecklistAppUI();
}

function deleteChecklistItem(id) {
  const target = checklistItems.find(i => i.id === id);
  if (target) {
    recentlyDeletedItem = target;
    checklistItems = checklistItems.filter(i => i.id !== id);
    renderChecklistAppUI();
    showToast(`Deleted "${target.title}"`);
  }
}

function setChecklistStatusFilter(status) {
  checklistFilter = status;
  ["ALL", "ACTIVE", "COMPLETED"].forEach(s => {
    const btn = document.getElementById(`filter-status-${s.toLowerCase()}`);
    if (btn) {
      if (s === status) {
        btn.classList.add("bg-sky-600", "text-white");
        btn.classList.remove("text-slate-400");
      } else {
        btn.classList.remove("bg-sky-600", "text-white");
        btn.classList.add("text-slate-400");
      }
    }
  });
  renderChecklistAppUI();
}

function setChecklistCategoryFilter(cat) {
  checklistCategory = checklistCategory === cat ? null : cat;
  ["WORK", "FINANCE", "SHOPPING", "HEALTH", "STUDY"].forEach(c => {
    const chip = document.getElementById(`cat-chip-${c.toLowerCase()}`);
    if (chip) {
      if (c === checklistCategory) chip.classList.add("ring-2", "ring-sky-400", "font-bold");
      else chip.classList.remove("ring-2", "ring-sky-400", "font-bold");
    }
  });
  renderChecklistAppUI();
}

function handleAddChecklistTask(e) {
  e.preventDefault();
  const title = document.getElementById("new-task-title").value.trim();
  const desc = document.getElementById("new-task-desc").value.trim();
  const cat = document.getElementById("new-task-category").value;
  const prio = document.getElementById("new-task-priority").value;
  const due = document.getElementById("new-task-due").value.trim() || "Soon";

  if (!title) return;

  checklistItems.unshift({
    id: "task-" + Date.now(),
    title,
    description: desc || "No description.",
    category: cat,
    priority: prio,
    dueDate: due,
    isCompleted: false
  });

  document.getElementById("new-task-title").value = "";
  document.getElementById("new-task-desc").value = "";
  document.getElementById("add-task-dialog").classList.add("hidden");
  renderChecklistAppUI();
  showToast("Task created!");
}

// ==============================================================================
// 5. APP SIMULATOR 3: KOTLIN CLI BLOG ENGINE
// ==============================================================================
let blogEngineState = {
  posts: [
    {
      id: 1,
      author: "TeacherAlice",
      title: "Welcome to Kotlin CS!",
      content: "State management is the foundation of clean, reliable apps.",
      likes: 5,
      dislikes: 0,
      comments: [{ id: 1, author: "DevBob", content: "Excited for this UDF architecture!" }]
    },
    {
      id: 2,
      author: "DevBob",
      title: "Why Immutability Rocks",
      content: "Immutable objects prevent sneaky bugs across concurrent tasks.",
      likes: 2,
      dislikes: 1,
      comments: []
    }
  ],
  nextPostId: 3,
  nextCommentId: 2,
  currentUser: "Student101",
  statusMessage: "System ready. Welcome to Kotlin CLI Blog!"
};

function getEngagementScore(p) {
  return (p.likes - p.dislikes) + (p.comments.length * 2);
}

function initTerminalSimulator() {
  const output = document.getElementById("terminal-output");
  const promptUser = document.getElementById("terminal-prompt-user");
  if (!output || !promptUser) return;

  promptUser.textContent = blogEngineState.currentUser;
  output.innerHTML = `
    <div class="text-sky-300 font-mono text-xs mb-3">
      ==============================================================<br>
       KOTLIN CLI COMMUNITY BLOG ENGINE (Standard JVM)<br>
       Architecture: Unidirectional Data Flow & Pure Reducers<br>
       User: [${blogEngineState.currentUser}] | Posts: ${blogEngineState.posts.length}<br>
       Status: ${blogEngineState.statusMessage}<br>
      ==============================================================<br>
      Type <span class="text-amber-300 font-bold">'help'</span> for command list.<br>
    </div>
  `;
}

function handleTerminalSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("terminal-input-command");
  const output = document.getElementById("terminal-output");
  if (!input || !output) return;

  const raw = input.value.trim();
  input.value = "";
  if (!raw) return;

  const row = document.createElement("div");
  row.className = "text-xs font-mono text-slate-300 mt-2";
  row.innerHTML = `<span class="text-sky-400">[User: ${blogEngineState.currentUser}] &gt;</span> <span class="text-white font-semibold">${escapeHtml(raw)}</span>`;
  output.appendChild(row);

  const parts = raw.split(" ");
  const command = parts[0].toLowerCase();
  const param = parts.slice(1).join(" ").trim();
  let resultHtml = "";

  switch (command) {
    case "help":
      resultHtml = `
        <div class="text-xs font-mono text-sky-200 pl-2 border-l-2 border-sky-400 my-2 space-y-1">
          <p><span class="text-sky-400 font-bold">feed</span> - View chronological feed</p>
          <p><span class="text-sky-400 font-bold">trending</span> - View posts ranked by score</p>
          <p><span class="text-sky-400 font-bold">view &lt;id&gt;</span> - Read post discussions</p>
          <p><span class="text-sky-400 font-bold">create &lt;title&gt; | &lt;content&gt;</span> - Publish new post</p>
          <p><span class="text-sky-400 font-bold">like &lt;id&gt;</span> - Increment like</p>
          <p><span class="text-sky-400 font-bold">comment &lt;id&gt; &lt;text&gt;</span> - Add reply</p>
          <p><span class="text-sky-400 font-bold">user &lt;name&gt;</span> - Switch profile</p>
          <p><span class="text-sky-400 font-bold">clear</span> - Clear terminal</p>
        </div>
      `;
      break;

    case "feed":
      const feedList = [...blogEngineState.posts].reverse().map(p => `
        <div class="p-2 my-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
          <div class="text-sky-300 font-bold">[#${p.id}] "${escapeHtml(p.title)}" <span class="text-slate-400 font-normal">by @${p.author}</span></div>
          <div class="text-slate-400 text-[10px] mt-0.5">Likes: ${p.likes} | Dislikes: ${p.dislikes} | Comments: ${p.comments.length} | Score: <span class="text-emerald-400">${getEngagementScore(p)}</span></div>
        </div>
      `).join("");
      resultHtml = `<div class="my-2"><p class="text-xs text-sky-400 font-bold mb-1">--- LATEST FEED ---</p>${feedList}</div>`;
      break;

    case "trending":
      const ranked = [...blogEngineState.posts].sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
      const trendList = ranked.map((p, idx) => `
        <div class="p-2 my-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
          <span class="text-amber-400 font-bold">#${idx + 1}</span> [#${p.id}] "${escapeHtml(p.title)}" (Score: <span class="text-emerald-400">${getEngagementScore(p)}</span>)
        </div>
      `).join("");
      resultHtml = `<div class="my-2"><p class="text-xs text-amber-400 font-bold mb-1">--- TRENDING POSTS ---</p>${trendList}</div>`;
      break;

    case "view":
      const vId = parseInt(param);
      const post = blogEngineState.posts.find(p => p.id === vId);
      if (!post) resultHtml = `<div class="text-xs font-mono text-rose-400">Post #${vId} not found.</div>`;
      else {
        resultHtml = `
          <div class="p-3 my-2 bg-slate-900 rounded border border-slate-800 text-xs font-mono space-y-1.5">
            <div class="text-sky-300 font-bold">[#${post.id}] ${escapeHtml(post.title)} (@${post.author})</div>
            <p class="text-slate-300">${escapeHtml(post.content)}</p>
            <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-800">Comments: ${post.comments.length} | Score: ${getEngagementScore(post)}</div>
          </div>
        `;
      }
      break;

    case "like":
      const lId = parseInt(param);
      const lPost = blogEngineState.posts.find(p => p.id === lId);
      if (lPost) {
        lPost.likes += 1;
        resultHtml = `<div class="text-xs font-mono text-emerald-400">Liked Post #${lId}! (+1)</div>`;
      } else {
        resultHtml = `<div class="text-xs font-mono text-rose-400">Post #${lId} not found.</div>`;
      }
      break;

    case "create":
      if (!param.includes("|")) {
        resultHtml = `<div class="text-xs font-mono text-amber-300">Format: create Title | Content</div>`;
      } else {
        const [title, content] = param.split("|");
        const np = {
          id: blogEngineState.nextPostId++,
          author: blogEngineState.currentUser,
          title: title.trim(),
          content: content.trim(),
          likes: 0,
          dislikes: 0,
          comments: []
        };
        blogEngineState.posts.push(np);
        resultHtml = `<div class="text-xs font-mono text-emerald-400">Published Post #${np.id}: "${escapeHtml(np.title)}"!</div>`;
      }
      break;

    case "user":
      if (param) {
        blogEngineState.currentUser = param.trim();
        document.getElementById("terminal-prompt-user").textContent = blogEngineState.currentUser;
        resultHtml = `<div class="text-xs font-mono text-sky-400">Switched user to @${blogEngineState.currentUser}</div>`;
      }
      break;

    case "clear":
      initTerminalSimulator();
      return;

    default:
      resultHtml = `<div class="text-xs font-mono text-rose-400">Unknown command: '${escapeHtml(command)}'. Type 'help'.</div>`;
      break;
  }

  const resDiv = document.createElement("div");
  resDiv.innerHTML = resultHtml;
  output.appendChild(resDiv);

  const termScroll = document.getElementById("terminal-scroll-area");
  if (termScroll) termScroll.scrollTop = termScroll.scrollHeight;
}

function runQuickTerminalCommand(cmd) {
  const input = document.getElementById("terminal-input-command");
  if (input) {
    input.value = cmd;
    const form = document.getElementById("terminal-input-form");
    if (form) form.dispatchEvent(new Event("submit"));
  }
}

// ==============================================================================
// 6. APP SIMULATOR 4: CAMPUSPULSE
// ==============================================================================
let campusCourses = [
  { id: "c1", code: "CS 301", name: "Mobile App Dev (Compose)", credits: 4, grade: "A", points: 4.0 },
  { id: "c2", code: "CS 240", name: "Data Structures & Algos", credits: 4, grade: "A-", points: 3.7 },
  { id: "c3", code: "CS 350", name: "Systems & Concurrency", credits: 3, grade: "B+", points: 3.3 },
  { id: "c4", code: "MATH 215", name: "Linear Algebra", credits: 3, grade: "A", points: 4.0 }
];

function renderCampusPulseUI() {
  const listEl = document.getElementById("campuspulse-courses-list");
  const gpaEl = document.getElementById("campuspulse-gpa-value");
  const creditsEl = document.getElementById("campuspulse-credits-value");
  if (!listEl) return;

  const totalCredits = campusCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = campusCourses.reduce((sum, c) => sum + (c.credits * c.points), 0);
  const gpa = totalCredits === 0 ? 0.0 : (totalPoints / totalCredits);

  if (gpaEl) gpaEl.textContent = gpa.toFixed(2);
  if (creditsEl) creditsEl.textContent = `${totalCredits} Credits`;

  listEl.innerHTML = campusCourses.map(c => `
    <div class="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
      <div>
        <span class="text-xs font-mono font-bold text-sky-400">${c.code}</span>
        <span class="text-xs font-semibold text-white ml-1.5">${c.name}</span>
        <p class="text-[10px] text-slate-400 mt-0.5">${c.credits} Credits</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
          ${c.grade}
        </span>
        <button onclick="removeCampusCourse('${c.id}')" class="text-slate-500 hover:text-rose-400 p-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  `).join("");
}

function handleAddCampusCourse(e) {
  e.preventDefault();
  const code = document.getElementById("course-code-input").value.trim();
  const name = document.getElementById("course-name-input").value.trim();
  const credits = parseInt(document.getElementById("course-credits-input").value) || 3;
  const grade = document.getElementById("course-grade-input").value;

  const gradePointsMap = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0 };
  if (!code || !name) return;

  campusCourses.push({
    id: "c-" + Date.now(),
    code,
    name,
    credits,
    grade,
    points: gradePointsMap[grade] || 3.0
  });

  document.getElementById("course-code-input").value = "";
  document.getElementById("course-name-input").value = "";
  renderCampusPulseUI();
  showToast(`Added ${code}`);
}

function removeCampusCourse(id) {
  campusCourses = campusCourses.filter(c => c.id !== id);
  renderCampusPulseUI();
}

// ==============================================================================
// 7. KEYBOARD NAVIGATION & INITIALIZATION
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("keydown", (e) => {
    const simModal = document.getElementById("simulator-modal");
    if (!simModal || simModal.classList.contains("hidden")) return;
    if (activeSimulatorType !== "calculator") return;

    if (e.key >= "0" && e.key <= "9") onCalcNumber(e.key);
    else if (e.key === ".") onCalcDecimal();
    else if (e.key === "+" || e.key === "-") onCalcOperation(e.key);
    else if (e.key === "*") onCalcOperation("×");
    else if (e.key === "/") onCalcOperation("÷");
    else if (e.key === "Enter" || e.key === "=") performCalcEvaluation();
    else if (e.key === "Backspace") onCalcDelete();
    else if (e.key === "Escape") onCalcClear();
  });

  const searchInput = document.getElementById("checklist-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      checklistSearchQuery = e.target.value;
      renderChecklistAppUI();
    });
  }
});
