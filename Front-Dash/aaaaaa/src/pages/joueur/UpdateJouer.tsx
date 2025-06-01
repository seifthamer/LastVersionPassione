// AjouterJoueur.jsx
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { PlayerForm, FieldType } from "./Joueur";
// Import types from Joueur

type AjouterJoueurProps = {
  show: boolean;
  handleClose: () => void;
  handleAddPlayer: () => void;
  formData: PlayerForm;
  formErrors: Partial<PlayerForm>;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    name: keyof PlayerForm
  ) => void;
  fields: FieldType[];
};

const UpdateJouer: React.FC<AjouterJoueurProps> = ({
  show,
  handleClose,
  handleAddPlayer,
  formData,
  formErrors,
  handleInputChange,
  fields,
}) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update Joueur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {fields.map((field) => (
            <Form.Group
              className="mb-3"
              controlId={`form${field.name}`}
              key={field.name}
            >
              <Form.Label>{field.label}</Form.Label>
              <Form.Control
                type={field.type}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name]}
                disabled={field.label.toLowerCase() === 'value'}
                onChange={(e) => handleInputChange(e, field.name)}
                isInvalid={!!formErrors[field.name]}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors[field.name]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}

          <Form.Group className="mb-3" controlId="formAvailabilityStatus">
            <Form.Label>Availability Status</Form.Label>
            <Form.Select
              value={formData.availabilityStatus}
              onChange={(e) => handleInputChange(e, "availabilityStatus")}
              isInvalid={!!formErrors.availabilityStatus}
            >
              <option value="">Select availability</option>
              <option value="available">Available</option>
              <option value="willNotPlay">Will Not Play</option>
              <option value="uncertain">Uncertain</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.availabilityStatus}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button variant="success" onClick={handleAddPlayer}>
          Update Player
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateJouer;
