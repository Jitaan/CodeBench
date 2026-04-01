import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

function DescriptionPanel({ problem }) {
  if (!problem)
    return (
      <div className="w-[40%] p-5">
        Loading...
      </div>
    );

    const difficultyStyles = {
    Easy:
      "bg-[#0d2e1e] text-[#2cba7e]",
    Medium:
      "bg-[#2e1e08] text-[#f5a623]",
    Hard:
      "bg-[#2e0d0d] text-[#ef4444]"
  };

  const navigate = useNavigate();

  return (
    <>
      <div
        className="w-75 px-5 pt-5 font-extrabold text-4xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        CodeBench
      </div>
      <div
        className="
          border border-[#3d3d3d]
          p-5
          overflow-y-auto
          m-5
          h-[calc(100vh-100px)]
          bg-[#1e1e1e]
          rounded-2xl
          no-scrollbar
        "
      >
        <h2
          className="
            text-[22px]
            font-bold
            mb-2.5
          "
        >
          {problem.title}
        </h2>
        <span
          className={`
            px-2.5 py-1
            rounded-lg
            text-xs
            ${difficultyStyles[problem.difficulty]}
          `}
        >
          {problem.difficulty}
        </span>
        <div
          className="
            mt-4
            leading-relaxed
            text-[#a6a6a6]
            no-scrollbar
          "
        >
          <ReactMarkdown>
            {problem.description}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}

export default DescriptionPanel;