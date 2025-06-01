import  { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import styled from 'styled-components';

const StyledForm = styled(Form)`
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-label {
    font-weight: 500;
  }
`;

interface AjouterBlogProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (formData: BlogFormData) => void;
}

export interface BlogFormData {
  type: string;
  titre: string;
  author: string;
  description: string;
  image: File | string | null;
}

const AjouterBlog: React.FC<AjouterBlogProps> = ({
  show,
  handleClose,
  handleSubmit,
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    type: '',
    titre: '',
    author: '',
    description: '',
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData);
    // Reset form
    setFormData({
      type: '',
      titre: '',
      author: '',
      description: '',
      image: null,
    });
    setPreviewUrl('');
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Blog Post</Modal.Title>
      </Modal.Header>
      <StyledForm onSubmit={onSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="blogType">Type</Form.Label>
            <select
              id="blogType"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="form-select"
              aria-labelledby="blogType"
              title="Select blog type"
            >
              <option value="">Select Type</option>
              <option value="Actualités liées aux Passioné">Actualités liées aux Passioné</option>
              <option value="Evénements sportifs">Evénements sportifs</option>
              <option value="Mon compte">Mon compte</option>
            </select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Enter blog title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Author</Form.Label>
            <Form.Control
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter author name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter blog description"
              rows={4}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="outline-success" type="submit">
            Add Blog
          </Button>
        </Modal.Footer>
      </StyledForm>
    </Modal>
  );
};

export default AjouterBlog;