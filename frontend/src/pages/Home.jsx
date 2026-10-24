import Navbar from "@/components/Navbar";

import ProblemList
from "../components/ProblemList";

import useAuth from "../hooks/useAuth";

function Home() {

  const auth = useAuth();
  const user = auth?.user ?? null;

  return (

    <div className="min-h-screen">
        
        <Navbar />

        <main className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-primary">Practice space</p>
              <h1 className="text-2xl font-semibold tracking-tight">Sharpen your skills.</h1>
            </div>
          </div>
          <ProblemList user={user} />
        </main>

    </div>

  );

}

export default Home;
