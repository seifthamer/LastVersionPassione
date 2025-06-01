import { Modal, Button, Form } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BlogFormData } from './AjouterBlog';

const StyledForm = styled(Form)`
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-label {
    font-weight: 500;
  }
`;

interface ModifierBlogProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (formData: BlogFormData) => void;
  initialData: BlogFormData & { id: string };
}

const ModifierBlog: React.FC<ModifierBlogProps> = ({
  show,
  handleClose,
  handleSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    type: '',
    titre: '',
    author: '',
    description: '',
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        titre: initialData.titre,
        author: initialData.author,
        description: initialData.description,
        image: null, // We don't set the image as it's a File object
      });
      // If there's an existing image URL, use it as preview
      if (initialData.image && typeof initialData.image === 'string') {
        setPreviewUrl(initialData.image);
      }
    }
  }, [initialData]);

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
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Blog Post</Modal.Title>
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
            Save Changes
          </Button>
        </Modal.Footer>
      </StyledForm>
    </Modal>
  );
};

export default ModifierBlog;
