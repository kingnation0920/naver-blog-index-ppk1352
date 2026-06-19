import { XMLParser } from "fast-xml-parser";

const NAVER_BLOG_ID = "ppk1352";
const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
export const revalidate = 3600;

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function getPostSlug(link = "") {
  const match = link.match(/\/(\d+)(?:\?|$)/);
  return match ? match[1] : null;
}

async function getPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    return items.map((item) => {
      const link = item.link ?? "#";
      const slug = getPostSlug(link);
      return {
        title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "(ì ëª© ìì)",
        link,
        slug,
        description: typeof item.description === "string" ? item.description : item.description?.["#text"] ?? "",
        pubDate: item.pubDate ?? "",
      };
    });
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>ë¸ë¡ê·¸ í¬ì¤í¸ ëª©ë¡</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post, i) => (
          <li key={i} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid #eee" }}>
            <a
              href={post.slug ? `/posts/${post.slug}` : post.link}
              {...(!post.slug ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              style={{ fontSize: 18, fontWeight: 600, color: "#333", textDecoration: "none" }}
            >
              {post.title}
            </a>
            {post.pubDate && (
              <time style={{ display: "block", fontSize: 13, color: "#999", marginTop: 4 }}>
                {post.pubDate}
              </time>
            )}
            {post.description && (
              <p style={{ fontSize: 14, color: "#666", marginTop: 8, lineHeight: 1.6 }}>
                {stripHtml(post.description).slice(0, 120)}...
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
