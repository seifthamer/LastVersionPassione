import React, { useState, useEffect } from "react";
import { Button, Row, Col, Modal, Form, Table, Toast, ToastContainer, Spinner, Alert } from "react-bootstrap";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import axiosInstance from "../../Store/axiosConfig";
import styled from 'styled-components';

const HeaderSponsors = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5%;
`;

interface FormData {
  title: string;
  image: File | null;
  link?: string;
}

interface ImageData {
  url: string;
  title: string;
  link?: string;
  order: number;
}

interface CarouselData {
  type: string;
  images: ImageData[];
  isActive: boolean;
}

const Sponsors = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: null,
    link: "",
  });
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchCarousel();
  }, []);

  const fetchCarousel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/carousel/sponsors');
      if (response.data.status === "success") {
        setCarousel(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch sponsors. Please try again later.");
      console.error("Error fetching sponsors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAdd = () => setShowAddModal(false);
  const handleShowAdd = () => setShowAddModal(true);

  const handleCloseUpdate = () => setShowUpdateModal(false);
  const handleShowUpdate = (image: ImageData) => {
    setSelectedImage(image);
    setFormData({ 
      title: image.title, 
      image: null,
      link: image.link || ""
    });
    setShowUpdateModal(true);
  };

  const handleCloseDelete = () => setShowDeleteModal(false);
  const handleShowDelete = (image: ImageData) => {
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, try to create the sponsors carousel if it doesn't exist
      try {
        const formDataToSend = new FormData();
        if (formData.image) {
          formDataToSend.append('images', formData.image);
        }
        formDataToSend.append('type', 'sponsors');
        formDataToSend.append('title_0', formData.title);
        if (formData.link) {
          formDataToSend.append('link_0', formData.link);
        }

        await axiosInstance.post('/carousel', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (err: any) {
        // If error is not about existing carousel, throw it
        if (!err.response?.data?.message?.includes('already exists')) {
          throw err;
        }
      }

      // Now add the image to the carousel
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      }
      formDataToSend.append('title', formData.title);
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }

      const response = await axiosInstance.post('/carousel/sponsors/image', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === "success") {
        await fetchCarousel();
        handleCloseAdd();
        setFormData({ title: "", image: null, link: "" });
        setToastMessage('Sponsor added successfully!');
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error adding sponsor:", err);
      setError("Failed to add sponsor. Please try again.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    try {
      // First delete the old image
      await axiosInstance.delete('/carousel/sponsors/image', {
        data: { imageUrl: selectedImage.url }
      });

      // Then add the new image
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      }
      formDataToSend.append('title', formData.title);
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }

      const response = await axiosInstance.post('/carousel/sponsors/image', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === "success") {
        await fetchCarousel();
        handleCloseUpdate();
        setFormData({ title: "", image: null, link: "" });
        setToastMessage('Sponsor updated successfully!');
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error updating sponsor:", err);
      setError("Failed to update sponsor. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedImage) return;

    try {
      const response = await axiosInstance.delete('/carousel/sponsors/image', {
        data: { imageUrl: selectedImage.url }
      });

      if (response.data.status === "success") {
        await fetchCarousel();
        handleCloseDelete();
        setToastMessage('Sponsor deleted successfully!');
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error deleting sponsor:", err);
      setError("Failed to delete sponsor. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="py-4 px-3">
      <HeaderSponsors>
        <h2>Sponsors</h2>
        <Button
          variant="outline-success"
          onClick={handleShowAdd}
          className="rounded-pill px-4 py-2 d-flex align-items-center"
          style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
        >
          <MdAdd size={22} className="me-2" />
          <span className="fw-semibold">Ajouter</span>
        </Button>
      </HeaderSponsors>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
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

      <div style={{ overflowX: 'auto' }}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : carousel?.images.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  No sponsors available.
                </td>
              </tr>
            ) : (
              carousel?.images.map((image, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={image.url}
                      alt={image.title}
                      style={{ width: '100px', height: 'auto' }}
                    />
                  </td>
                  <td>{image.title}</td>
                  <td>
                    {image.link && (
                      <a href={image.link} target="_blank" rel="noopener noreferrer">
                        {image.link}
                      </a>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowUpdate(image)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleShowDelete(image)}
                    >
                      <MdDelete />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-primary fw-bold">
            Ajouter un nouveau sponsor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Titre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Entrez le titre du sponsor"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="py-2 rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Lien (optionnel)</Form.Label>
              <Form.Control
                type="url"
                name="link"
                placeholder="Entrez un lien (optionnel)"
                value={formData.link}
                onChange={handleInputChange}
                className="py-2 rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="py-2 rounded-3"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="light"
                onClick={handleCloseAdd}
                className="rounded-pill px-4"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="rounded-pill px-4"
              >
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdate} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-warning fw-bold">
            Modifier le sponsor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Titre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Entrez le titre du sponsor"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="py-2 rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Lien (optionnel)</Form.Label>
              <Form.Control
                type="url"
                name="link"
                placeholder="Entrez un lien (optionnel)"
                value={formData.link}
                onChange={handleInputChange}
                className="py-2 rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="py-2 rounded-3"
              />
              <Form.Text className="text-muted fst-italic">
                Laissez vide si vous ne souhaitez pas changer le logo
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="light"
                onClick={handleCloseUpdate}
                className="rounded-pill px-4"
              >
                Annuler
              </Button>
              <Button
                variant="warning"
                type="submit"
                className="rounded-pill px-4 text-white"
              >
                Mettre à jour
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDelete} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger fw-bold">
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-4">
          <div className="text-center mb-4">
            <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
              <MdDelete size={32} className="text-danger" />
            </div>
            <p className="fs-5 mb-0">
              Êtes-vous sûr de vouloir supprimer ce sponsor ?
            </p>
            <p className="text-muted mt-2 mb-0">
              Cette action est irréversible.
            </p>
          </div>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button
              variant="light"
              onClick={handleCloseDelete}
              className="rounded-pill px-4"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="rounded-pill px-4"
            >
              Supprimer
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Sponsors; 