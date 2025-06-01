import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Blog as BlogType } from "../../Store/blogStore";

interface DetailsBlogProps {
  show: boolean;
  handleClose: () => void;
  blog: BlogType | null;
}

const DetailsBlog: React.FC<DetailsBlogProps> = ({
  show,
  handleClose,
  blog,
}) => {
  if (!blog) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Blog Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" readOnly value={blog.title} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Control type="text" readOnly value={blog.type} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Author</Form.Label>
            <Form.Control type="text" readOnly value={blog.author} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              readOnly
              value={blog.content}
            />
          </Form.Group>

          {blog.logo && (
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <div>
                <img
                  src={
                    blog.logo.startsWith("http")
                      ? blog.logo
                      : `http://localhost:5000${blog.logo}`
                  }
                  alt={blog.title}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "contain",
                    marginTop: 10,
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailsBlog;
