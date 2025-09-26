import { createItem, getAllItems, getItemById, updateItem, deleteItem } from './Utils-db';

const TABLE_NAME = 'Blogpost';

export const getBlogs = async () => {
  try {
    const blogs = await getAllItems(TABLE_NAME);
    return { blogs };
  } catch (error) {
    throw new Error('Failed to fetch blogs');
  }
};

export const createBlog = async (blogData) => {
  try {
    // Generate sequential ID (you'll need to implement this)
    const nextId = await generateNextBlogId();
    
    const blogWithId = {
      ...blogData,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await createItem(TABLE_NAME, blogWithId);
    return { message: "Blog post created successfully", id: nextId };
  } catch (error) {
    throw new Error('Failed to create blog');
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    const updatedData = {
      ...blogData,
      updatedAt: new Date().toISOString()
    };
    
    await updateItem(TABLE_NAME, id, updatedData);
    return { message: "Blog post updated successfully" };
  } catch (error) {
    throw new Error('Failed to update blog');
  }
};

export const deleteBlog = async (id) => {
  try {
    await deleteItem(TABLE_NAME, id);
    return { message: "Blog post deleted successfully" };
  } catch (error) {
    throw new Error('Failed to delete blog');
  }
};

// Helper function to generate sequential IDs
async function generateNextBlogId() {
  const blogs = await getAllItems(TABLE_NAME);
  
  if (blogs.length === 0) {
    return '01'; // Starting ID
  }
  
  // Get the highest ID and increment
  const maxId = blogs.reduce((max, blog) => {
    const num = parseInt(blog.id, 10);
    return num > max ? num : max;
  }, 0);
  
  return (maxId + 1).toString().padStart(2, '0');
}