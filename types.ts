
export interface Quote {
  id: string;
  text: string;
  author: string;
  book: string;
  year?: number;
}

export interface AuthorDetails {
  name: string;
  biography: string;
  notableWorks: string[];
  birthDeath?: string;
  sources: { title: string; uri: string }[];
}
