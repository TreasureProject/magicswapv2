import { toast } from "sonner";

export default function SwapPage() {
  return (
    <main className="mx-auto max-w-7xl text-center sm:px-6 lg:px-8">
      <button
        className="border border-white font-bold text-white"
        onClick={() => toast.success("testing123")}
      >
        testing 123
      </button>
    </main>
  );
}
