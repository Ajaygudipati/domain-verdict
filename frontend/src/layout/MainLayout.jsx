import Navbar from "../components/Navbar/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="pt-28">

        {children}

      </main>
    </>
  );
}