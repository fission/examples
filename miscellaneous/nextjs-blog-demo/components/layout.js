import Link from "next/link";
import { useRouter } from "next/dist/client/router";

import styles from "../styles/Home.module.css";
import Header from "./header";
import Footer from "./footer";

export default function Layout({ title, description, children }) {
  const pathname = useRouter().pathname;

  const activeLink = (route) => (pathname === route ? styles.activeLink : "");

  return (
    <>
      <div className={styles.container}>
        <Header title={title} description={description} />
        <ul className={styles.navbar}>
          <li className={activeLink("/")}>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li className={activeLink("/about")}>
            <Link href="/about">
              <a>About</a>
            </Link>
          </li>
        </ul>
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
    </>
  );
}
