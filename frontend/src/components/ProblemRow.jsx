import {
  TableCell,
  TableRow,
} from "@/components/ui/table"

import { useNavigate } from "react-router-dom";

function ProblemRow({ problem, user }) {

  const navigate = useNavigate();

  const handleClick = () => {

    // console.log("User in row: ", user);

    if (!user) {

      alert("Login to continue");

      navigate("/login");

      return;

    }

    navigate(`/solve/${problem.id}`);

  };

  return (

    <TableRow
      className="prob-row cursor-pointer"
      onClick={handleClick}
    >

      <TableCell className="status-cell">

        {problem.id}

      </TableCell>

      <TableCell className="prob-title">

        {problem.title}

      </TableCell>

      {/* TODO: change to no of submission */}

      <TableCell className="acceptance">

        {problem.difficulty}

      </TableCell>

    </TableRow>

  );

}

export default ProblemRow;