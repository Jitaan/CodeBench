import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contestAPI } from "../services/api";
import useAuth from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ContestTable({ contests, past = false, currentTime, registrations = {}, joiningContest, onRegistration, onEnter, onView }) {
  if (contests.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">{past ? "No past contests yet." : "No upcoming contests available."}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableCaption className="px-4 pb-4 text-left">{past ? "Finished contests and results" : "Scheduled and active contests"}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead className="w-[28%]">Title</TableHead>
            <TableHead className="w-[24%]">Start Time</TableHead>
            <TableHead className="w-[24%]">End Time</TableHead>
            <TableHead className="w-[24%] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.map((contest, index) => {
            const registered = Boolean(registrations[contest.id]);
            const startsAt = new Date(contest.start_time).getTime();
            const endsAt = new Date(contest.end_time).getTime();
            const registrationOpen = !past && Number.isFinite(startsAt) && currentTime < startsAt && !registered;
            const canCancel = !past && Number.isFinite(startsAt) && currentTime < startsAt && registered;
            const canEnter = !past && registered && Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt <= currentTime && currentTime < endsAt;

            return (
              <TableRow key={contest.id}>
                <TableCell className="w-16 text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{contest.title}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(contest.start_time).toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(contest.end_time).toLocaleString()}</TableCell>
                <TableCell className="w-[24%] text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {past ? (
                      <Button size="sm" onClick={() => onView(contest.id)}>View Contest</Button>
                    ) : (
                      <>
                        <Button
                          variant={canCancel ? "outline" : "default"}
                          size="sm"
                          disabled={joiningContest === contest.id || (!registrationOpen && !canCancel)}
                          onClick={() => onRegistration(contest.id, !registered)}
                        >
                          {joiningContest === contest.id
                            ? "Updating..."
                            : canCancel
                              ? "Cancel Registration"
                              : registered
                                ? "Registered"
                                : registrationOpen
                                  ? "Register"
                                  : "Registration closed"}
                        </Button>
                        <Button size="sm" disabled={!canEnter} onClick={() => onEnter(contest.id)}>
                          Enter Contest
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ContestList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [joiningContest, setJoiningContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    let active = true;
    contestAPI.getAll()
      .then((res) => {
        if (active) setContests(res.data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load contests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || contests.length === 0) return;
    let active = true;
    Promise.all(contests.map(async (contest) => {
      try {
        const result = await contestAPI.getRegistration(contest.id);
        return [contest.id, result.data.registered];
      } catch {
        return [contest.id, false];
      }
    })).then((results) => {
      if (active) setRegistrations(Object.fromEntries(results));
    });
    return () => {
      active = false;
    };
  }, [user, contests]);

  const handleRegistration = async (contestId, shouldRegister) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setJoiningContest(contestId);
    setError("");
    try {
      if (shouldRegister) await contestAPI.register(contestId);
      else await contestAPI.leave(contestId);
      setRegistrations((current) => ({ ...current, [contestId]: shouldRegister }));
    } catch (err) {
      setError(err.message || "Unable to update contest registration.");
    } finally {
      setJoiningContest(null);
    }
  };

  const upcomingContests = useMemo(() => contests.filter((contest) => {
    const endsAt = new Date(contest.end_time).getTime();
    return !Number.isFinite(endsAt) || endsAt > currentTime;
  }), [contests, currentTime]);
  const pastContests = useMemo(() => contests.filter((contest) => {
    const endsAt = new Date(contest.end_time).getTime();
    return Number.isFinite(endsAt) && endsAt <= currentTime;
  }), [contests, currentTime]);

  if (loading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading contests...</div>;
  if (error && contests.length === 0) return <div className="py-12 text-center text-sm text-destructive">{error}</div>;

  return (
    <div className="space-y-12">
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <section aria-labelledby="upcoming-contests-heading" className="space-y-4">
        <div>
          <h2 id="upcoming-contests-heading" className="text-lg font-semibold tracking-tight">Upcoming contests</h2>
          <p className="text-sm text-muted-foreground">Register before the start, then enter once the contest opens.</p>
        </div>
        <ContestTable
          contests={upcomingContests}
          currentTime={currentTime}
          registrations={registrations}
          joiningContest={joiningContest}
          onRegistration={handleRegistration}
          onEnter={(contestId) => navigate(`/contests/${contestId}`)}
          onView={(contestId) => navigate(`/contests/${contestId}`)}
        />
      </section>
      <section aria-labelledby="past-contests-heading" className="space-y-4">
        <div>
          <h2 id="past-contests-heading" className="text-lg font-semibold tracking-tight">Past contests</h2>
          <p className="text-sm text-muted-foreground">Review completed questions and the final leaderboard.</p>
        </div>
        <ContestTable contests={pastContests} past currentTime={currentTime} onView={(contestId) => navigate(`/contests/${contestId}`)} />
      </section>
    </div>
  );
}

export default ContestList;
