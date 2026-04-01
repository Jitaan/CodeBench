import { useEffect, useState } from "react";
import API from "../services/api";
import ProblemRow from "./ProblemRow";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function ProblemList({user}) {
  const [problems, setProblems] = useState([]);
  useEffect(() => {
    API.get("/problems")
      .then(res => {
        setProblems(res.data);
      })
      .catch(err => {
        console.error(err);
      });

  }, []);

  return (
    <div className="problem-table-wrap">
      <Table className="w-250">
        <TableCaption>git good at problem solving & programming. use codebench today.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Difficulty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {problems.map(p => (
            <ProblemRow
              key={p.id}
              problem={p} 
              user={user}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ProblemList;