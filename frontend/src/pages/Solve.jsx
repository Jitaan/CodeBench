import { useEffect, useState } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";

import { contestAPI, problemAPI } from "../services/api";

import DescriptionPanel from "../components/DescriptionPanel";
import EditorPanel from "../components/EditorPanel";

import useAuth from "../hooks/useAuth";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


function Solve() {
  const { problemId } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contest");
  const { user, loading } = useAuth();
  const [fullProblem, setFullProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [contestLoading, setContestLoading] = useState(Boolean(contestId));
  const [contestAccess, setContestAccess] = useState(null);

    useEffect(() => {
    if (!problemId) return;
    if (contestId && (!contestAccess || contestAccess.contestId !== contestId || contestAccess.problemId !== problemId || !contestAccess.allowed)) return;
    problemAPI.getById(problemId, contestId)
      .then(res => {
        setFullProblem(res.data);
        setProblemLoading(false);
      })
      .catch(err => {
        console.error("Problem fetch error:", err)
        setProblemLoading(false);
      });
  }, [problemId, contestId, contestAccess]);

  useEffect(() => {
    if (!contestId) return;
    contestAPI.getById(contestId)
      .then((res) => setContest(res.data))
      .catch((err) => console.error("Contest fetch error:", err))
      .finally(() => setContestLoading(false));
  }, [contestId]);

  useEffect(() => {
    if (!contestId || !user || contestAccess?.contestId === contestId && contestAccess?.problemId === problemId) return;
    let active = true;
    contestAPI.verifyAccess(contestId, problemId)
      .then(() => {
        if (active) setContestAccess({ contestId, problemId, allowed: true });
      })
      .catch((err) => {
        console.error("Contest access denied:", err);
        if (active) setContestAccess({ contestId, problemId, allowed: false });
      })
      .finally(() => {
        if (active) setContestLoading(false);
      });
    return () => {
      active = false;
    };
  }, [contestId, problemId, user, contestAccess?.contestId, contestAccess?.problemId]);

  if (loading) {
    return <div>Checking login...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const contestAccessMatches = contestAccess?.contestId === contestId && contestAccess?.problemId === problemId;

  if (contestId && !contestLoading && contestAccessMatches && !contestAccess.allowed) {
    return <Navigate to={`/contests/${contestId}`} replace />;
  }

  if (problemLoading || (contestId && (contestLoading || !contestAccessMatches)) || !fullProblem) {
    return <div>Loading problem...</div>;
  }

  if (contestId && !contest) {
    return <Navigate to={`/contests/${contestId}`} replace />;
  }

  return (
    <div className="h-screen flex">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel>
          <DescriptionPanel
            problem={fullProblem}
          />
        </ResizablePanel>
        {/* <ResizableHandle /> */}
        <ResizablePanel>
          <EditorPanel
            problemId={problemId}
            userId={user.id}
            email={user.email}
            contestId={contestId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>

  );

}

export default Solve;
