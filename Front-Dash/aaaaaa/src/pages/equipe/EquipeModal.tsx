 import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

interface Props {
  show: boolean;
  handleClose: () => void;

  formErrors: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
}

const EquipeModal: React.FC<Props> = ({
  show,
  handleClose,

  formErrors,
  handleChange,
  handleSubmit,
}) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une Équipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {[
            "id",
            "name",
            "code",
            "country",
            "city",
            "founded",
            "logo",
            "group",
            "createdAt",
          ].map((field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{field}</Form.Label>
              <Form.Control
                type="text"
                name={field}
                onChange={handleChange}
                isInvalid={!!formErrors[field]}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors[field]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}

          <hr />
          <h5>Staff</h5>
          {[
            "staf.entprincipal",
            "staf.entadjoints.entadj1",
            "staf.entadjoints.entadj2",
            "staf.manager",
            "staf.entgardien",
            "staf.prepphysique",
            "staf.analystedonnes",
            "staf.kine",
            "staf.kineadjoint",
            "staf.medecins.medc1",
            "staf.medecins.medc2",
            "staf.administration.president",
            "staf.administration.vicepresident",
            "staf.recruteurs.recr1",
            "staf.recruteurs.recr2",
          ].map((field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{field}</Form.Label>
              <Form.Control
                type="text"
                name={field}
                onChange={handleChange}
                isInvalid={!!formErrors[field]}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors[field]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Ajouter
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EquipeModal;
