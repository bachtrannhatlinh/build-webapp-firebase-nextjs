import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Blog } from "@/types/blog";

// READ - Get all blogs
export async function getBlogs(): Promise<Blog[]> {
  const blogsRef = collection(db, "blogs");
  const snapshot = await getDocs(blogsRef);

  const blogs: Blog[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Blog[];

  return blogs;
}

// READ - Get single blog by ID
export async function getBlogById(id: string): Promise<Blog | null> {
  const blogRef = doc(db, "blogs", id);
  const snapshot = await getDoc(blogRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Blog;
}

// CREATE - Add new blog
export async function createBlog(
  blog: Omit<Blog, "id" | "createAt">
): Promise<string> {
  const blogsRef = collection(db, "blogs");
  const docRef = await addDoc(blogsRef, {
    ...blog,
    createAt: Date.now(),
  });
  return docRef.id;
}

// UPDATE - Update existing blog
export async function updateBlog(
  id: string,
  blog: Partial<Omit<Blog, "id">>
): Promise<void> {
  const blogRef = doc(db, "blogs", id);
  await updateDoc(blogRef, blog);
}

// DELETE - Delete blog
export async function deleteBlog(id: string): Promise<void> {
  const blogRef = doc(db, "blogs", id);
  await deleteDoc(blogRef);
}
