import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import blogs from '../data/blogs.json'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Blog Demo</title>
        <meta name="description" content="Demo Blog With posts" />
        <link rel="icon" href="/nextapp/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://fission.io">Fission!</a>
        </h1>

        <p className={styles.description}>
          Kubernetes-native Serverless Framework
        </p>

        <div className={styles.grid}>
          {blogs.map(blog => (
            <div className={styles.card} key={blog.slug}>
              <Link href={`/${blog.slug}`}>
                <div>
                  <h2>{blog.title} &rarr;</h2>
                  <p>{blog.author}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        Powered by{' '}
        <span className={styles.logo}>
          <Image src={"/nextapp/vercel.svg"} alt="Vercel Logo" width={72} height={20} />
        </span>
        <span className={styles.logo}>
          <Image src={"/nextapp/fission.png"} alt="Fission Logo" width={72} height={20} />
        </span>
      </footer>
    </div>
  )
}
