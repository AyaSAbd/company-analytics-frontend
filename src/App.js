import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import FormSelection from "./pages/FormSelection";
import EmployeeForm from "./pages/EmployeeForm";
import CustomerForm from "./pages/CustomerForm";
import Analysis from "./pages/Analysis";
import "./styles/App.css";
import ProfileForm from "./pages/ProfileForm";
import RegisterCompany from "./pages/RegisterCompany";
import QuestionnaireViewer from "./pages/QuestionnaireViewer";
import PublicFormViewer from "./pages/PublicFormViewer";
import ThankYou from "./pages/ThankYou";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<RegisterCompany />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/forms" element={<FormSelection />} />
        <Route path="/forms/employee" element={<EmployeeForm />} />
        <Route path="/forms/customer" element={<CustomerForm />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/profile-form" element={<ProfileForm />} />
        <Route path="/forms/view/:questionnaireId" element={<QuestionnaireViewer />} />
        <Route path="/forms/public/:companyId/:questionnaireId" element={<PublicFormViewer />} />
        <Route path="/forms/thank-you" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
