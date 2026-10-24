import supabase from "./supabase";

const backendUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

async function backendRequest(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Backend returned a non-JSON response (${response.status}). Check that VITE_API_BASE_URL points to the Flask API.`);
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return { data };
}

// Preserve the `{ data }` shape already used by the components while reading
// application data directly from the configured Supabase project.
async function query(request) {
  const { data, error } = await request;
  if (error) throw error;
  return { data };
}

export const problemAPI = {
  getAll: () => query(supabase.from("problems").select("id, title, difficulty")),
  getById: (id, contestId) => contestId
    ? backendRequest(`/problems/${id}?contest_id=${contestId}`).then(({ data }) => ({ data: data[0] }))
    : query(supabase.from("problems").select("*").eq("id", id).single()),
};

export const contestAPI = {
  // Do not filter by a stored status here. A contest can become ongoing when
  // its start time is reached even if the status field has not been updated.
  getAll: () => query(supabase.from("contests").select("id, title, description, start_time, end_time, status").order("start_time", { ascending: true })),
  getById: (id) => query(supabase.from("contests").select("*").eq("id", id).single()),
  create: (data) => query(supabase.from("contests").insert(data).select()),
  update: (id, data) => query(supabase.from("contests").update(data).eq("id", id).select()),
  delete: (id) => query(supabase.from("contests").delete().eq("id", id)),
  getProblems: async (contestId) => {
    const { data } = await backendRequest(`/contests/${contestId}/problems`);
    return { data: data.problems, count: data.count };
  },
  addProblem: (contestId, data) => query(supabase.from("contest_problems").insert({ ...data, contest_id: contestId }).select()),
  removeProblem: (contestId, problemId) => query(supabase.from("contest_problems").delete().eq("contest_id", contestId).eq("problem_id", problemId)),
  getParticipants: async (contestId) => {
    const { data } = await backendRequest(`/contests/${contestId}/participants`);
    return { data: data.participants, count: data.count };
  },
  getRegistration: (contestId) => backendRequest(`/contests/${contestId}/registration`),
  register: (contestId) => backendRequest(`/contests/${contestId}/registration`, { method: "POST" }),
  join: (contestId) => backendRequest(`/contests/${contestId}/participants`, { method: "POST" }),
  leave: (contestId) => backendRequest(`/contests/${contestId}/registration`, { method: "DELETE" }),
  verifyAccess: (contestId, problemId) => backendRequest(`/contests/${contestId}/access?problem_id=${problemId}`),
};

// Code execution uses the authenticated Flask API for contest and practice attempts.
export const judgeAPI = {
  run: (data) => backendRequest("/run", { method: "POST", body: JSON.stringify(data) }),
  submit: (data) => backendRequest("/submit", { method: "POST", body: JSON.stringify(data) }),
};
