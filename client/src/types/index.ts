// Shared types for the Second Brain application

export interface Tag {
  _id: string;
  title: string;
  userId?: string;
  isGlobal?: boolean;
}

export interface Content {
  _id: string;
  title: string;
  link: string;
  type: "image" | "video" | "article" | "audio";
  notes?: string;
  isShared?: boolean;
  tags: Tag[];
  userId: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
}

export interface ShareLink {
  _id: string;
  userId: string;
  hash: string;
  isPublic: boolean;
  createdAt: Date;
}
