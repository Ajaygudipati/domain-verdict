import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function MainLayout({ children, hero = false }) {
  return (
    <>
      <Navbar hero={hero} />

      <main className={hero ? "" : "pt-28"}>

        {children}

      </main>
      <Footer />
    </>
  );
}
