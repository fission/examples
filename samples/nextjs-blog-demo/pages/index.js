import Link from "next/link";

import blogs from "../data/blogs.json";
import styles from "../styles/Home.module.css";
import Layout from "../components/layout";

export default function Home() {
  return (
    <Layout title="Demo Blog" description="Demo blog with posts">
      <h1 className={styles.title}>
        Welcome to <a href="https://fission.io">Fission!</a>
      </h1>

      <p className={styles.description}>
        Kubernetes-native Serverless Framework
      </p>

      <div className={styles.grid}>
        {blogs.map((blog) => (
          <div className={styles.card} key={blog.slug}>
            <Link href={`/${blog.slug}`} passHref>
              <div>
                <h2>{blog.title} &rarr;</h2>
                <p>{blog.author}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}
