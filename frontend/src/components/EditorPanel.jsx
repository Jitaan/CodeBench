import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { judgeAPI } from "../services/api";

import { Button } from "@/components/ui/button"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

function EditorPanel({ problemId, userId, email, contestId }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [awardMessage, setAwardMessage] = useState("");

  const handleSubmit = async () => {

    try {
      const res = await judgeAPI.submit(
        {
          problem_id: problemId,
          code: code,
          user_id: userId,
          email: email,
          contest_id: contestId || null
        }
      );
      setResult(res.data.status);
      if (res.data.status === "Accepted" && contestId) {
        setAwardMessage(res.data.newly_solved
          ? `Solved. ${res.data.awarded_points} points added to your score.`
          : "Already solved. No additional points were awarded.");
        navigate(`/contests/${contestId}`, { state: { refresh: Date.now() } });
      } else {
        setAwardMessage("");
      }
    }
    catch (err) {
      console.error(err);
      setAwardMessage(err.message || "Submission failed.");
    }
  };

  const handleRun = async () => {

    try {
      const res = await judgeAPI.run(
        {
          problem_id: problemId,
          code: code,
          user_id: userId,
          contest_id: contestId || null
        }
      );
      setResult(res.data.status);
    }
    catch (err) {
      console.error(err);
    }
  };

  return (
    <ResizablePanelGroup orientation="vertical" className="
        flex
        flex-col
        h-full
      ">
      <ResizablePanel>
        <div
          className="
          p-0.5
          m-5
          flex
          items-center
          justify-center
          gap-3
        "
        >
          <Button variant="outline" className="w-30 cursor-pointer rounded-md" onClick={handleRun}>Run</Button>
          <Button className="rounded-md bg-green-700 hover:bg-green-600 w-30 cursor-pointer text-white" onClick={handleSubmit} >Submit</Button>
        </div>
        
        <div
          className="
          flex-1
          h-[calc(100%-95px)]
          mx-2.5
          pl-2
          bg-[#1e1e1e]
          border border-[#3d3d3d]
          rounded-2xl
          overflow-hidden
          "
        >
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true
            }}
            className="rounded-2xl"
          />

        </div>
      </ResizablePanel>
      {/* <ResizableHandle /> */}
      <ResizablePanel>
        <div
          className={`
          m-2.5
          p-5
          rounded-2xl
          border border-[#3d3d3d]
          h-[calc(100%-40px)]
          font-semibold
            ${result === "Accepted"
              ? "bg-[#0d2e1e]"
              : result
                ? "bg-[#2e0d0d]"
                : "bg-[#1e1e1e]"
            }
          `}
          >

          <h2
            className="
              text-[22px]
              font-bold
              mb-2.5
            "
          >
            Test Verdict
          </h2>

          <div className={`
            
            ${result === "Accepted"
                ? "bg-[#0d2e1e] text-[#2cba7e]"
                : result
                  ? "bg-[#2e0d0d] text-[#ef4444]"
                  : "bg-[#1e1e1e] text-[#ef4444]"
              }
            `}>
            {result
              ? result === "Accepted"
                ? "Accepted"
                : `${result}`
              : "You must run your code first"}

          </div>
          {awardMessage && <p className="mt-3 text-sm text-muted-foreground" role="status">{awardMessage}</p>}

        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

}

export default EditorPanel;
