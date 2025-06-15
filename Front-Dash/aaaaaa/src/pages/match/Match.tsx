import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Pagination from "react-bootstrap/Pagination";
import styled from "styled-components";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaEdit, FaSearch } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";

import {
  getAllFixtures,
  createFixture,
  updateFixture,
  deleteFixture,
  Fixture,
  CreateFixtureData,
  UpdateFixtureData,
} from "../../Store/matchStore";
import { useEquipeStore } from "../../Store/equipeStore";

const HeaderJoueur = styled.div`
  display: flex;
  justify-content: space-between;
  justify-items: center;
  align-items: center;
  margin-bottom: 1.2%;
  gap: 1rem;
`;

const   ButtonGroup = styled.div`

`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1; /* Allow search to take available space */
  max-width: 400px; /* Optional: Limit max width */

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    z-index: 2;
  }

  .form-control {
    padding-left: 2.5rem; /* Space for the icon */
    border-radius: 4px;
    border: 1px solid #ced4da;
    background-color: white;
    width: 100%;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  .pagination {
    margin-bottom: 0;
  }
`;

const LimitSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  select {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid #ced4da;
  }
`;

type FormFieldConfig = {
  name: keyof Fixture | `teamshome.name` | `teamsaway.name`;
  label: string;
  type: string;
  required?: boolean;
};

const formFields: FormFieldConfig[] = [
  { name: "referee", label: "Referee", type: "text" },
  { name: "round", label: "Round", type: "text", required: true },
  { name: "date", label: "Date", type: "datetime-local", required: true },
  { name: "stadename", label: "Stadium Name", type: "text", required: true },
  { name: "stadecity", label: "Stadium City", type: "text", required: true },
  { name: "statuslong", label: "Match Status", type: "select", required: true },
  {
    name: "teamshome",
    label: "Home Team",
    type: "select",
    required: true,
  },
  {
    name: "teamsaway",
    label: "Away Team",
    type: "select",
    required: true,
  },
];

type FormDataType = Partial<Fixture> & {
  teamshome?: string;
  teamsaway?: string;
};

interface MatchModalProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (formData: FormDataType) => Promise<void>;
  initialData?: FormDataType | null;
  isEditing: boolean;
  formFields: FormFieldConfig[];
  isLoading?: boolean;
}

const MatchModal: React.FC<MatchModalProps> = ({
  show,
  handleClose,
  handleSubmit,
  initialData,
  isEditing,
  formFields,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormDataType>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const { teams, fetchTeams } = useEquipeStore();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    setFormData(initialData || {});
    setFormErrors({});
  }, [initialData, show]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Update statusshort based on statuslong
      if (name === 'statuslong') {
        newData.statusshort = value === 'Not Started' ? 'NS' :
                             value === 'In Progress' ? 'IP' :
                             value === 'Finished' ? 'FT' :
                             value === 'Postponed' ? 'PST' :
                             value === 'Cancelled' ? 'CANC' : 'NS';
      }
      return newData;
    });
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};
    formFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name as keyof FormDataType];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors[field.name] = `${field.label} is required.`;
        }
      }
    });

    if (formData.date && isNaN(new Date(formData.date).getTime())) {
      errors.date = "Invalid date format.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await handleSubmit(formData);
    }
  };

  const getFieldValue = (fieldName: string): string | number => {
    return (formData[fieldName as keyof FormDataType] as string | number) || "";
  };

  const renderField = (field: FormFieldConfig) => {
    if (field.type === "select") {
      if (field.name === "teamshome" || field.name === "teamsaway") {
        return (
          <Form.Select
            name={field.name}
            value={getFieldValue(field.name)}
            onChange={handleInputChange}
            isInvalid={!!formErrors[field.name]}
            disabled={isLoading}
            aria-label={`Select ${field.label}`}
          >
            <option value="">Select {field.label}</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </Form.Select>
        );
      } else if (field.name === "statuslong") {
        return (
          <Form.Select
            name={field.name}
            value={getFieldValue(field.name)}
            onChange={handleInputChange}
            isInvalid={!!formErrors[field.name]}
            disabled={isLoading}
            aria-label={`Select ${field.label}`}
          >
            <option value="">Select {field.label}</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Finished">Finished</option>
            <option value="Postponed">Postponed</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
        );
      }
    }

    return (
      <Form.Control
        type={field.type}
        name={field.name}
        placeholder={`Enter ${field.label}`}
        value={getFieldValue(field.name)}
        onChange={handleInputChange}
        isInvalid={!!formErrors[field.name]}
        disabled={isLoading}
      />
    );
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? "Edit Match" : "Ajouter Match"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {formFields.map((field) => (
            <Form.Group
              className="mb-3"
              controlId={`form${field.name.replace(".", "_")}`}
              key={field.name}
            >
              <Form.Label>
                {field.label}
                {field.required && "*"}
              </Form.Label>
              {renderField(field)}
              <Form.Control.Feedback type="invalid">
                {formErrors[field.name]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                {isEditing ? "Saving..." : "Adding..."}
              </>
            ) : isEditing ? (
              "Enregistrer"
            ) : (
              "Ajouter "
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const Match: React.FC = () => {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFixtureId, setCurrentFixtureId] = useState<string | undefined>();
  const [currentPlayerData, setCurrentPlayerData] = useState<FormDataType | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requestParams = {
        page: currentPage,
        sortBy: 'date',
        sortOrder: 'desc' as const,
        search: searchTerm,
        ...(itemsPerPage > 0 && { limit: itemsPerPage })
      };

      const response = await getAllFixtures(requestParams);
      
      // Handle the new response format
      setFixtures(response.data || []);
      
      // Update pagination and limit from API response
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalItems(response.pagination.total);
        setCurrentPage(response.pagination.page);
        setItemsPerPage(response.pagination.limit); // Update itemsPerPage from API
      }
    } catch (err) {
      setError(
        "Failed to fetch matches. Please check the connection or try again later."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleShowAdd = () => {
    setIsEditing(false);
    setCurrentPlayerData({});
    setShowModal(true);
  };

  const handleShowEdit = (fixture: Fixture) => {
    if (!fixture._id) {
      console.error("Cannot edit fixture without _id:", fixture);
      setError("Cannot edit fixture: Missing ID.");
      return;
    }
    setIsEditing(true);
    setCurrentFixtureId(fixture._id);

    const formDataForEdit: FormDataType = {
      ...fixture,
      teamshome: fixture.teamshome?._id,
      teamsaway: fixture.teamsaway?._id,
      date: fixture.date
        ? new Date(
            new Date(fixture.date).getTime() -
              new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16)
        : "",
    };
    setCurrentPlayerData(formDataForEdit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPlayerData(null);
    setCurrentFixtureId(undefined);
  };

  const mapFormDataToBackend = (
    formData: FormDataType
  ): CreateFixtureData | UpdateFixtureData => {
    const mappedData: Partial<Fixture> = {
      referee: formData.referee,
      round: formData.round,
      date: formData.date ? new Date(formData.date).toISOString() : undefined,
      stadename: formData.stadename,
      stadecity: formData.stadecity,
      statuslong: formData.statuslong,
      statusshort: formData.statusshort,
      teamshome: {
        _id: formData.teamshome,
      },
      teamsaway: {
        _id: formData.teamsaway,
      },
    };

    Object.keys(mappedData).forEach((key) => {
      if (mappedData[key as keyof typeof mappedData] === undefined) {
        delete mappedData[key as keyof typeof mappedData];
      }
    });

    return mappedData as CreateFixtureData | UpdateFixtureData;
  };

  const handleModalSubmit = async (formData: FormDataType) => {
    setError(null);
    setIsSubmitting(true);
    const backendData = mapFormDataToBackend(formData);

    try {
      if (isEditing) {
        if (!currentFixtureId)
          throw new Error("No fixture selected for editing.");
        await updateFixture(
          currentFixtureId,
          backendData as UpdateFixtureData
        );
        setToastMessage("Match updated successfully!");
      } else {
        await createFixture(backendData as CreateFixtureData);
        setToastMessage("Match added successfully!");
      }
      setShowToast(true);
      handleCloseModal();
      fetchFixtures();
    } catch (err: unknown) {
      console.error(`Failed to ${isEditing ? "update" : "add"} match:`, err);
      const errorMsg =
        err instanceof Error ? err.message :
        typeof err === 'object' && err !== null && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data ? 
        String(err.response.data.error) :
        `Failed to ${isEditing ? "update" : "add"} match.`;
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowDelete = (fixtureId: string | undefined) => {
    if (fixtureId) {
      setCurrentFixtureId(fixtureId);
      setShowDeleteModal(true);
    } else {
      console.error("Cannot delete: Fixture ID is undefined.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentFixtureId) return;
    setError(null);
    try {
      await deleteFixture(currentFixtureId);
      setToastMessage("Match deleted successfully!");
      setShowToast(true);
      setShowDeleteModal(false);
      setCurrentFixtureId(undefined);
      fetchFixtures();
    } catch (err: unknown) {
      console.error("Failed to delete match:", err);
      const errorMsg =
        err instanceof Error ? err.message :
        typeof err === 'object' && err !== null && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data ? 
        String(err.response.data.error) :
        "Failed to delete match.";
      setError(errorMsg);
      setShowDeleteModal(false);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const tableHeaders = useMemo(
    () => [
      "Referee",
      "Round",
      "Date",
      "Stadium Name",
      "Stadium City",
      "Home Team",
      "Away Team",
      "Status",
      "Status Short",
      // "HG HT",
      // "HG FT",
      // "AG HT",
      // "AG FT",
      "Action",
    ],
    []
  );

  return (
    <>
      <HeaderJoueur>
        <h2>Gestion Des Matchs</h2>
        <SearchContainer>
          <FaSearch className="search-icon" />
          <Form.Control
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </SearchContainer>
        <ButtonGroup>
          <Button
            variant="outline-success"
            className="rounded-pill px-4 py-2 d-flex align-items-center"
            style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
            onClick={handleShowAdd}
          >
            <MdAdd size={22} className="me-2" />
            <span className="fw-semibold">Ajouter Match</span>
          </Button>
        </ButtonGroup>
      </HeaderJoueur>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1060 }}
      >
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

      <div style={{ overflowX: "auto", width: "100%", cursor: "pointer" }}>
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              {tableHeaders.map((hdr) => (
                <th key={hdr}>{hdr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : fixtures.length === 0 && !error ? (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center">
                  {searchTerm
                    ? "No matches found for your search."
                    : "No matches found."}
                </td>
              </tr>
            ) : (
              fixtures.map((fixture: Fixture) => (
                <tr key={fixture._id}>
                  <td>{fixture.referee || "-"}</td>
                  <td>{fixture.round}</td>
                  <td>
                    {fixture.date
                      ? new Date(fixture.date).toLocaleString()
                      : "-"}
                  </td>
                  <td>{fixture.stadename}</td>
                  <td>{fixture.stadecity}</td>
                  <td>{fixture.teamshome?.name || "-"}</td>
                  <td>{fixture.teamsaway?.name || "-"}</td>
                  <td>{fixture.statuslong || "-"}</td>
                  <td>{fixture.statusshort || "-"}</td>
                  <td>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      title="Voir"
                      onClick={() => navigate(`/match/${fixture._id}`)}
                    >
                      <IoEyeSharp />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEdit(fixture)}
                      title="Edit Match"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleShowDelete(fixture._id)}
                      title="Delete Match"
                    >
                      <MdDelete />
                    </Button>
                  </td>
                </tr>
              ))
            )}
            {!loading && error && fixtures.length === 0 && (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="text-center text-danger"
                >
                  Error loading data. {error}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {totalItems > 0 && (
        <PaginationContainer>
          <Pagination>
            <Pagination.First
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => paginate(number)}
                >
                  {number}
                </Pagination.Item>
              )
            )}

            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>

          <LimitSelector>
            <span>Items per page:</span>
            <Form.Select
              value={itemsPerPage}
              onChange={handleLimitChange}
              size="sm"
              style={{ width: 'auto' }}
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </Form.Select>
          </LimitSelector>
        </PaginationContainer>
      )}

      {showModal && (
        <MatchModal
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleModalSubmit}
          initialData={currentPlayerData}
          isEditing={isEditing}
          formFields={formFields}
          isLoading={isSubmitting}
        />
      )}

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this Match?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Match;
