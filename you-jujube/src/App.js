import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Home";
import Explore from "./Explore";
import VideoLesson from "./VideoLesson";
import MyVideos from "./MyVideos";
import { useAuth0 } from "@auth0/auth0-react";
import YouTubeVideos from './components/video';
import LearnVideo from './LearnVideo';
import Settings from './Settings';

const App = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/youtube" element={<YouTubeVideos />} />
        <Route path="/home" element={<Home />} />
        <Route path="/video/:videoId" element={<LearnVideo />} />
        {/* <Route
          path="/explore"
          element={isAuthenticated ? <Explore /> : <Navigate to="/home" />}
        /> */}
        <Route path="/video_lesson" element={<VideoLesson />} />
        <Route path="/my_videos" element={<MyVideos />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default App;
