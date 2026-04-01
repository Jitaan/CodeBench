import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";

import API from "../services/api";

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
  const { user, loading } = useAuth();
  const [fullProblem, setFullProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);

    useEffect(() => {
    if (!problemId) return;
    API.get(`/problems/${problemId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setFullProblem(res.data[0]);
        } else {
          setFullProblem(res.data);
        }
        setProblemLoading(false);
      })
      .catch(err => {
        console.error("Problem fetch error:", err)
        setProblemLoading(false);
      });
  }, [problemId]);

  if (loading) {
    return <div>Checking login...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (problemLoading || !fullProblem) {
    return <div>Loading problem...</div>;
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
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>

  );

}

export default Solve;