import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import AuthTabs from "./components/AuthTabs";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import CourseList from "./components/CourseList";
import PaymentList from "./components/PaymentList";
import CourseAddForm from "./components/CourseAddForm";
import TestAddForm from "./components/TestAddForm";
import TestList from "./components/TestList";
import CourseEditForm from "./components/CourseEditForm";
import TestScore from "./components/TestScore";
import CourseEnrolledAdd from "./components/CourseEnrolledAdd";
import CourseEnrolledList from "./components/CourseEnrolledList";
import TestEditForm from "./components/TestEditForm";
import BlogAddForm from "./components/BlogAddForm";
import BlogList from "./components/BlogList";
import CourseEnrolledEdit from "./components/CourseEnrolledEdit";
import BlogEditForm from "./components/BlogEditForm";
import CourseStudentProgress from "./components/CourseStudentProgress";

const App = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to={isLoggedIn ? "/admin/dashboard" : "/auth"} replace />} />
        <Route
          path="/auth"
          element={!isLoggedIn ? <AuthTabs /> : <Navigate to="/" />}
        />
           <Route path="/profile" element={<AdminDashboard />} />
        {isLoggedIn && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Home />} />
            <Route  path="courses/add" element={<CourseAddForm />}/>
            <Route  path="courses/list" element={<CourseList />}/>
            <Route  path="CourseStudent/add" element={<CourseEnrolledAdd />}/>
            <Route  path="CourseStudent/list" element={<CourseEnrolledList />}/>
            <Route  path="CourseStudent/progress" element={<CourseStudentProgress />}/>
            <Route path="CourseStudent/edit/:courseId" element={<CourseEnrolledEdit />} />
            <Route  path="/admin/payments" element={<PaymentList />}/>
            <Route  path="blogs/add" element={<BlogAddForm />}/>
            <Route  path="blogs/list" element={<BlogList />}/>
            <Route  path="tests/add" element={<TestAddForm />}/>
            <Route  path="tests/list" element={<TestList />}/>
            <Route  path="tests/score" element={<TestScore />}/>
            <Route path="courses/edit/:courseId" element={<CourseEditForm />} />
            <Route path="tests/edit/:courseId" element={<TestEditForm />} />
            <Route path="blogs/edit/:id" element={<BlogEditForm />} />
          </Route>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer />
    </>
  );
};

export default App;