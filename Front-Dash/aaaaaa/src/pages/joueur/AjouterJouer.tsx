// src/components/Joueur/AjouterJoueur.tsx

import React, { useState, useEffect, ChangeEvent } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FaUpload } from "react-icons/fa";

// --- Store Import ---
// Adjust path as necessary
import { getTeamById, getAllTeams, Team } from "../../Store/joueurStore";

// --- Type Imports ---
// Import types exported from Joueur.tsx
import { PlayerFormData, PlayerFormField } from "./Joueur"; // Adjust path if needed

// --- Utility Function (Defined and Exported Here) ---
/**
 * Checks if a string is a valid Mongoose ObjectId.
 * @param id The string to check.
 * @returns True if it's a valid ObjectId format, false otherwise.
 */
export const isValidObjectId = (id: string): boolean => {
  // <-- DEFINED and EXPORTED
  if (!id) return false; // Handle null/undefined/empty string
  // Basic check: 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};
// --- End Utility Function ---

// --- Component Props Interface ---
export interface AjouterJoueurModalProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (formData: PlayerFormData, formDataObj: FormData) => Promise<void>;
  initialData?: PlayerFormData | null;
  isEditing: boolean;
  fields: PlayerFormField[];
  isLoading?: boolean;
}

// Add position options constant
const POSITION_OPTIONS = [
  { value: 'Goalkeeper', label: 'Goalkeeper' },
  { value: 'Defender', label: 'Defender' },
  { value: 'Midfielder', label: 'Midfielder' },
  { value: 'Attacker', label: 'Attacker' }
];

// Add availability status options
const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'willNotPlay', label: 'Will Not Play' },
  { value: 'uncertain', label: 'Uncertain' }
];

// --- The Modal Component ---
export const AjouterJoueurModal: React.FC<AjouterJoueurModalProps> = ({
  show,
  handleClose,
  handleSubmit,
  initialData,
  isEditing,
  fields,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PlayerFormData>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fetchedTeamName, setFetchedTeamName] = useState<string>("");
  const [fetchedTeamCode, setFetchedTeamCode] = useState<string>("");
  const [isFetchingTeam, setIsFetchingTeam] = useState<boolean>(false);
  const [teamFetchError, setTeamFetchError] = useState<string | null>(null);

  // Fetch teams when modal opens
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      setTeamError(null);
      try {
        const teamsData = await getAllTeams();
        if (teamsData && Array.isArray(teamsData)) {
          setTeams(teamsData);
        } else {
          setTeamError('No teams available');
          setTeams([]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeamError(error instanceof Error ? error.message : 'Failed to load teams');
        setTeams([]);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    if (show) {
      fetchTeams();
    }
  }, [show]);

  // Effect to initialize/reset form state
  useEffect(() => {
    setFormData(initialData || {});
    setFormErrors({});
    setFetchedTeamName("");
    setFetchedTeamCode("");
    setIsFetchingTeam(false);
    setTeamFetchError(null);

    if (
      isEditing &&
      initialData?.team_id &&
      isValidObjectId(initialData.team_id)
    ) {
      // <-- Uses local isValidObjectId
      handleTeamIdBlur(initialData.team_id);
    }
  }, [initialData, show, isEditing]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      setFormData(prev => ({ ...prev, logo: fileUrl }));
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
  
    if (type === 'file') {
      return; // File handling is done in handleFileChange
    }

    // Handle number inputs
    if (name === 'age' || name === 'number') {
      const numValue = value === '' ? '' : Number(value);
      if (value === '' || !isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Fetch team details for display
  const handleTeamIdBlur = async (teamIdValue?: string) => {
    const teamId = teamIdValue ?? formData.team_id;
    if (teamId && isValidObjectId(teamId)) {
      // <-- Uses local isValidObjectId
      setIsFetchingTeam(true);
      setTeamFetchError(null);
      setFetchedTeamName("");
      setFetchedTeamCode("");
      try {
        const team = await getTeamById(teamId);
        if (team) {
          setFetchedTeamName(team.name || "N/A");
          setFetchedTeamCode(team.code || "N/A");
        } else {
          setTeamFetchError("Team ID not found.");
        }
      } catch (err) {
        console.error("Failed to fetch team details:", err);
        setTeamFetchError("Error fetching team details.");
      } finally {
        setIsFetchingTeam(false);
      }
    } else if (teamId && teamId.trim() !== "") {
      setTeamFetchError("Invalid Team ID format.");
      setFetchedTeamName("");
      setFetchedTeamCode("");
      setIsFetchingTeam(false);
    } else {
      setTeamFetchError(null);
      setFetchedTeamName("");
      setFetchedTeamCode("");
      setIsFetchingTeam(false);
    }
  };

  // Update onSubmit to properly handle form data
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Create FormData object for file upload
    const formDataObj = new FormData();

    // Add the file if it exists
    if (selectedFile) {
      formDataObj.append('logo', selectedFile);
    }

    // Add all other form fields
    formDataObj.append('name', formData.name?.trim() || '');
    formDataObj.append('age', formData.age?.toString() || '');
    formDataObj.append('number', formData.number?.toString() || '');
    formDataObj.append('position', formData.position?.trim() || '');
    
    // Add team data in the correct structure
    const teamData = {
      _id: formData.team_id?.trim() || '',
      teamname: formData.team_name?.trim() || ''
    };
    // Send team as a separate field
    Object.entries(teamData).forEach(([key, value]) => {
      formDataObj.append(`team[${key}]`, value);
    });
    
    formDataObj.append('availabilityStatus', formData.availabilityStatus?.trim() || 'available');
    
    if (formData.availabilityReason) {
      formDataObj.append('availabilityReason', formData.availabilityReason.trim());
    }
    if (formData.value) {
      formDataObj.append('value', formData.value.trim());
    }
    if (formData.value_passionne) {
      formDataObj.append('value_passionne', formData.value_passionne.trim());
    }
    if (formData.height) {
      formDataObj.append('height', formData.height.trim());
    }

    // Create a properly formatted form data object for the handleSubmit function
    const formattedData: PlayerFormData = {
      name: formData.name?.trim() || '',
      age: formData.age?.toString() || '',
      number: formData.number?.toString() || '',
      position: formData.position?.trim() || '',
      team_id: formData.team_id?.trim() || '',
      availabilityStatus: formData.availabilityStatus?.trim() || 'available',
      ...(formData.availabilityReason && { availabilityReason: formData.availabilityReason.trim() }),
      ...(formData.value && { value: formData.value.trim() }),
      ...(formData.value_passionne && { value_passionne: formData.value_passionne.trim() }),
      ...(formData.height && { height: formData.height.trim() })
    };

    // Add team information if available
    const selectedTeam = teams.find(team => team._id === formData.team_id);
    if (selectedTeam) {
      formattedData.team_name = selectedTeam.name;
      formattedData.team_code = selectedTeam.code;
      formattedData.team_logo = selectedTeam.logo;
    }

    // Pass both the FormData and formatted data to handleSubmit
    await handleSubmit(formattedData, formDataObj);
  };

  // Update validateForm function
  const validateForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};

    // Required fields validation with proper empty checks
    const requiredFields = ['name', 'age', 'number', 'position', 'team_id', 'availabilityStatus'];
    requiredFields.forEach(field => {
      const value = formData[field as keyof PlayerFormData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    });

    // Number validation for age and number
    const age = formData.age ? Number(formData.age) : null;
    const number = formData.number ? Number(formData.number) : null;

    if (!formData.age || isNaN(age!)) {
      errors.age = 'Age must be a valid number.';
    } else if (age! < 15 || age! > 50) {
      errors.age = 'Age must be between 15 and 50.';
    }

    if (!formData.number || isNaN(number!)) {
      errors.number = 'Number must be a valid number.';
    } else if (number! < 1 || number! > 99) {
      errors.number = 'Number must be between 1 and 99.';
    }

    // Position validation
    if (!formData.position || formData.position.trim() === '') {
      errors.position = 'Position is required.';
    } else if (!POSITION_OPTIONS.some(opt => opt.value === formData.position)) {
      errors.position = 'Invalid position selected.';
    }

    // Team validation
    if (!formData.team_id || formData.team_id.trim() === '') {
      errors.team_id = 'Team is required.';
    } else if (!teams.some(team => team._id === formData.team_id)) {
      errors.team_id = 'Invalid team selected.';
    }

    // Availability status validation
    if (!formData.availabilityStatus || formData.availabilityStatus.trim() === '') {
      errors.availabilityStatus = 'Availability status is required.';
    } else if (!AVAILABILITY_OPTIONS.some(opt => opt.value === formData.availabilityStatus)) {
      errors.availabilityStatus = 'Invalid availability status selected.';
    }

    // Availability reason validation
    if (formData.availabilityStatus && 
        formData.availabilityStatus !== 'available' && 
        (!formData.availabilityReason || formData.availabilityReason.trim() === '')) {
      errors.availabilityReason = 'Reason is required when status is not Available.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showReasonField =
    formData["availabilityStatus"] &&
    formData["availabilityStatus"] !== "available";

  // --- Render the Modal ---
  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? "Modifier Joueur" : "Ajouter Joueur"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {fields.map((field) => {
            if (field.name === "availabilityReason" && !showReasonField)
              return null;
            if (field.name === "team_id") {
              return (
                <Form.Group className="mb-3" controlId={`form${field.name}`} key={field.name}>
                  <Form.Label>
                    {field.label}
                    {field.required && "*"}
                  </Form.Label>
                  {isLoadingTeams ? (
                    <div className="d-flex align-items-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Loading teams...</span>
                    </div>
                  ) : teamError ? (
                    <div className="text-danger">{teamError}</div>
                  ) : (
                    <Form.Select
                      name={field.name}
                      value={formData[field.name as keyof PlayerFormData] || ""}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors[field.name]}
                      disabled={isLoading}
                      aria-label="Select a team"
                      title="Select a team"
                    >
                      <option value="">Select a team</option>
                      {teams && teams.length > 0 ? (
                        teams.map((team) => (
                          <option key={team._id} value={team._id}>
                            {team.name} ({team.code})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No teams available</option>
                      )}
                    </Form.Select>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {formErrors[field.name]}
                  </Form.Control.Feedback>
                </Form.Group>
              );
            }
            if (field.name === "position") {
              return (
                <Form.Group
                  className="mb-3"
                  controlId={`form${field.name}`}
                  key={field.name}
                >
                  <Form.Label>
                    {field.label}
                    {field.required && "*"}
                  </Form.Label>
                  <Form.Select
                    name={field.name}
                    value={formData[field.name as keyof PlayerFormData] || ""}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors[field.name]}
                    disabled={isLoading || isLoadingTeams}
                    aria-label="Select player position"
                    title="Select player position"
                  >
                    <option value="">Select position</option>
                    {POSITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors[field.name]}
                  </Form.Control.Feedback>
                </Form.Group>
              );
            }
            if (field.name === "availabilityStatus") {
              return (
                <Form.Group
                  className="mb-3"
                  controlId={`form${field.name}`}
                  key={field.name}
                >
                  <Form.Label>
                    {field.label}
                    {field.required && "*"}
                  </Form.Label>
                  <Form.Select
                    name={field.name}
                    value={formData[field.name as keyof PlayerFormData] || ""}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors[field.name]}
                    disabled={isLoading || isLoadingTeams}
                    aria-label="Select availability status"
                    title="Select availability status"
                  >
                    <option value="">Select status</option>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors[field.name]}
                  </Form.Control.Feedback>
                </Form.Group>
              );
            }
            if (field.name === "logo") {
              return (
                <Form.Group
                  className="mb-3"
                  controlId={`form${field.name}`}
                  key={field.name}
                >
                  <Form.Label>
                    {field.label}
                    {field.required && "*"}
                  </Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      isInvalid={!!formErrors[field.name]}
                      disabled={isLoading || isLoadingTeams}
                      aria-label="Upload player photo"
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "50%"
                        }}
                      />
                    )}
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {formErrors[field.name]}
                  </Form.Control.Feedback>
                </Form.Group>
              );
            }
            return (
              <Form.Group
                className="mb-3"
                controlId={`form${field.name}`}
                key={field.name}
              >
                <Form.Label>
                  {field.label.toLowerCase() === "value"?"Initial value":field.label}
                  {field.required && "*"}
                </Form.Label>
                <Form.Control
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  value={formData[field.name as keyof PlayerFormData] || ""}
                  onChange={handleInputChange}
                  disabled={(field.label.toLowerCase() === "value")&& isEditing}
                  isInvalid={!!formErrors[field.name]}
                  // disabled={isLoading || isLoadingTeams}
                  min={field.type === "number" ? "0" : undefined}
                  aria-label={`Enter ${field.label.toLowerCase()}`}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors[field.name]}
                </Form.Control.Feedback>
              </Form.Group>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading || isLoadingTeams}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isLoadingTeams}
          >
            {isLoading ? (
              <>
                {" "}
                <Spinner size="sm" /> {isEditing ? "Saving..." : "Adding..."}{" "}
              </>
            ) : isEditing ? (
              "Enregistrer"
            ) : (
              "Ajouter Player"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
