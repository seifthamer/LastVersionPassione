import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface Props {
  show: boolean;
  handleClose: () => void;
  formErrors: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: () => Promise<void>;
  formData: {
    id: string;
    name: string;
    code: string;
    country: string;
    city: string;
    founded: string;
    logo: string | File;
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
}

const EquipeModal: React.FC<Props> = ({
  show,
  handleClose,
  formErrors,
  handleChange,
  handleSubmit,
  formData
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (formData.logo instanceof File) {
      const url = URL.createObjectURL(formData.logo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof formData.logo === 'string' && formData.logo) {
      setPreviewUrl(formData.logo);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.logo]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Team</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Code</Form.Label>
            <Form.Control
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              isInvalid={!!formErrors.code}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.code}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              isInvalid={!!formErrors.country}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.country}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              isInvalid={!!formErrors.city}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.city}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Founded</Form.Label>
            <Form.Control
              type="text"
              name="founded"
              value={formData.founded}
              onChange={handleChange}
              isInvalid={!!formErrors.founded}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.founded}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Logo</Form.Label>
            <Form.Control
              type="file"
              name="logo"
              onChange={handleChange}
              accept="image/*"
              isInvalid={!!formErrors.logo}
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </div>
            )}
            <Form.Control.Feedback type="invalid">
              {formErrors.logo}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Group</Form.Label>
            <Form.Control
              type="text"
              name="group"
              value={formData.group}
              onChange={handleChange}
              isInvalid={!!formErrors.group}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.group}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Staff Fields */}
          <h4 className="mt-4">Staff Information</h4>

          <Form.Group className="mb-3">
            <Form.Label>Head Coach</Form.Label>
            <Form.Control
              type="text"
              name="staf.entprincipal"
              value={formData.staf.entprincipal}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.entprincipal']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.entprincipal']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assistant Coach 1</Form.Label>
            <Form.Control
              type="text"
              name="staf.entadjoints.entadj1"
              value={formData.staf.entadjoints.entadj1}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.entadjoints.entadj1']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.entadjoints.entadj1']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assistant Coach 2</Form.Label>
            <Form.Control
              type="text"
              name="staf.entadjoints.entadj2"
              value={formData.staf.entadjoints.entadj2}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.entadjoints.entadj2']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.entadjoints.entadj2']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Manager</Form.Label>
            <Form.Control
              type="text"
              name="staf.manager"
              value={formData.staf.manager}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.manager']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.manager']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Goalkeeper Coach</Form.Label>
            <Form.Control
              type="text"
              name="staf.entgardien"
              value={formData.staf.entgardien}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.entgardien']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.entgardien']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Physical Trainer</Form.Label>
            <Form.Control
              type="text"
              name="staf.prepphysique"
              value={formData.staf.prepphysique}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.prepphysique']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.prepphysique']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Data Analyst</Form.Label>
            <Form.Control
              type="text"
              name="staf.analystedonnes"
              value={formData.staf.analystedonnes}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.analystedonnes']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.analystedonnes']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Physiotherapist</Form.Label>
            <Form.Control
              type="text"
              name="staf.kine"
              value={formData.staf.kine}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.kine']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.kine']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assistant Physiotherapist</Form.Label>
            <Form.Control
              type="text"
              name="staf.kineadjoint"
              value={formData.staf.kineadjoint}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.kineadjoint']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.kineadjoint']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doctor 1</Form.Label>
            <Form.Control
              type="text"
              name="staf.medecins.medc1"
              value={formData.staf.medecins.medc1}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.medecins.medc1']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.medecins.medc1']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doctor 2</Form.Label>
            <Form.Control
              type="text"
              name="staf.medecins.medc2"
              value={formData.staf.medecins.medc2}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.medecins.medc2']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.medecins.medc2']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>President</Form.Label>
            <Form.Control
              type="text"
              name="staf.administration.president"
              value={formData.staf.administration.president}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.administration.president']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.administration.president']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Vice President</Form.Label>
            <Form.Control
              type="text"
              name="staf.administration.vicepresident"
              value={formData.staf.administration.vicepresident}
              onChange={handleChange}
              isInvalid={!!formErrors['staf.administration.vicepresident']}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors['staf.administration.vicepresident']}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recruiter 1</Form.Label>
              <Form.Control
                type="text"
              name="staf.recruteurs.recr1"
              value={formData.staf.recruteurs.recr1}
                onChange={handleChange}
              isInvalid={!!formErrors['staf.recruteurs.recr1']}
              />
              <Form.Control.Feedback type="invalid">
              {formErrors['staf.recruteurs.recr1']}
              </Form.Control.Feedback>
            </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recruiter 2</Form.Label>
              <Form.Control
                type="text"
              name="staf.recruteurs.recr2"
              value={formData.staf.recruteurs.recr2}
                onChange={handleChange}
              isInvalid={!!formErrors['staf.recruteurs.recr2']}
              />
              <Form.Control.Feedback type="invalid">
              {formErrors['staf.recruteurs.recr2']}
              </Form.Control.Feedback>
            </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Team
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EquipeModal;
