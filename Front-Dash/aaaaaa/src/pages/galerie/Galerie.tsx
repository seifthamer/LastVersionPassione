import React, { useState, useEffect } from "react";
import { Button, Row, Col, Modal, Form } from "react-bootstrap";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import axiosInstance from "../../Store/axiosConfig";

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

const Galerie = () => {
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchCarousel();
  }, []);

  const fetchCarousel = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/carousel/home');
      if (response.data.status === "success") {
        setCarousel(response.data.data);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch carousel images");
      console.error("Error fetching carousel:", err);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      }
      formDataToSend.append('title', formData.title);
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }

      const response = await axiosInstance.post('/carousel/home/image', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === "success") {
        await fetchCarousel();
        handleCloseAdd();
        setFormData({ title: "", image: null, link: "" });
      }
    } catch (err) {
      console.error("Error adding image:", err);
      setError("Failed to add image");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    try {
      // First delete the old image
      await axiosInstance.delete('/carousel/home/image', {
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

      const response = await axiosInstance.post('/carousel/home/image', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === "success") {
        await fetchCarousel();
        handleCloseUpdate();
        setFormData({ title: "", image: null, link: "" });
        setToastMessage('Image updated successfully!');
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error updating image:", err);
      setError("Failed to update image. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedImage) return;

    try {
      const response = await axiosInstance.delete('/carousel/home/image', {
        data: { imageUrl: selectedImage.url }
      });

      if (response.data.status === "success") {
        await fetchCarousel();
        handleCloseDelete();
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image");
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
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="">
          <span className=" border-3 border-success pb-1">
            Galerie
          </span>
        </h1>
        <Button
          variant="outline-success"
          onClick={handleShowAdd}
          className="rounded-pill px-4 py-2 d-flex align-items-center"
          style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
        >
          <MdAdd size={22} className="me-2" />
          <span className="fw-semibold">Ajouter</span>
        </Button>
      </div>

      <Row>
        {carousel?.images.map((image, index) => (
          <Col lg={3} md={4} sm={6} className="mb-4" key={index}>
            <div
              className="gallery-item position-relative rounded shadow-sm h-100"
              style={{
                overflow: "hidden",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.06)";
              }}
            >
              <div
                className="image-wrapper overflow-hidden"
                style={{ height: "220px" }}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="img-fluid w-100 h-100"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </div>

              <div className="p-3 bg-white">
                <h5 className="mb-0 fw-semibold text-truncate">
                  {image.title}
                </h5>
                {image.link && (
                  <a href={image.link} target="_blank" rel="noopener noreferrer" className="text-muted small">
                    {image.link}
                  </a>
                )}
              </div>

              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0";
                }}
              >
                <div className="d-flex gap-3">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowUpdate(image);
                    }}
                    className="rounded-circle p-2 d-flex justify-content-center align-items-center"
                    style={{ width: "42px", height: "42px" }}
                  >
                    <FaEdit size={18} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDelete(image);
                    }}
                    className="rounded-circle p-2 d-flex justify-content-center align-items-center"
                    style={{ width: "42px", height: "42px" }}
                  >
                    <MdDelete size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAdd} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-primary fw-bold">
            Ajouter une nouvelle photo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Titre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Entrez le titre de la photo"
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
              <Form.Label className="fw-semibold">Image</Form.Label>
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
            Modifier la photo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Titre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Entrez le titre de la photo"
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
              <Form.Label className="fw-semibold">Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="py-2 rounded-3"
              />
              <Form.Text className="text-muted fst-italic">
                Laissez vide si vous ne souhaitez pas changer l'image
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
              Êtes-vous sûr de vouloir supprimer cette image ?
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

export default Galerie;
