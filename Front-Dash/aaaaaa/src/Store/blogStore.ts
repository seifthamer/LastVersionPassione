import axios from 'axios';
import { BlogFormData } from '../pages/blog/AjouterBlog';

const API_URL = 'http://localhost:5000/blogs';

export interface Blog {
  _id: string;
  type: string;
  title: string;
  author: string;
  content: string;
  logo: string;
  viewsCount: number;
  date: string;
  tags?: string[];
  comments?: {
    author: string;
    comment: string;
    date: string;
  }[];
}

// Get all blogs
export const getAllBlogs = async (): Promise<Blog[]> => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// Get blog by ID
export const getBlogById = async (id: string): Promise<Blog> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

// Create new blog
export const createBlog = async (blogData: BlogFormData): Promise<Blog> => {
  try {
    // Convert form data to match server model
    const serverData = {
      type: blogData.type,
      title: blogData.titre,
      author: blogData.author,
      content: blogData.description,
      logo: blogData.image instanceof File ? URL.createObjectURL(blogData.image) : blogData.image
    };

    const response = await axios.post(API_URL, serverData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// Update blog
export const updateBlog = async (id: string, blogData: BlogFormData): Promise<Blog> => {
  try {
    console.log('Updating blog with data:', blogData);
    
    const formData = new FormData();
    formData.append('type', blogData.type);
    formData.append('title', blogData.titre);
    formData.append('author', blogData.author);
    formData.append('content', blogData.description);
    
    if (blogData.image instanceof File) {
      console.log('Appending new image file');
      formData.append('logo', blogData.image);
    } else if (blogData.image && typeof blogData.image === 'string') {
      console.log('Keeping existing image:', blogData.image);
      // Don't append the image if it's a string (existing URL)
    }

    // Log the FormData contents
    for (const pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Update response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating blog:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

// Delete blog
export const deleteBlog = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Increment blog views
export const incrementViews = async (id: string): Promise<Blog> => {
  try {
    const response = await axios.post(`${API_URL}/${id}/views`);
    return response.data.data;
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
};

// Add comment to blog
export const addComment = async (id: string, author: string, comment: string): Promise<Blog> => {
  try {
    const response = await axios.post(`${API_URL}/${id}/comments`, { author, comment });
    return response.data.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};