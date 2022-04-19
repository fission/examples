import Head from "next/head";

export default function Header({ title, description }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href={process.env.imgPrefix + "/favicon.ico"} />
    </Head>
  );
}
