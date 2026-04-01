import Navbar from "@/components/Navbar";

import ProblemList
from "../components/ProblemList";

import useAuth from "../hooks/useAuth";

function Home() {

  const auth = useAuth();

  const user = auth?.user ?? null;

  return (

    <div className="app w-screen h-screen p-20 flex flex-col items-center justify-top">
        
        <Navbar />

        <ProblemList user={user} />

    </div>

  );

}

export default Home;