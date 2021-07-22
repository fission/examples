import blogs from '../../../data/blogs.json'

export default function handler(req, res) {
  const { blog } = req.query

  const blogPost = blogs.find(b => b.slug === blog)
  res.status(200).json({'Post Slug': blogPost})
}
