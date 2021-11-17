import blogs from "../data/blogs.json";
import styles from "../styles/Home.module.css";
import Layout from "../components/layout";

export default function Blog({ blog }) {
  return (
    <Layout title={blog.title} description={blog.title}>
      <h1 className={styles.title}>{blog.title}</h1>

      <p className={styles.description}>{blog.author}</p>

      <p className={styles.description}>{blog.description}</p>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = blogs.map((blog) => ({
    params: { blog: blog.slug },
  }));

  // Paths will look like this:
  // [
  //   { params: { blog: 'websocket-sample' } },
  //   { params: { blog: 'log-monitoring'} }
  //   ...
  // ]
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const blog = blogs.find((blog) => blog.slug === params.blog);
  return { props: { blog } };
}
