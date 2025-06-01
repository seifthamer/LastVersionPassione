import React from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

interface UpdateEquipeProps {
  show: boolean;
  handleClose: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  formErrors: { [key: string]: string };
  formData: {
    id: string;
    name: string;
    code: string;
    country: string;
    city: string;
    founded: string;
    logo: string;
    group: string;
    createdAt: string;
    staf: {
      entprincipal: string;
      entadjoints: { entadj1: string; entadj2: string };
      manager: string;
      entgardien: string;
      prepphysique: string;
      analystedonnes: string;
      kine: string;
      kineadjoint: string;
      medecins: { medc1: string; medc2: string };
      administration: { president: string; vicepresident: string };
      recruteurs: { recr1: string; recr2: string };
    };
  };
  generalError?: string;
}

const fields = [
  { name: "name", label: "Name" },
  { name: "code", label: "Code" },
  { name: "country", label: "Country" },
  { name: "city", label: "City" },
  { name: "founded", label: "Founded" },
  { name: "logo", label: "Logo" },
  { name: "group", label: "Group" },
  { name: "createdAt", label: "Created At" },
];

const staffFields = [
  { name: "staf.entprincipal", label: "Entraineur Principal" },
  { name: "staf.entadjoints.entadj1", label: "Entraineur Adjoint 1" },
  { name: "staf.entadjoints.entadj2", label: "Entraineur Adjoint 2" },
  { name: "staf.manager", label: "Manager" },
  { name: "staf.entgardien", label: "Entraineur Gardien" },
  { name: "staf.prepphysique", label: "Préparateur Physique" },
  { name: "staf.analystedonnes", label: "Analyste de Données" },
  { name: "staf.kine", label: "Kinésithérapeute" },
  { name: "staf.kineadjoint", label: "Kinésithérapeute Adjoint" },
  { name: "staf.medecins.medc1", label: "Médecin 1" },
  { name: "staf.medecins.medc2", label: "Médecin 2" },
  { name: "staf.administration.president", label: "Président" },
  { name: "staf.administration.vicepresident", label: "Vice-Président" },
  { name: "staf.recruteurs.recr1", label: "Recruteur 1" },
  { name: "staf.recruteurs.recr2", label: "Recruteur 2" },
];

const UpdateEquipe: React.FC<UpdateEquipeProps> = ({
  show,
  handleClose,
  handleChange,
  handleSubmit,
  formErrors,
  formData,
  generalError,
}) => {
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Update Equipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {generalError && (
            <Alert variant="danger" className="mb-3">
              {generalError}
            </Alert>
          )}

          <h5>General Information</h5>
          {fields.map((field) => (
            <Form.Group
              className="mb-3"
              controlId={`form${field.name}`}
              key={field.name}
            >
              <Form.Label>{field.label}</Form.Label>
              <Form.Control
                type="text"
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={formData[field.name as keyof typeof formData] || ""}
                onChange={handleChange}
                isInvalid={!!formErrors[field.name]}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors[field.name]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}

          <hr />
          <h5>Staff Information</h5>
          {staffFields.map((field) => (
            <Form.Group
              className="mb-3"
              controlId={`form${field.name}`}
              key={field.name}
            >
              <Form.Label>{field.label}</Form.Label>
              <Form.Control
                type="text"
                name={field.name}
                placeholder={`Enter ${field.label}`}
                value={getNestedValue(formData, field.name) || ""}
                onChange={handleChange}
                isInvalid={!!formErrors[field.name]}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors[field.name]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateEquipe;
