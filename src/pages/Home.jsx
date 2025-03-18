import React from "react";
import Header from "../components/header/Header";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Roles } from "../assets/constants";

import ProtectedRoute from "../routes/ProtectedRoute";
import RoleBasedRoute from "../routes/RoleBasedRoute";

import AdminContainer from "../features/admin/AdminContainer";
import FacultyContainer from "../features/faculty/FacultyContainer";
import AuthContainer from "../features/authentication/AuthContainer";

import StudentContainer from "../features/students/StudentContainer";

import AdminDashboard from "../features/admin/AdminDashboard/AdminDashboard";
import AdminHome from "../features/admin/AdminDashboard/AdminHome";

import UserManagement from "../features/admin/UserManagement/UserManagement";

import Login from "./../features/authentication/Login";
import Register from "./../features/authentication/Register";

import PageNotFound from "./PageNotFound";
import UsersList from "../features/admin/UserManagement/UsersList";
import AddUser from "../features/admin/UserManagement/AddUser";

import DataManagement from "../features/admin/DataManagement/DataManagement";
import Basic from "../features/admin/DataManagement/Basic";
import Faculties from "../features/admin/DataManagement/Faculty/Faculties";
import Teachers from "../features/admin/DataManagement/Teachers";
import Students from "../features/admin/DataManagement/Students";
import Tags from "../features/admin/DataManagement/Tags";
import Space from "../features/admin/DataManagement/Space";
import Activities from "../features/admin/DataManagement/Activities";
import Subactivities from "../features/admin/DataManagement/Subactivities";
import Subjects from "../features/admin/DataManagement/Subjects/Subjects";
import Years from "../features/admin/DataManagement/Years";
import DataImport from "../features/admin/DataManagement/DataImport";

import TimeConstraints from "../features/admin/TimeConstraints/TimeConstraints";
import ConstraintsList from "../features/admin/TimeConstraints/ConstraintsList";
import BreakConstraints from "../features/admin/TimeConstraints/BreakConstraints";

import Timetable from "../features/admin/Timetable/Timetable";
import Generate from "../features/admin/Timetable/Generate";
import ViewTimetable from "../features/admin/Timetable/ViewTimetable";
import FacultyUnavailability from "../features/admin/Timetable/FacultyUnavailability";
import StudentDashboard from "./../features/students/StudentDashboard/StudentDashboard";
import ViewSliitTimetable from "../features/admin/Timetable/ViewSliitTimetable";

import FacultyDashboard from "../features/faculty/FacultyDashboard/FacultyDashboard";
import ReportsIndex from "../features/admin/Reports/ReportsIndex";
import TeacherAllocationReport from "../features/admin/Reports/TeacherAllocationReport";
import SpaceOccupancyReport from "../features/admin/Reports/SpaceOccupancyReport";

function Home() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
    <div className="h-full flex flex-col">
      <BrowserRouter>
        {/* <Header /> */}
        <Routes>
          {!isAuthenticated ? (
            <Route path="/" element={<AuthContainer />}>
              <Route index element={<Navigate to="login" />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
          ) : (
            <Route
              path="/"
              element={<ProtectedRoute isAuth={isAuthenticated} />}
            >
              <Route
                index
                element={
                  role === Roles.ADMINISTRATOR ? (
                    <Navigate to="admin" />
                  ) : role === Roles.ACADEMIC_STAFF ? (
                    <Navigate to="faculty" />
                  ) : role === Roles.STUDENT ? (
                    <Navigate to="student" />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="admin/*"
                element={
                  <RoleBasedRoute allowedRoles={[Roles.ADMINISTRATOR]}>
                    <AdminContainer />
                  </RoleBasedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard/*" element={<AdminDashboard />}>
                  <Route index element={<AdminHome />} />
                </Route>
                <Route path="users/*" element={<UserManagement />}>
                  <Route index element={<Navigate to="list" />} />
                  <Route path="list" element={<UsersList />} />
                  <Route path="add" element={<AddUser />} />
                </Route>
                <Route path="data/*" element={<DataManagement />}>
                  <Route index element={<Navigate to="basic" />} />
                  <Route path="basic" element={<Basic />} />
                  <Route path="faculties" element={<Faculties />} />
                  <Route path="students" element={<Students />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="space" element={<Space />} />
                  <Route path="activities" element={<Activities />} />
                  <Route path="subactivities" element={<Subactivities />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="years" element={<Years />} />
                  <Route path="tags" element={<Tags />} />
                  <Route path="import" element={<DataImport />} />

                </Route>
                <Route path="timetable/*" element={<Timetable />}>
                  <Route index element={<Navigate to="generate" />} />
                  <Route path="generate" element={<Generate />} />
                  <Route path="view" element={<ViewTimetable />} />
                  <Route path="view-sliit" element={<ViewSliitTimetable />} />
                  <Route path="faculty-unavailability" element={<FacultyUnavailability />} />
                </Route>

                <Route path="reports/*" element={<ReportsIndex />}>
                  <Route index element={<Navigate to="overview" />} />
                  <Route path="overview" element={<ReportsIndex />} />
                  <Route path="teacher-allocation" element={<TeacherAllocationReport />} />
                  <Route path="space-occupancy" element={<SpaceOccupancyReport />} />
                </Route>

                <Route path="time/*" element={<TimeConstraints />}>
                  <Route index element={<Navigate to="all" />} />
                  <Route path="all" element={<ConstraintsList />} />
                  <Route path="breaks" element={<BreakConstraints />} />
                </Route>
              </Route>

              <Route
                path="faculty/*"
                element={
                  <RoleBasedRoute allowedRoles={[Roles.ACADEMIC_STAFF]}>
                    <FacultyContainer />
                  </RoleBasedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<FacultyDashboard />} />
              </Route>
              <Route
                path="student/*"
                element={
                  <RoleBasedRoute allowedRoles={[Roles.STUDENT]}>
                    <StudentContainer />
                  </RoleBasedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="dashboard" element={<StudentDashboard />} />
              </Route>
            </Route>
          )}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default Home;
