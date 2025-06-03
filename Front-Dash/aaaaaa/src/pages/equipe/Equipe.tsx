import React, { useEffect, useState } from "react";
import styled from "styled-components";
import EquipeModal from "./EquipeModal.tsx";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaEdit, FaSearch } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import UpdateEquipe from "./UpdateEquipe.tsx";
import {
  Button,
  Table,
  Form,
  Pagination as BootstrapPagination,
} from "react-bootstrap";
import { useEquipeStore } from '../../Store/equipeStore';
import { IoEyeSharp } from "react-icons/io5";
import ViewEquipe from "./ViewEquipe.tsx";


interface EntAdjoints {
  entadj1: string;
  entadj2: string;
}
interface Staf {
  entprincipal: string;
  entadjoints: EntAdjoints;
  manager: string;
  entgardien: string;
  prepphysique: string;
  analystedonnes: string;
  kine: string;
  kineadjoint: string;
  medecins: { medc1: string; medc2: string };
  administration: { president: string; vicepresident: string };
  recruteurs: { recr1: string; recr2: string };
}

interface FormData {
  id: string; 
  _id?: string; 
  name: string;
  code: string;
  country: string;
  city: string;
  founded: string;
  logo: string | File;
  group: string;
  createdAt: string;
  staf: Staf;
}

const HeaderMatch = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; // Align items vertically
  margin-bottom: 1%;
  gap: 1rem; 
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1; 
  max-width: 400px; 

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    z-index: 2;
  }

  .form-control {
    padding-left: 2.5rem; // Space for the icon
    border-radius: 4px;
    border: 1px solid #ced4da;
    background-color: white;
    width: 100%;
  }
`;


const PaginationContainer = styled.div`
  display: flex;
  justify-content: center; // Center pagination controls
  margin-top: 1.5rem;
`;

const Equipe: React.FC = () => {
  const { teams, loading, error, fetchTeams, addTeam, updateTeam, deleteTeam, searchTeams } = useEquipeStore();
  
  // State for modals and UI
  const [show, setShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; message: string }>({ 
    type: 'success', 
    message: '' 
  });
  const [selectedTeam, setSelectedTeam] = useState<FormData | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    id: "",
    name: "",
    code: "",
    country: "",
    city: "",
    founded: "",
    logo: "",
    group: "",
    createdAt: "",
    staf: {
      entprincipal: "",
      entadjoints: { entadj1: "", entadj2: "" },
      manager: "",
      entgardien: "",
      prepphysique: "",
      analystedonnes: "",
      kine: "",
      kineadjoint: "",
      medecins: { medc1: "", medc2: "" },
      administration: { president: "", vicepresident: "" },
      recruteurs: { recr1: "", recr2: "" },
    },
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [updateFormErrors, setUpdateFormErrors] = useState<{ [key: string]: string }>({});
  const [updateGeneralError, setUpdateGeneralError] = useState<string | undefined>(undefined);

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleShow = () => {
    setFormData({
      id: "",
      name: "",
      code: "",
      country: "",
      city: "",
      founded: "",
      logo: "",
      group: "",
      createdAt: "",
      staf: {
        entprincipal: "",
        entadjoints: { entadj1: "", entadj2: "" },
        manager: "",
        entgardien: "",
        prepphysique: "",
        analystedonnes: "",
        kine: "",
        kineadjoint: "",
        medecins: { medc1: "", medc2: "" },
        administration: { president: "", vicepresident: "" },
        recruteurs: { recr1: "", recr2: "" },
      },
    });
    setFormErrors({});
    setShow(true);
  };

  const handleClose = () => setShow(false);

  // Handle change function (Keep for modals)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'logo' && files && files[0]) {
      setFormData(prev => ({
        ...prev,
        logo: files[0]
      }));
    } else {
      const keys = name.split(".");
      setFormData((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const updateNested = (
          obj: Record<string, unknown>,
          keyPath: string[],
          newValue: string
        ): void => {
          for (let i = 0; i < keyPath.length - 1; i++) {
            if (!obj[keyPath[i]]) {
              obj[keyPath[i]] = {};
            }
            obj = obj[keyPath[i]] as Record<string, unknown>;
          }
          obj[keyPath[keyPath.length - 1]] = newValue;
        };
        updateNested(updated, keys, value);
        return updated;
      });
    }

    // Clear errors for the field being changed
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setUpdateFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setUpdateGeneralError(undefined);
  };

  // Validate form function (Keep for modals)
  const validateForm = (dataToValidate: FormData) => {
    const errors: { [key: string]: string } = {};
    
    // Required fields validation
    const requiredFields = [
      "name",
      "code",
      "country",
      "city",
      "founded",
      "logo",
      "group",
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
      "staf.recruteurs.recr2"
    ];

    const getNestedValue = (obj: FormData, keyPath: string[]) => {
      let current: unknown = obj;
      for (const key of keyPath) {
        if (current && typeof current === "object" && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
      return current;
    };

    requiredFields.forEach((field) => {
      const value = getNestedValue(dataToValidate, field.split("."));
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors[field] = "Ce champ est requis.";
      }
    });

    if (dataToValidate.founded && isNaN(Number(dataToValidate.founded))) {
      errors.founded = "Founded year must be a number.";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const uploadData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'staf') {
          // Handle nested staf object
          Object.entries(value).forEach(([stafKey, stafValue]) => {
            if (typeof stafValue === 'object') {
              Object.entries(stafValue).forEach(([nestedKey, nestedValue]) => {
                uploadData.append(`staf.${stafKey}.${nestedKey}`, nestedValue as string);
              });
            } else {
              uploadData.append(`staf.${stafKey}`, stafValue as string);
            }
          });
        } else if (key === 'logo' && value instanceof File) {
          uploadData.append('logo', value);
        } else if (key !== 'id' && key !== '_id') {
          uploadData.append(key, value as string);
        }
      });

      await addTeam(uploadData);
      setToastMessage({ type: 'success', message: 'Team added successfully!' });
      setShowToast(true);
      handleClose();
      setFormErrors({});
    } catch (error) {
      console.error('Error adding team:', error);
      setToastMessage({ type: 'danger', message: 'Failed to add team. Please try again.' });
      setShowToast(true);
    }
  };

  const handleUpdateSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setUpdateFormErrors(errors);
      setUpdateGeneralError("Please fill in all required fields.");
      return;
    }

    if (!selectedTeamId) {
      setUpdateGeneralError("No team selected for update.");
      return;
    }

    try {
      const uploadData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'staf') {
          // Handle nested staf object
          Object.entries(value).forEach(([stafKey, stafValue]) => {
            if (typeof stafValue === 'object') {
              Object.entries(stafValue).forEach(([nestedKey, nestedValue]) => {
                uploadData.append(`staf.${stafKey}.${nestedKey}`, nestedValue as string);
              });
            } else {
              uploadData.append(`staf.${stafKey}`, stafValue as string);
            }
          });
        } else if (key === 'logo' && value instanceof File) {
          uploadData.append('logo', value);
        } else if (key !== 'id' && key !== '_id') {
          uploadData.append(key, value as string);
        }
      });

      await updateTeam(selectedTeamId, uploadData);
      setToastMessage({ type: 'success', message: 'Team updated successfully!' });
      setShowToast(true);
      setShowUpdateModal(false);
      setSelectedTeamId(null);
      // Refresh the teams list
      await fetchTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      setToastMessage({ type: 'danger', message: 'Failed to update team. Please try again.' });
      setShowToast(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeamId) return;

    try {
      await deleteTeam(selectedTeamId);
      setToastMessage({ type: 'success', message: 'Team deleted successfully!' });
      setShowToast(true);
      setShowDeleteModal(false);
      setSelectedTeamId(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      setToastMessage({ type: 'danger', message: 'Failed to delete team. Please try again.' });
      setShowToast(true);
    }
  };

  // Filter teams based on search term
  const filteredTeams = searchTeams(searchTerm);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const currentTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Render pagination items (Kept)
  const renderPaginationItems = () => {
    const items = [];
    // Don't render pagination if there's only one page or no pages at all
    if (totalPages <= 1) {
      // If there are items but only one page, don't show pagination
      if (filteredTeams.length > 0 && totalPages === 1) return null;
      // If no items, don't show pagination
      if (filteredTeams.length === 0) return null;
    }

    // Add Previous button
    items.push(
      <BootstrapPagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Render page numbers (a simplified approach, consider a more robust one for many pages)
    const maxPageButtons = 5; // Number of page buttons to show (excluding prev/next)
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust startPage if we are at the end of total pages
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    // Re-adjust endPage in case startPage adjustment pushed it below 1
    endPage = Math.max(startPage + maxPageButtons - 1, endPage);
    endPage = Math.min(totalPages, endPage);

    if (startPage > 1) {
      items.push(
        <BootstrapPagination.First
          key="first"
          onClick={() => handlePageChange(1)}
        />
      );
      if (startPage > 2) {
        items.push(
          <BootstrapPagination.Ellipsis key="ellipsis-start" disabled />
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i > totalPages) break; // Prevent rendering page numbers beyond total pages
      items.push(
        <BootstrapPagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </BootstrapPagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <BootstrapPagination.Ellipsis key="ellipsis-end" disabled />
        );
      }
      items.push(
        <BootstrapPagination.Last
          key="last"
          onClick={() => handlePageChange(totalPages)}
        />
      );
    }

    // Add Next button
    items.push(
      <BootstrapPagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      />
    );

    return items;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <HeaderMatch>
        <h2>Gestion Des Equipes</h2>
        <SearchContainer>
          <FaSearch className="search-icon" />
          <Form.Control
            type="text"
            placeholder="Rechercher une équipe..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <Button
          variant="outline-success"
          className="rounded-pill px-4 py-2 d-flex align-items-center"
          style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
          onClick={handleShow}
        >
          <MdAdd size={22} className="me-2" />
          <span className="fw-semibold">Ajouter Equipe</span>
        </Button>
      </HeaderMatch>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1060 }}
      >
        <Toast
          bg={toastMessage.type}
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">
              {toastMessage.type === "success" ? "Success" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <EquipeModal
        show={show}
        handleClose={handleClose}
        formErrors={formErrors}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        formData={formData}
      />

      <div style={{ width: "100%", overflowX: "hidden" }}>
        <div style={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Country</th>
                <th>City</th>
                <th>Founded</th>
                <th>Logo</th>
                <th>Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTeams.length > 0 ? (
                currentTeams.map((team) => (
                  <tr key={team._id || team.id}>
                    <td>{team.name}</td>
                    <td>{team.code}</td>
                    <td>{team.country}</td>
                    <td>{team.city}</td>
                    <td>{team.founded}</td>
                    <td>
                      <img
                        src={team.logo}
                        alt={team.name}
                        width="40"
                        style={{ height: "auto" }}
                      />
                    </td>
                    <td>{team.group}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-3"
                        onClick={() => {
                          const teamId = team._id || team.id;
                          if (teamId) {
                            setSelectedTeamId(teamId);
                            setFormData(team);
                            setShowUpdateModal(true);
                            setUpdateFormErrors({});
                            setUpdateGeneralError(undefined);
                          }
                        }}
                        title="Modifier"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-3"
                        onClick={() => {
                          const teamId = team._id || team.id;
                          if (teamId) {
                            setSelectedTeamId(teamId);
                            setShowDeleteModal(true);
                          }
                        }}
                        title="Supprimer"
                      >
                        <MdDelete />
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        title="Voir"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowViewModal(true);
                        }}
                      >
                        <IoEyeSharp />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    {searchTerm
                      ? "Aucune équipe trouvée correspondant à votre recherche."
                      : "Aucune équipe disponible."}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <PaginationContainer>
        <BootstrapPagination>{renderPaginationItems()}</BootstrapPagination>
      </PaginationContainer>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cette équipe ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Non
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Oui, supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {showUpdateModal && selectedTeamId && (
        <UpdateEquipe
          show={showUpdateModal}
          handleClose={() => {
            setShowUpdateModal(false);
            setSelectedTeamId(null);
            setFormData({
              id: "",
              name: "",
              code: "",
              country: "",
              city: "",
              founded: "",
              logo: "",
              group: "",
              createdAt: "",
              staf: {
                entprincipal: "",
                entadjoints: { entadj1: "", entadj2: "" },
                manager: "",
                entgardien: "",
                prepphysique: "",
                analystedonnes: "",
                kine: "",
                kineadjoint: "",
                medecins: { medc1: "", medc2: "" },
                administration: { president: "", vicepresident: "" },
                recruteurs: { recr1: "", recr2: "" },
              },
            });
            setUpdateFormErrors({});
            setUpdateGeneralError(undefined);
          }}
          handleChange={handleChange}
          handleSubmit={handleUpdateSubmit}
          formErrors={updateFormErrors}
          formData={formData}
          generalError={updateGeneralError}
        />
      )}

      {selectedTeam && (
        <ViewEquipe
          show={showViewModal}
          handleClose={() => {
            setShowViewModal(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
        />
      )}
    </>
  );
};

export default Equipe;
