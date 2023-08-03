import { useContext, useEffect } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { LoginContext } from "./Context/LoginContext";
import { LoginProvider } from "./Context/LoginContext";
import "./App.css?version=1.0";
import { AdminView } from "./Views/Admin/AdminView/AdminView";
import { SearchView } from "./Views/SearchView";
import { SignUp } from "./Components/Signup/SignUp";
import { Login } from "./Components/Login/Login";
import { Home } from "./Components/Home/Home";
import { ProfileSettingsView } from "./Views/ProfileSettingsView";
import { PetDetailsView } from "./Views/PetDetailsView";
import { useState } from "react";
import { PetsViewAdmin } from "./Views/Admin/PetsViewAdmin/PetsViewAdmin";
import { AllPetsView } from "./Views/AllPetsView";
import { UsersViewAdmin } from "./Views/Admin/UsersView/UsersViewAdmin";
import { AddPetForm } from "./Views/Admin/AddPetForm/AddPetForm";
import { EditPet } from "./Views/Admin/EditPet/EditPet";
import { PetsView } from "./Views/PetsView";
import { UserDetailsViewAdmin } from "./Views/Admin/UsersView/UserDetailsViewAdmin";
import { useNavigate } from "react-router-dom";

function App() {
  const location = useLocation();
  const [isHomePage] = useState(location.pathname === "/");

  return (
    <LoginProvider>
      <LoggedInApp isHomePage={isHomePage} />
    </LoginProvider>
  );
}

function LoggedInApp({ isHomePage }) {
  const { isLoggedIn, userId } = useContext(LoginContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("/admin") && userId !== "1") {
      navigate("/");
    }
  }, [isLoggedIn, userId, navigate, location.pathname]);

  return (
    <div className={`App ${isHomePage ? "home-page" : ""}`}>
      <div
        className={`header-link ${
          isHomePage ? "home-page-header" : "other-page-header"
        }`}
      >
        <div className="logo">
          <NavLink to="/">
            <img className="logo-img" src="/pp.png" alt="Logo" />
          </NavLink>
          <div className={`nav-links ${menuOpen ? "show-links" : ""}`}>
            <div
              className="arrow-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "→" : "← Click for the menu"}
            </div>
            {menuOpen && (
              <>
                {userId === "1" && <NavLink to="/admin">Admin</NavLink>}
                <NavLink to="/search">Search</NavLink>
                <NavLink to="/">Home</NavLink>
                {isLoggedIn && <NavLink to="/mypets">My Pets</NavLink>}
                {isLoggedIn && <NavLink to="/allpets">Pets</NavLink>}
                {isLoggedIn && (
                  <NavLink to="/profilesettings">Profile Settings</NavLink>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="routes">
        <Routes>
          <Route
            path="/admin"
            element={
              isLoggedIn && userId === "1" ? <AdminView /> : <Navigate to="/" />
            }
          >
            <Route path="users" element={<UsersViewAdmin />} />
            <Route path="users/:id" element={<UserDetailsViewAdmin />} />
            <Route path="pets" element={<PetsViewAdmin />} />
            <Route path="add-pet" element={<AddPetForm />} />
            <Route path="edit-pet/:id" element={<EditPet />} />
          </Route>
          <Route path="/search" element={<SearchView />} />
          <Route path="/profilesettings" element={<ProfileSettingsView />} />
          <Route path="/" element={<Home />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>
          <Route path="/mypets/:id" element={<PetDetailsView />} />
          <Route path="/mypets" element={<PetsView />} />
          <Route path="/allpets" element={<AllPetsView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
