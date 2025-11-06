// ProjectManagement.jsx — FINAL 100% WORKING VERSION (STUDENT LIST GUARANTEED)
import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Trash2,
  Save,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  projectEvaluationAPI,
  evaluationParameterAPI,
  groupAPI,
} from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FilterDropdown = ({ title, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 border border-white/30 backdrop-blur-md w-40"
      >
        {selected || title}
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 z-10">
          <ul className="py-2">
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-white hover:bg-accent-teal/30 ${
                  selected === opt ? "bg-accent-teal font-bold" : ""
                }`}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function ProjectManagement() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [marksData, setMarksData] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");

  const courseOptions = ["All", "MCA", "BCA", "B.Tech", "M.Tech"];
  const yearOptions = ["All", "2023", "2024", "2025"];
  const statusOptions = ["All", "Not Started", "In Progress", "Completed"];

  // Fetch groups + parameters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsRes, paramsRes] = await Promise.all([
          groupAPI.getAll({
            course: courseFilter === "All" ? undefined : courseFilter,
            year: yearFilter === "All" ? undefined : yearFilter,
          }),
          evaluationParameterAPI.getAll(),
        ]);

        const groups = groupsRes.data.data || [];
        setProjects(groups);
        setEvaluationParameters(paramsRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseFilter, yearFilter]);

  // Fetch group details with populated students
  useEffect(() => {
    if (!selectedGroup?._id) return;

    const fetchGroupDetails = async () => {
      try {
        const res = await projectEvaluationAPI.getByProject(selectedGroup._id);
        const groupData = res.data.data;

        setSelectedGroup({
          ...groupData,
          students: groupData.students || [],
        });

        const evals = groupData.evaluations || [];
        const marks = {};
        evals.forEach((e) => {
          const studentId = String(e.studentId?._id || e.studentId);
          const paramId = String(e.parameterId?._id || e.parameterId);
          if (studentId && paramId) {
            marks[`${studentId}_${paramId}`] = e.givenMarks;
          }
        });
        setMarksData(marks);
      } catch (err) {
        console.error("Failed to fetch group details:", err);
        toast.error("Failed to load group details");
      }
    };

    fetchGroupDetails();
  }, [selectedGroup?._id]);

  const handleMarkChange = (studentId, paramId, value) => {
    const numValue = value === "" ? "" : Math.max(0, Number(value));
    const param = evaluationParameters.find((p) => p._id === paramId);
    if (numValue && numValue > param.marks) {
      toast.error(`Max ${param.marks} marks allowed for ${param.name}!`);
      return;
    }
    setMarksData((prev) => ({
      ...prev,
      [`${studentId}_${paramId}`]: numValue,
    }));
  };

  const handleSaveAllEvaluations = async () => {
    if (!selectedGroup?._id) return toast.error("No group selected");

    setSaving(true);
    try {
      const evaluations = selectedGroup.students
        .map((student) => {
          const studentId = student._id.toString();
          return evaluationParameters.map((param) => ({
            student: studentId,
            parameter: param._id,
            marks: Number(marksData[`${studentId}_${param._id}`] || 0),
          }));
        })
        .flat();

      await projectEvaluationAPI.saveAll(selectedGroup._id, evaluations);
      toast.success("All marks saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = {
    given:
      selectedGroup?.students?.reduce((sum, student) => {
        const studentId = student._id.toString();
        return (
          sum +
          evaluationParameters.reduce((acc, param) => {
            return acc + (Number(marksData[`${studentId}_${param._id}`]) || 0);
          }, 0)
        );
      }, 0) || 0,
    total:
      (selectedGroup?.students?.length || 0) *
      evaluationParameters.reduce((s, p) => s + p.marks, 0),
  };

  const techOptions = [
    "All",
    ...new Set(projects.map((p) => p.projectTechnology).filter(Boolean)),
  ];
  const filteredProjects = projects.filter((p) => {
    const tech = p.projectTechnology || "";
    return (
      (statusFilter === "All" || p.status === statusFilter) &&
      (techFilter === "All" || tech === techFilter)
    );
  });

  const handleBack = () => navigate("/dashboard");
  const handleViewDetails = (group) => {
    setSelectedGroup(group);
  };
  const handleBackToList = () => setSelectedGroup(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-3xl text-white animate-pulse">
        Loading Projects...
      </div>
    );
  }

  const renderDetailsView = () => (
    <div className="w-full max-w-7xl mx-auto">
      <ToastContainer position="top-right" theme="dark" />

      <div className="flex justify-between mb-8">
        <button
          onClick={handleBackToList}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-3 px-8 rounded-xl font-bold hover:scale-105 transition"
        >
          <ChevronLeft size={24} /> Back to List
        </button>
        <h1 className="text-5xl font-extrabold text-white">
          {selectedGroup.projectTitle}
        </h1>
        <button
          onClick={() => toast.info("Delete coming soon")}
          className="flex items-center bg-red-600 text-white py-3 px-8 rounded-xl font-bold hover:scale-105"
        >
          <Trash2 size={24} /> Delete Project
        </button>
      </div>

      <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl border border-white/30 mb-10">
        <div className="grid grid-cols-2 gap-8 text-white text-lg">
          <div>
            <strong>Title:</strong> {selectedGroup.projectTitle}
          </div>
          <div>
            <strong>Tech:</strong> {selectedGroup.projectTechnology}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span className="text-accent-teal font-bold">
              {selectedGroup.status}
            </span>
          </div>
          <div>
            <strong>Members:</strong> {selectedGroup.students?.length || 0}
          </div>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl border border-white/30">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-white flex items-center">
            <CheckCircle size={40} className="mr-4 text-accent-teal" />
            Evaluation Marks
            {saving && (
              <span className="ml-4 text-yellow-400 animate-pulse">
                Saving...
              </span>
            )}
          </h2>
          <div className="flex items-center gap-8">
            <div className="bg-white/10 px-8 py-5 rounded-2xl border border-white/30 text-center">
              <p className="text-white/70 text-sm">Grand Total</p>
              <p className="text-3xl font-bold text-accent-teal">
                {grandTotal.given} / {grandTotal.total}
              </p>
            </div>
            <button
              onClick={handleSaveAllEvaluations}
              disabled={saving}
              className="flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold text-xl py-5 px-12 rounded-2xl hover:scale-110 transition shadow-glow border-2 border-white/50 disabled:opacity-60"
            >
              <Save size={32} /> SAVE ALL MARKS
            </button>
          </div>
        </div>

        {selectedGroup.students && selectedGroup.students.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border-2 border-white/20">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-gradient-to-r from-accent-teal/40 to-cyan-600/40">
                  <th className="px-10 py-6 text-left font-bold text-xl rounded-tl-2xl">
                    Student
                  </th>
                  {evaluationParameters.map((param) => (
                    <th
                      key={param._id}
                      className="px-10 py-6 text-center font-bold text-xl"
                    >
                      {param.name}
                      <br />
                      <span className="text-sm opacity-80">
                        / {param.marks}
                      </span>
                    </th>
                  ))}
                  <th className="px-10 py-6 text-center font-bold text-xl rounded-tr-2xl bg-accent-teal/60">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.students.map((student, idx) => {
                  const studentId = student._id.toString();
                  const studentName = student.name || "Unknown Student";
                  const enrollment = student.enrollmentNumber || "N/A";

                  // Calculate total given marks for this student
                  const studentTotal = evaluationParameters.reduce(
                    (sum, param) => {
                      return (
                        sum +
                        (Number(marksData[`${studentId}_${param._id}`]) || 0)
                      );
                    },
                    0
                  );

                  // Max total marks possible for this student
                  const maxTotal = evaluationParameters.reduce(
                    (s, p) => s + p.marks,
                    0
                  );

                  return (
                    <tr
                      key={studentId}
                      className={`border-t-2 border-white/10 hover:bg-white/10 ${
                        idx % 2 === 0 ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="px-10 py-8 font-bold text-lg">
                        <p className="text-white">{studentName}</p>
                        <p className="text-sm text-white/60">{enrollment}</p>
                      </td>

                      {evaluationParameters.map((param) => {
                        const cellKey = `${studentId}_${param._id}`;
                        const value = marksData[cellKey] ?? "";

                        return (
                          <td key={cellKey} className="px-10 py-8 text-center">
                            <input
                              type="number"
                              min="0"
                              max={param.marks}
                              value={value}
                              onChange={(e) =>
                                handleMarkChange(
                                  studentId,
                                  param._id,
                                  e.target.value
                                )
                              }
                              className="w-28 px-5 py-4 text-xl font-bold text-center rounded-2xl bg-white/10 border-2 border-white/40 focus:ring-4 focus:ring-accent-teal/50 focus:border-accent-teal transition-all"
                              placeholder="0"
                            />
                          </td>
                        );
                      })}

                      {/* Total column */}
                      <td className="px-10 py-8 text-center">
                        <span className="inline-block bg-gradient-to-r from-accent-teal to-cyan-500 text-white font-extrabold text-2xl px-8 py-4 rounded-2xl shadow-2xl">
                          {studentTotal} / {maxTotal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-2xl text-white/70">
            No students in this group
          </div>
        )}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between mb-10">
        <button
          onClick={handleBack}
          className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-3 px-8 rounded-xl font-bold hover:scale-105"
        >
          <ChevronLeft size={24} /> Back
        </button>
        <h1 className="text-5xl font-extrabold text-white">
          Manage <span className="text-accent-teal">Projects</span>
        </h1>
        <div className="w-32"></div>
      </div>

      <div className="flex flex-wrap gap-6 mb-12 justify-center">
        <FilterDropdown
          title="Course"
          options={courseOptions}
          selected={courseFilter}
          onSelect={setCourseFilter}
        />
        <FilterDropdown
          title="Year"
          options={yearOptions}
          selected={yearFilter}
          onSelect={setYearFilter}
        />
        <FilterDropdown
          title="Status"
          options={statusOptions}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
        <FilterDropdown
          title="Technology"
          options={techOptions}
          selected={techFilter}
          onSelect={setTechFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProjects.map((project) => (
          <div
            key={project._id}
            onClick={() => handleViewDetails(project)}
            className="bg-white/20 backdrop-blur-md p-10 rounded-3xl border border-white/30 cursor-pointer hover:scale-105 transition-all shadow-2xl"
          >
            <h3 className="text-3xl font-extrabold text-accent-teal mb-6">
              {project.projectTitle}
            </h3>
            <div className="space-y-4 text-white/90">
              <p>
                <strong>Tech:</strong> {project.projectTechnology || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-cyan-400">{project.status}</span>
              </p>
              <p>
                <strong>Members:</strong> {project.students?.length || 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 text-white font-sans">
      {selectedGroup ? renderDetailsView() : renderListView()}
    </div>
  );
}

export default ProjectManagement;
