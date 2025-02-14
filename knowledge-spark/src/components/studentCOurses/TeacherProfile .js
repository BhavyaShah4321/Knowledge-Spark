// src/pages/TeacherProfile.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = "http://localhost:8000";

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user/${teacherId}`);
        setTeacher(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [teacherId]);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <img 
          src={teacher.profile_picture} 
          alt={teacher.username} 
          className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"
        />
        <h2 className="text-center text-2xl font-bold mt-4 text-gray-800">{teacher.username}</h2>
        <p className="text-center text-gray-500">{teacher.email}</p>
        <p className="text-center text-gray-600 mt-2">{teacher.bio}</p>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Gender: <span className="font-medium">{teacher.gender}</span></p>
          <p className="text-sm text-gray-400">DOB: <span className="font-medium">{teacher.dob}</span></p>
        </div>

        <div className="flex justify-center mt-6">
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
