import Navbar from "@/components/Navbar";
import ContestList from "../components/ContestList";

function Contests() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <main className="mx-auto min-h-[calc(100dvh-5rem)] w-full max-w-6xl px-5 py-10">
        <ContestList />
      </main>
    </div>
  );
}

export default Contests;
