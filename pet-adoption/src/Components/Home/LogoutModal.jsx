import "./modal.css";
export const LogoutModal = ({ handleLogout, setShowModal }) => {
  return (
    <div className="modal-background">
      <div className="logout-modal">
        <h2>Logout</h2>
        <p>Are you sure you want to leave?</p>
        <div className="modal-buttons">
          <button
            onClick={() => {
              handleLogout();
              setShowModal(false);
            }}
          >
            Yes
          </button>
          <button onClick={() => setShowModal(false)}>No</button>
        </div>
      </div>
    </div>
  );
};
