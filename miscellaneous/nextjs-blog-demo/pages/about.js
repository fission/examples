import Layout from "../components/layout";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <Layout title="About" description="About this blog">
      <h1 className={styles.title}>About Fission!</h1>

      <p className={styles.description}>
        Fission is a framework for serverless functions on Kubernetes.
        <br />
        Write short-lived functions in any language, and map them to HTTP
        requests (or other event triggers). Deploy functions instantly with one
        command. There are no containers to build, and no Docker registries to
        manage.
      </p>
    </Layout>
  );
}
