import React from "react";
import { Modal, Button } from "react-bootstrap";
import styled from "styled-components";
import { FaUserTie, FaUserMd, FaBuilding, FaSearch, FaTimes } from "react-icons/fa";

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 15px;
    border: none;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  .modal-header {
    background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
    color: white;
    border-radius: 15px 15px 0 0;
    border: none;
    padding: 1.5rem;
  }

  .modal-title {
    font-weight: 600;
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-footer {
    border-top: 1px solid #eee;
    padding: 1rem 2rem;
  }
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  h5 {
    color: #1a237e;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
  }

  .label {
    font-weight: 500;
    color: #455a64;
    min-width: 200px;
  }

  .value {
    color: #333;
    flex: 1;
  }
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const TeamLogo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
  background: white;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const TeamInfo = styled.div`
  h3 {
    color: #1a237e;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }

  .team-details {
    display: flex;
    gap: 1.5rem;
    color: #666;
    font-size: 0.9rem;
  }
`;

const CloseButton = styled(Button)`
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

interface Props {
  show: boolean;
  handleClose: () => void;
  team: {
    name: string;
    code: string;
    country: string;
    city: string;
    founded: string;
    logo: string;
    group: string;
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

const ViewEquipe: React.FC<Props> = ({ show, handleClose, team }) => {
  return (
    <StyledModal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header>
        <Modal.Title>Team Details</Modal.Title>
        <CloseButton onClick={handleClose}>
          <FaTimes />
        </CloseButton>
      </Modal.Header>
      <Modal.Body>
        <TeamHeader>
          <TeamLogo src={team.logo} alt={team.name} />
          <TeamInfo>
            <h3>{team.name}</h3>
            <div className="team-details">
              <span>Code: {team.code}</span>
              <span>Country: {team.country}</span>
              <span>City: {team.city}</span>
              <span>Founded: {team.founded}</span>
              <span>Group: {team.group}</span>
            </div>
          </TeamInfo>
        </TeamHeader>

        <InfoSection>
          <h5><FaUserTie /> Coaching Staff</h5>
          <InfoRow>
            <span className="label">Head Coach</span>
            <span className="value">{team.staf.entprincipal}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Assistant Coach 1</span>
            <span className="value">{team.staf.entadjoints.entadj1}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Assistant Coach 2</span>
            <span className="value">{team.staf.entadjoints.entadj2}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Manager</span>
            <span className="value">{team.staf.manager}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Goalkeeper Coach</span>
            <span className="value">{team.staf.entgardien}</span>
          </InfoRow>
        </InfoSection>

        <InfoSection>
          <h5><FaUserMd /> Medical Staff</h5>
          <InfoRow>
            <span className="label">Physical Trainer</span>
            <span className="value">{team.staf.prepphysique}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Data Analyst</span>
            <span className="value">{team.staf.analystedonnes}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Physiotherapist</span>
            <span className="value">{team.staf.kine}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Assistant Physiotherapist</span>
            <span className="value">{team.staf.kineadjoint}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Doctor 1</span>
            <span className="value">{team.staf.medecins.medc1}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Doctor 2</span>
            <span className="value">{team.staf.medecins.medc2}</span>
          </InfoRow>
        </InfoSection>

        <InfoSection>
          <h5><FaBuilding /> Administration</h5>
          <InfoRow>
            <span className="label">President</span>
            <span className="value">{team.staf.administration.president}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Vice President</span>
            <span className="value">{team.staf.administration.vicepresident}</span>
          </InfoRow>
        </InfoSection>

        <InfoSection>
          <h5><FaSearch /> Scouting</h5>
          <InfoRow>
            <span className="label">Scout 1</span>
            <span className="value">{team.staf.recruteurs.recr1}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Scout 2</span>
            <span className="value">{team.staf.recruteurs.recr2}</span>
          </InfoRow>
        </InfoSection>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </StyledModal>
  );
};

export default ViewEquipe; 