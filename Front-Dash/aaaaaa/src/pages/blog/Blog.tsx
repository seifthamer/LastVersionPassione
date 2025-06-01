import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Modal,
  Toast,
  ToastContainer,
  Spinner,
  Alert,
} from "react-bootstrap";
import styled from "styled-components";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaEdit, FaSearch } from "react-icons/fa";
import { Pagination as BootstrapPagination } from "react-bootstrap";
import AjouterBlog, { BlogFormData } from "./AjouterBlog";
import ModifierBlog from "./ModifierBlog";
import DetailsBlog from "./DetailsBlog";
import {
  getAllBlogs,
  deleteBlog,
  createBlog,
  updateBlog,
  Blog as BlogType,
} from "../../Store/blogStore";
import { IoEyeSharp } from "react-icons/io5";

// Styled Components
const HeaderBlog = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5%;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 400px;

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    z-index: 2;
  }

  .form-control {
    padding-left: 2.5rem;
    border-radius: 4px;
    border: 1px solid #ced4da;
    background-color: white;
    width: 100%;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
`;

interface SelectedBlog extends BlogFormData {
  id: string;
}

interface ErrorResponse {
  data?: {
    error?: string;
    details?: string;
  };
}

interface AxiosError extends Error {
  response?: ErrorResponse;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<SelectedBlog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBlogDetails, setSelectedBlogDetails] =
    useState<BlogType | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const data = await getAllBlogs();
      setBlogs(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch blogs. Please try again later.");
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = useMemo(() => {
    if (!searchTerm) return blogs;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        blog.author.toLowerCase().includes(lowerCaseSearchTerm) ||
        blog.type.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [blogs, searchTerm]);

  const totalPages = useMemo(
    () => Math.ceil(filteredBlogs.length / itemsPerPage),
    [filteredBlogs.length, itemsPerPage]
  );

  const currentBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBlogs.slice(startIndex, endIndex);
  }, [filteredBlogs, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedBlogId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBlogId) {
      try {
        await deleteBlog(selectedBlogId);
        setBlogs(blogs.filter((blog) => blog._id !== selectedBlogId));
        setShowDeleteModal(false);
        setSelectedBlogId(null);
        setToastMessage("Blog deleted successfully!");
        setShowToast(true);
      } catch (error) {
        setError("Failed to delete blog. Please try again.");
        console.error("Error deleting blog:", error);
      }
    }
  };

  const handleUpdate = (id: string) => {
    const blogToEdit = blogs.find((blog) => blog._id === id);
    if (blogToEdit) {
      setSelectedBlog({
        id: blogToEdit._id,
        type: blogToEdit.type,
        titre: blogToEdit.title,
        author: blogToEdit.author,
        description: blogToEdit.content,
        image: blogToEdit.logo,
      });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (formData: BlogFormData) => {
    if (selectedBlog) {
      try {
        const updatedBlog = await updateBlog(
          selectedBlog.id,
          formData
        );
        setBlogs(
          blogs.map((blog) =>
            blog._id === selectedBlog.id ? updatedBlog : blog
          )
        );
        setShowEditModal(false);
        setSelectedBlog(null);
        setToastMessage("Blog updated successfully!");
        setShowToast(true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message :
          typeof error === 'object' && error !== null && 'response' in error ?
            (error as AxiosError).response?.data?.error || 
            (error as AxiosError).response?.data?.details || 
            "Failed to update blog. Please try again." :
            "Failed to update blog. Please try again.";
        setError(errorMessage);
        console.error("Error updating blog:", error);
      }
    }
  };

  const handleAddBlog = async (formData: BlogFormData) => {
    try {
      const newBlog = await createBlog(formData);
      setBlogs([...blogs, newBlog]);
      setShowAddModal(false);
      setToastMessage("Blog added successfully!");
      setShowToast(true);
    } catch (error) {
      setError("Failed to add blog. Please try again.");
      console.error("Error adding blog:", error);
    }
  };

  const handleViewDetails = (blog: BlogType) => {
    setSelectedBlogDetails(blog);
    setShowDetailsModal(true);
  };

  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxPageButtons = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    items.push(
      <BootstrapPagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    if (startPage > 1) {
      items.push(
        <BootstrapPagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </BootstrapPagination.Item>
      );
      if (startPage > 2) {
        items.push(
          <BootstrapPagination.Ellipsis key="ellipsis-start" disabled />
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <BootstrapPagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </BootstrapPagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <BootstrapPagination.Ellipsis key="ellipsis-end" disabled />
        );
      }
      items.push(
        <BootstrapPagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </BootstrapPagination.Item>
      );
    }

    items.push(
      <BootstrapPagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <div>
      {/* Header */}
      <HeaderBlog>
        <h2>Gestion Des Blogs</h2>
        <SearchContainer>
          <FaSearch className="search-icon" />
          <Form.Control
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <Button
          variant="outline-success"
          className="rounded-pill px-4 py-2 d-flex align-items-center"
          style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
          onClick={() => setShowAddModal(true)}
        >
          <MdAdd size={22} className="me-2" />
          <span className="fw-semibold">Ajouter Blog</span>
        </Button>
      </HeaderBlog>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1060 }}
      >
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Table style={{ cursor: "pointer" }} bordered hover responsive>
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Author</th>
            <th>Content</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="text-center">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : currentBlogs.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                {searchTerm
                  ? "No blogs found matching your search."
                  : "No blogs available."}
              </td>
            </tr>
          ) : (
            currentBlogs.map((blog) => (
              <tr key={blog._id}>
                <td>{blog.type}</td>
                <td>{blog.title}</td>
                <td>{blog.author}</td>
                <td>{blog.content}</td>
                <td>
                  {blog.logo ? (
                    <img
                      src={
                        blog.logo.startsWith("http")
                          ? blog.logo
                          : `http://localhost:5000${blog.logo}`
                      }
                      alt={blog.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewDetails(blog)}
                  >
                    <IoEyeSharp />
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleUpdate(blog._id)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(blog._id)}
                  >
                    <MdDelete />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {renderPaginationItems() && (
        <PaginationContainer>
          <BootstrapPagination>{renderPaginationItems()}</BootstrapPagination>
        </PaginationContainer>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this blog post?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Blog Modal */}
      <AjouterBlog
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddBlog}
      />

      {/* Edit Blog Modal */}
      {selectedBlog && (
        <ModifierBlog
          show={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setSelectedBlog(null);
          }}
          handleSubmit={handleEditSubmit}
          initialData={selectedBlog}
        />
      )}

      {/* Details Modal */}
      <DetailsBlog
        show={showDetailsModal}
        handleClose={() => setShowDetailsModal(false)}
        blog={selectedBlogDetails}
      />
    </div>
  );
};

export default Blog;
