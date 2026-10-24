import Navbar from "@/components/Navbar";
import ContestList from "../components/ContestList";

function Contests() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-primary">Competition space</p>
          <h1 className="text-2xl font-semibold tracking-tight">Put your skills to the test.</h1>
        </div>
        <ContestList />
      </main>
    </div>
  );
}

export default Contests;
