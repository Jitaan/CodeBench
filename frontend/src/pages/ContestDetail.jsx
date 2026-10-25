import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import { contestAPI } from "../services/api";
import useAuth from "../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/components/Navbar";

function ContestDetail() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [problemCount, setProblemCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(null);

  const refreshParticipants = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const result = await contestAPI.getParticipants(contestId);
      setParticipants(result.data);
      setParticipantCount(result.count ?? result.data.length);
      setLeaderboardError("");
    } catch (err) {
      setLeaderboardError(err.message || "Unable to load the contest leaderboard.");
      throw err;
    } finally {
      setLeaderboardLoading(false);
    }
  }, [contestId]);

  const refreshProblems = useCallback(async () => {
    const result = await contestAPI.getProblems(contestId);
    setProblems(result.data);
    setProblemCount(result.count ?? result.data.length);
  }, [contestId]);

  const clearRefreshState = useCallback(() => {
    if (location.state?.refresh) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state?.refresh, navigate]);

  useEffect(() => {
    if (!contestId) return;
    let active = true;
    contestAPI.getById(contestId)
      .then((result) => {
        if (active) setContest(result.data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load this contest.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [contestId]);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const interval = window.setInterval(updateCurrentTime, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const startTime = new Date(contest?.start_time).getTime();
  const endTime = new Date(contest?.end_time).getTime();
  const hasSchedule = Number.isFinite(startTime) && Number.isFinite(endTime);
  const contestState = !hasSchedule || currentTime === null
    ? contest?.status || "upcoming"
    : currentTime < startTime
      ? "upcoming"
      : currentTime >= endTime
        ? "ended"
        : "ongoing";
  const isContestOpen = contestState === "ongoing" && hasSchedule;
  const isParticipant = registered;

  useEffect(() => {
    if (!user || !contestId) return;
    let active = true;
    contestAPI.getRegistration(contestId)
      .then((res) => {
        if (active) setRegistered(res.data.registered);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to check contest registration.");
      })
      .finally(() => {
        if (active) setRegistrationLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, contestId]);

  useEffect(() => {
    if (!contest || !user || registrationLoading || contestState === "upcoming") return;
    if (isContestOpen && !registered) return;
    let active = true;
    Promise.allSettled([
      refreshProblems(),
      refreshParticipants(),
    ]).then(([problemResult, participantResult]) => {
      if (!active) return;
      if (problemResult.status === "rejected") {
        setError(problemResult.reason?.message || "Unable to load contest questions.");
      }
      if (participantResult.status === "rejected") {
        setLeaderboardError(participantResult.reason?.message || "Unable to load the contest leaderboard.");
      }
      clearRefreshState();
    });
    return () => {
      active = false;
    };
  }, [contestId, contest, user, registrationLoading, contestState, isContestOpen, registered, location.state?.refresh, refreshProblems, refreshParticipants, clearRefreshState]);

  if (authLoading || loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading contest...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!contest) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">{error || "Contest not found"}</div>;
  }

  if (contestState === "upcoming") {
    return <Navigate to="/contests" replace />;
  }

  if (contestState === "ongoing" && registrationLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Checking contest registration...</div>;
  }

  if (contestState === "ongoing" && !registered) {
    return <Navigate to="/contests" replace />;
  }

  return (
    <>
    <Navbar />
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-5 py-10 sm:py-16">
      <button onClick={() => navigate("/contests")} className="mb-8 text-sm text-muted-foreground transition-colors hover:text-foreground">
        &larr; All contests
      </button>
      <Card className="gap-0 rounded-2xl border border-border py-0 shadow-sm">
        <CardHeader className="border-b border-border px-6 py-7 sm:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              contestState === "ongoing" ? "bg-green-500/15 text-green-700" : contestState === "upcoming" ? "bg-blue-500/15 text-blue-700" : "bg-muted text-muted-foreground"
            }`}>{contestState}</span>
            <span className="text-sm text-muted-foreground">{participantCount} participants</span>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">{contest.title}</CardTitle>
          <CardDescription>{contest.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 px-6 py-7 sm:px-8">
          <div className="grid grid-cols-1 gap-5 border-b border-border pb-7 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Starts</p>
              <p>{new Date(contest.start_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Ends</p>
              <p>{new Date(contest.end_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
              <p className="capitalize">{contestState}</p>
            </div>
          </div>

          {isContestOpen ? (
            <p className="text-sm font-medium text-green-700">Contest in progress</p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Contest archive</p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-semibold">Problems</h3><span className="text-sm text-muted-foreground">{problemCount} total</span></div>
            {!isContestOpen && contestState !== "ended" ? (
              <p className="text-sm text-muted-foreground">Questions open when the contest starts.</p>
            ) : isContestOpen && !isParticipant ? (
              <p className="text-sm text-muted-foreground">Register for this contest before it starts to access the questions.</p>
            ) : problems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No problems added to this contest.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border"><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Problem</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Points</TableHead>
                    {isContestOpen && <TableHead>Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((cp, index) => (
                    <TableRow key={cp.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {isContestOpen ? (
                          <button className="text-left underline-offset-4 hover:underline" onClick={() => navigate(`/solve/${cp.problem_id}?contest=${contestId}`)}>
                            {cp.problems?.title || "Unknown"}
                          </button>
                        ) : (
                          <button className="text-left underline-offset-4 hover:underline" onClick={() => navigate(`/solve/${cp.problem_id}`)}>
                            {cp.problems?.title || "Unknown"}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>{cp.problems?.difficulty || "N/A"}</TableCell>
                      <TableCell>{cp.points}</TableCell>
                      {isContestOpen && (
                        <TableCell className={cp.solved ? "font-medium text-green-700" : "text-muted-foreground"}>
                          {cp.solved ? "Solved" : "Unsolved"}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table></div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-semibold">Participants</h3><span className="text-sm text-muted-foreground">Leaderboard</span></div>
            {leaderboardLoading ? (
              <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
            ) : leaderboardError ? (
              <p className="text-sm text-destructive" role="alert">{leaderboardError}</p>
            ) : participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No participants yet.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border"><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p, index) => (
                    <TableRow key={p.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{p.users?.name || "Unknown"}</TableCell>
                      <TableCell>{p.score ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
    </>
  );
}

export default ContestDetail;
