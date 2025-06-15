// src/components/Joueur/Joueur.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
// --- React Bootstrap Imports ---
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import styled from "styled-components";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaEdit, FaSearch } from "react-icons/fa"; // Import FaSearch for search input
import { Pagination as BootstrapPagination } from "react-bootstrap"; // Import Pagination
import axios from "axios";
import { debounce } from "lodash";

// --- Store Import ---
import {
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  Player,
  CreatePlayerData,
  UpdatePlayerData,
  API_BASE_URL,
} from "../../Store/joueurStore"; // Adjust path to your store file

// --- Import Modal Component AND Utility Function from the modal file ---
import { AjouterJoueurModal, isValidObjectId } from "../joueur/AjouterJouer"; // <-- IMPORT BOTH NOW

// --- Styled Components ---
const HeaderJoueur = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5%;
  gap: 1rem; /* Add gap for search */
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
  justify-content: center; /* Center pagination controls */
  margin-top: 1.5rem;
`;

// --- Shared Type Definitions (Exported) ---
export type PlayerFormField = {
  // <-- EXPORT
  name: keyof Player | "team_id" | "availabilityReason";
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};
export type PlayerFormData = {
  // <-- EXPORT
  [key in keyof Omit<
    Player,
    "team" | "points" | "_id" | "age" | "number" | "value_passionne"
  >]?: string;
} & {
  team_id?: string;
  team_name?: string;
  team_code?: string;
  team_logo?: string;
  age?: string;
  number?: string;
  value_passionne?: string;
  availabilityReason?: string;
};
// --- End Shared Types ---

// --- Form Structure Definition ---
const formFields: PlayerFormField[] = [
  {
    name: "team_id",
    label: "Team ID (_id)",
    type: "text",
    required: true,
    placeholder: "Enter the Mongoose _id of the team",
  },
  { name: "name", label: "Name", type: "text", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  { name: "number", label: "Number", type: "number", required: true },
  { name: "position", label: "Position", type: "text", required: true },
  {
    name: "logo",
    label: "Player Logo URL",
    type: "text",
    placeholder: "URL to player photo",
  },
  { name: "value", label: "Value", type: "text" },
  { name: "value_passionne", label: "Value Passionne", type: "number" },
  { name: "height", label: "Height", type: "text" },
  {
    name: "availabilityStatus",
    label: "Availability Status",
    type: "select",
    required: true,
    options: [
      { value: "available", label: "Available" },
      { value: "willNotPlay", label: "Will Not Play" },
      { value: "uncertain", label: "Uncertain" },
    ],
  },
  {
    name: "availabilityReason",
    label: "Reason (if not available)",
    type: "text",
  },
];

// Add PlayerResponse type
interface PlayerResponse {
  data: Player[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// --- Main Joueur Component ---
const Joueur: React.FC = () => {
  // State...
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayerData, setCurrentPlayerData] = useState<PlayerFormData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Operation successful!");

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Data Fetching...
  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${API_BASE_URL}?${queryParams}`);
      console.log('Fetched players:', response.data);
      
      if (response.data.status === "success") {
        setPlayers(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
        setItemsPerPage(response.data.pagination.limit);
      } else {
        throw new Error(response.data.error || 'Failed to fetch players');
      }
    } catch (err) {
      console.error('Error in fetchPlayers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Update the handleLimitChange function
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  // Update the handlePageChange function
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Update the search handler to debounce the search
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page when searching
    }, 500),
    []
  );

  // --- Mapping and FINAL Validation Function ---
  const mapFormDataToBackend = useCallback(
    (formData: PlayerFormData): CreatePlayerData | UpdatePlayerData => {
      const errors: string[] = [];
      
      // Validation checks
      if (!formData.name?.trim()) errors.push("Name is required.");
      if (!formData.age) errors.push("Age is required.");
      if (!formData.number) errors.push("Number is required.");
      if (!formData.position?.trim()) errors.push("Position is required.");
      if (!formData.team_id?.trim()) {
        errors.push("Team ID is required.");
      } else if (!isValidObjectId(formData.team_id)) {
        errors.push("Team ID has an invalid format.");
      }
      if (!formData.availabilityStatus) errors.push("Availability Status is required.");
      
      const age = parseInt(formData.age || "", 10);
      const number = parseInt(formData.number || "", 10);
      const value_passionne = formData.value_passionne
        ? parseInt(formData.value_passionne, 10)
        : undefined;
        
      if (isNaN(age)) errors.push("Age must be a valid number.");
      if (isNaN(number)) errors.push("Number must be a valid number.");
      if (formData.value_passionne && isNaN(value_passionne!)) {
        errors.push("Value Passionne must be a valid number if provided.");
      }
      
      if (
        formData.availabilityStatus &&
        formData.availabilityStatus !== "available" &&
        (!formData.availabilityReason || formData.availabilityReason.trim() === "")
      ) {
        errors.push("Reason is required when status is not 'Available'.");
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(" ")}`);
      }

      // Map form data to backend structure
      const mapped: CreatePlayerData = {
        name: formData.name!.trim(),
        age: age,
        number: number,
        position: formData.position!.trim(),
        team: { 
          _id: formData.team_id!,
          teamname: formData.team_name || ""
        },
        availabilityStatus: formData.availabilityStatus as Player["availabilityStatus"],
        ...(formData.logo?.trim() && { logo: formData.logo.trim() }),
        ...(formData.value?.trim() && { value: formData.value.trim() }),
        ...(value_passionne !== undefined && { value_passionne }),
        ...(formData.height?.trim() && { height: formData.height.trim() }),
        ...(formData.availabilityStatus !== "available" &&
          formData.availabilityReason?.trim() && {
            availabilityReason: formData.availabilityReason.trim(),
          }),
      };

      if (mapped.availabilityStatus === "available") {
        delete mapped.availabilityReason;
      }

      return mapped;
    },
    []
  );

  // Map Backend to Form Data... (remains the same)
  const mapPlayerToFormData = useCallback((player: Player): PlayerFormData => {
    return {
      team_id: player.team?._id || "",
      name: player.name || "",
      age: String(player.age ?? ""),
      number: String(player.number ?? ""),
      position: player.position || "",
      logo: player.logo || "",
      value: player.value || "",
      value_passionne: String(player.value_passionne ?? ""),
      height: player.height || "",
      availabilityStatus: player.availabilityStatus || "available",
      availabilityReason: player.availabilityReason || "",
    };
  }, []);

  // Modal Control Handlers... (remains the same)
  const handleShowAdd = () => {
    setIsEditing(false);
    // Reset form data for adding
    setCurrentPlayerData({
      team_id: "",
      name: "",
      age: "",
      number: "",
      position: "",
      logo: "",
      value: "",
      value_passionne: "",
      height: "",
      availabilityStatus: "available",
      availabilityReason: "",
    });
    setShowModal(true);
    setError(null); // Clear main page error
  };

  const handleShowEdit = (player: Player) => {
    if (!player._id) return;
    setIsEditing(true);
    setSelectedPlayerId(player._id);
    setCurrentPlayerData(mapPlayerToFormData(player));
    setShowModal(true);
    setError(null); // Clear main page error
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPlayerData(null);
    setSelectedPlayerId(null);
    // Error is handled within the modal, no need to clear main page error here usually
  };

  // Add/Edit Submission Handler...
  const handleModalSubmit = useCallback(
    async (formData: PlayerFormData, formDataObj?: FormData) => {
      setError(null);
      setIsSubmitting(true);
      try {
        const backendData = mapFormDataToBackend(formData);
        if (isEditing) {
          if (!selectedPlayerId) throw new Error("No player selected for editing.");
          await updatePlayer(selectedPlayerId, backendData as UpdatePlayerData);
          setToastMessage("Player updated successfully!");
        } else {
          // If we have FormData (for file upload), use it
          if (formDataObj) {
            const response = await axios.post(API_BASE_URL, formDataObj, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            if (response.data.status === "success") {
              setToastMessage("Player added successfully!");
            } else {
              throw new Error(response.data.message || "Failed to add player");
            }
          } else {
            // Fallback to regular JSON data if no file
          await createPlayer(backendData as CreatePlayerData);
          setToastMessage("Player added successfully!");
          }
        }
        setShowToast(true);
        handleCloseModal();
        fetchPlayers();
      } catch (err) {
        console.error(`Failed to ${isEditing ? "update" : "add"} player:`, err);
        const errorMsg = err instanceof Error ? err.message : "Operation failed.";
        alert(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditing, selectedPlayerId, mapFormDataToBackend, fetchPlayers]
  );

  // Delete Handlers...
  const handleShowDelete = (playerId: string | undefined) => {
    if (playerId) {
      setSelectedPlayerId(playerId);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedPlayerId) return;
    setError(null);
    try {
      await deletePlayer(selectedPlayerId);
      setToastMessage("Player deleted successfully!");
      setShowToast(true);

      setPlayers((prevPlayers) => {
        const remainingPlayers = prevPlayers.filter(
          (p) => p._id !== selectedPlayerId
        );

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const remainingFilteredPlayers = remainingPlayers.filter((player) => {
          return (
            player.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
            player.team?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
            player.team?.code?.toLowerCase().includes(lowerCaseSearchTerm) ||
            player.position?.toLowerCase().includes(lowerCaseSearchTerm) ||
            String(player.age ?? "").includes(lowerCaseSearchTerm) ||
            String(player.number ?? "").includes(lowerCaseSearchTerm)
          );
        });

        const totalItemsAfterDelete = remainingFilteredPlayers.length;
        const totalPagesAfterDelete = Math.ceil(
          totalItemsAfterDelete / itemsPerPage
        );

        if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
          setCurrentPage(totalPagesAfterDelete);
        } else if (totalPagesAfterDelete === 0) {
          setCurrentPage(1);
        }

        return remainingPlayers;
      });
    } catch (err) {
      console.error("Failed to delete player:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to delete player.";
      setError(errorMsg);
    } finally {
      setShowDeleteModal(false);
      setSelectedPlayerId(null);
    }
  }, [selectedPlayerId, searchTerm, currentPage, itemsPerPage]);

  // Remove the filteredPlayers memo since filtering is now handled by the backend
  const currentPlayers = useMemo(() => {
    return players;
  }, [players]);

  // Table Headers... (remains the same)
  const tableHeaders = useMemo(
    () => [
      "Team Name",
      "Team Code",
      "Player Name",
      "Age",
      "Number",
      "Position",
      "Player Logo",
      "Value",
      "Value Passionne",
      "Height",
      "Availability",
      "Action",
    ],
    []
  );

  // Render pagination items (similar to Equipe component, includes ellipsis for many pages)
  const renderPaginationItems = () => {
    if (totalPages <= 1) {
      return null;
    }

    const items = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust startPage if we are at the end of total pages to maintain button count
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // Previous button
    items.push(
      <BootstrapPagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // First page and ellipsis
    if (startPage > 1) {
      items.push(
        <BootstrapPagination.Item key={1} onClick={() => handlePageChange(1)} />
      );
      if (startPage > 2) {
        items.push(
          <BootstrapPagination.Ellipsis key="ellipsis-start" disabled />
        );
      }
    }

    // Page number items
    for (let i = startPage; i <= endPage; i++) {
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

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <BootstrapPagination.Ellipsis key="ellipsis-end" disabled />
        );
      }
      items.push(
        <BootstrapPagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        />
      );
    }

    // Next button
    items.push(
      <BootstrapPagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  // --- Render Main Component ---
  return (
    <div>
      {/* Header */}
      <HeaderJoueur>
        <h2>Gestion Des Joueurs</h2>

        {/* Search Input */}
        <SearchContainer>
          <FaSearch className="search-icon" />
          <Form.Control
            type="text"
            placeholder="Rechercher un joueur..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </SearchContainer>
        <Button
          variant="outline-success"
          className="rounded-pill px-4 py-2 d-flex align-items-center"
          style={{ boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)" }}
          onClick={handleShowAdd}
        >
          <MdAdd size={22} className="me-2" />
          <span className="fw-semibold">Ajouter Joueur</span>
        </Button>
      </HeaderJoueur>
      {/* Main Page Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {/* Success Toast Notification */}
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
      {/* Add limit selector */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <span className="me-2">Items per page:</span>
          <Form.Select
            value={itemsPerPage}
            onChange={handleLimitChange}
            size="sm"
            style={{ width: 'auto' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Form.Select>
        </div>
        <div>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
        </div>
      </div>
      {/* Player Data Table */}
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
            {isLoading ? (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="text-center text-danger"
                >
                  {error}
                </td>
              </tr>
            ) : currentPlayers.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center">
                  {searchTerm
                    ? "Aucun joueur trouvé correspondant à votre recherche."
                    : "Aucun joueur disponible."}
                </td>
              </tr>
            ) : (
              // Map over CURRENT players for the page
              currentPlayers.map((player) => (
                <tr key={player._id}>
                  <td>{player.team?.name || "-"}</td>
                  <td>{player.team?.code || "-"}</td>
                  <td>{player.name}</td>
                  <td>{player.age}</td>
                  <td>{player.number}</td>
                  <td>{player.position}</td>
                  <td>
                    {player.logo ? (
                      <img
                        src={player.logo}
                        alt={player.name}
                        style={{
                          width: "40px",
                          height: "auto",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{player.value || "-"}</td>
                  <td>{player.value_passionne ?? "-"}</td>
                  <td>{player.height || "-"}</td>
                  <td>{player.availabilityStatus || "-"}</td>
                  <td>
                    {" "}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEdit(player)}
                      title="Edit Player"
                    >
                      <FaEdit />
                    </Button>{" "}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleShowDelete(player._id)}
                      title="Delete Player"
                    >
                      <MdDelete />
                    </Button>{" "}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Update pagination controls */}
      {totalPages > 0 && (
        <PaginationContainer>
          <BootstrapPagination>
            <BootstrapPagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <BootstrapPagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <BootstrapPagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </BootstrapPagination.Item>
              );
            })}

            <BootstrapPagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <BootstrapPagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </BootstrapPagination>
        </PaginationContainer>
      )}

      {/* Render Add/Edit Modal using the imported component */}
      {showModal && (
        <AjouterJoueurModal // <-- Use the imported component name
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleModalSubmit} // Pass Joueur's submit handler
          initialData={currentPlayerData}
          isEditing={isEditing}
          fields={formFields} // Pass the fields definition
          isLoading={isSubmitting} // Pass the submission loading state
          // You might need to pass an error state down to the modal if it handles displaying errors
          // modalError={modalError} // Example
        />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this player?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              No
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Yes, Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Joueur;
