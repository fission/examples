import Link from 'next/link'

const Header = () => (
  <header>
    <ul>
      <li>
        <Link href="/nextapp/">
          <a>Home</a>
        </Link>
      </li>
      <li>
        <Link href="/nextapp/about">
          <a>About</a>
        </Link>
      </li>
      <li>
        <Link href="/nextapp/post/[id]" as="/nextapp/post/first">
          <a>First Post</a>
        </Link>
      </li>
      <li>
        <Link href="/nextapp/post/[id]" as="/nextapp/post/second">
          <a>Second Post</a>
        </Link>
      </li>
    </ul>
  </header>
)

export default Header