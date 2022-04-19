import styles from "../styles/Home.module.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      Powered by{" "}
      <span className={styles.logo}>
        <Image
          src={process.env.imgPrefix + "/vercel.svg"}
          alt="Vercel Logo"
          width={72}
          height={20}
        />
      </span>
      <span className={styles.logo}>
        <Image
          src={process.env.imgPrefix + "/fission.png"}
          alt="Fission Logo"
          width={72}
          height={20}
        />
      </span>
    </footer>
  );
}
