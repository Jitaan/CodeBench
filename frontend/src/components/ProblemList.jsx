import { useEffect, useState } from "react";
import { problemAPI } from "../services/api";
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
    problemAPI.getAll()
      .then(res => {
        console.log("DATA:", res.data);
        console.log("IS ARRAY:", Array.isArray(res.data));
        setProblems(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableCaption className="px-4 pb-4 text-left">Build consistency, one problem at a time.</TableCaption>
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
