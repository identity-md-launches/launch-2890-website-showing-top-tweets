import data from './data/posts.json';

export const topics = ['All tweets', 'Building', 'AI agents', 'Community', 'Memes'] as const;
export type Topic = typeof topics[number];
export type Post = typeof data.posts[number];
export type Author = typeof data.authors[number];
export const posts = data.posts;
export const authors = data.authors;
export const capturedAt = data.capturedAt;

export function selectPosts(query: string, topic: Topic, sort: string, savedOnly: boolean, saved: string[]) {
  const term = query.trim().toLocaleLowerCase().replace(/^[@#]/, '');
  return posts.filter(post => {
    const author = authors.find(author => author.handle === post.author)!;
    const searchable = `${post.text} ${post.topic} ${author.name} ${author.handle} IdentityMD $IMD`.toLocaleLowerCase();
    return (!savedOnly || saved.includes(post.id)) && (topic === 'All tweets' || post.topic === topic) && (!term || searchable.includes(term));
  }).sort((a, b) => sort === 'newest' ? b.date - a.date : b.likes - a.likes || b.reposts - a.reposts || b.date - a.date);
}
